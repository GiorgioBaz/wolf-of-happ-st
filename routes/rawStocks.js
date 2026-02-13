const express = require("express");
const app = express();
require("dotenv").config({ path: "../config.env" });
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});
const moment = require("moment-business-days");
const { usStocks, hkStocks } = require("../StockTickers/topStocks");
const convertToHistoricalResult = require("../utils/convertChartToHistorical.js");

const today = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

async function getCleanedStockData(
    all = false,
    gaining = false,
    country = "US",
) {
    let stockTickers = [];

    switch (country) {
        case "US":
            stockTickers = await usStocks;
            break;
        case "HK":
            stockTickers = await hkStocks;
            break;
    }

    const stockData = await yahooFinance.quote(stockTickers);
    let cleanedStockData = stockData.map((stock) => {
        return {
            symbol: stock.symbol,
            changePercent: stock.regularMarketChangePercent,
        };
    });

    if (all) return cleanedStockData;

    if (gaining) {
        return cleanedStockData
            .filter((stock) => stock.changePercent > 0)
            .map((stock) => stock.symbol);
    } else if (!gaining) {
        return cleanedStockData
            .filter((stock) => stock.changePercent < 0)
            .map((stock) => stock.symbol);
    }
}

async function getHistoricalData(ticker, fromDate, toDate, interval) {
    let historicalData = await yahooFinance.chart(ticker, {
        period1: fromDate,
        period2: toDate,
        interval,
    });

    let formattedHistoricalData = convertToHistoricalResult(historicalData);

    return formattedHistoricalData;
}

function getDateXDaysAgo(daysAgo, weeksAgo) {
    if (daysAgo) {
        return moment(today).businessSubtract(daysAgo)._d;
    } else if (weeksAgo) {
        const weeksToDays = weeksAgo * 5;
        return moment(today).businessSubtract(weeksToDays)._d;
    }
}

function splitStockListIfToMany(batch, stocks) {
    let batch1;
    let batch2;
    if (batch) {
        batch1 = stocks.slice(0, stocks.length / 2);
        batch2 = stocks.slice(stocks.length / 2, stocks.length);
    }
    return { batch1, batch2 };
}

async function calcConsecutiveStocks(
    batch,
    isConsecutiveCalc,
    isWeeks,
    useDaysValue,
    daysOrWeeksValue,
    interval,
) {
    const historicalData = await Promise.all(
        batch.map(async (loser) => {
            const data = await getHistoricalData(
                loser,
                getDateXDaysAgo(useDaysValue, daysOrWeeksValue),
                today,
                interval,
            );
            if (isConsecutiveCalc(data, isWeeks)) {
                return loser;
            }
        }),
    );
    return historicalData;
}

// Experimental - untested
function excludeStockTickers(excludedTickers, stockTickers) {
    excludedTickers.forEach((ticker) => {
        const excludedTickerIndex = stockTickers.findIndex(ticker);
        excludedTickerIndex > -1 && stockTickers.splice(excludedTickerIndex);
    });
}

app.get("/allStocksPM", async function (req, res) {
    const cleanedData = await getCleanedStockData(true);
    res.send(cleanedData);
});

app.get("/gainers", async function (req, res) {
    const cleanedData = await getCleanedStockData(false, true);
    //TODO: Implement Top 1000 AU stocks
    // const cleanedData = await yahooFinance.quote("FSA.AX");
    res.send(cleanedData);
});

app.get("/numGainersAndLosers", async function (req, res) {
    const gainers = await getCleanedStockData(false, true);
    const losers = await getCleanedStockData();
    res.send({ gainers: gainers.length, losers: losers.length });
});

app.get("/losers", async function (req, res) {
    try {
        const cleanedData = await getCleanedStockData();
        res.send(cleanedData);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.get("/consecutiveGainers", async function (req, res) {
    const {
        numConsecutiveDays,
        interval,
        numConsecutiveWeeks,
        batch,
        country,
    } = req.query;
    const daysOrWeeksValue =
        numConsecutiveDays != 0 ? numConsecutiveDays : numConsecutiveWeeks;
    const isWeeks = numConsecutiveDays != 0 ? false : true;
    const useDaysValue = !isWeeks ? daysOrWeeksValue : null;

    const gainers = await getCleanedStockData(false, true, country);

    function isConsecutiveGainer(quotes, weekly) {
        const consecutiveGainers = [];
        if (quotes.length <= 1) return false;
        for (let i = 0; i < quotes.length; i++) {
            if (!quotes[i].close) {
                i += 1;
                break;
            }
            if (i + 1 === quotes.length) {
                if (quotes[i - 1].close - quotes[i].close < 0) {
                    consecutiveGainers.push(true);
                }
                break;
            }
            if (quotes[i].close - quotes[i + 1].close < 0) {
                consecutiveGainers.push(true);
            } else {
                consecutiveGainers.push(false);
            }
        }
        const isLastElemFalse =
            consecutiveGainers.findIndex((gainer) => !gainer) ===
            consecutiveGainers.length - 1
                ? true
                : false;
        if (weekly && today.getDay() !== 2 && isLastElemFalse) {
            return true;
        }
        return !consecutiveGainers.some((gainer) => !gainer); // resolves as true if there is a single "false" entry in the array - but once we add ! it resolves as false which is the desired outcome as if there is a false that means at one point the stock wasnt gaining
    }

    try {
        let historicalData;
        let batches = splitStockListIfToMany(batch, gainers);
        let batch1 = batches.batch1;
        let batch2 = batches.batch2;
        if (batch === "batch1") {
            historicalData = await calcConsecutiveStocks(
                batch1,
                isConsecutiveGainer,
                isWeeks,
                useDaysValue,
                daysOrWeeksValue,
                interval,
            );
        } else if (batch === "batch2") {
            historicalData = await calcConsecutiveStocks(
                batch2,
                isConsecutiveGainer,
                isWeeks,
                useDaysValue,
                daysOrWeeksValue,
                interval,
            );
        } else {
            historicalData = await calcConsecutiveStocks(
                gainers,
                isConsecutiveGainer,
                isWeeks,
                useDaysValue,
                daysOrWeeksValue,
                interval,
            );
        }
        const consecutiveGainers = historicalData.filter((gainer) => gainer);
        res.send(consecutiveGainers);
    } catch (err) {
        console.error(err);
        res.send("Please wait before requesting more data");
    }
});

app.get("/consecutiveLosers", async function (req, res) {
    const {
        numConsecutiveDays,
        interval,
        numConsecutiveWeeks,
        batch,
        country,
    } = req.query;
    const daysOrWeeksValue =
        numConsecutiveDays != 0 ? numConsecutiveDays : numConsecutiveWeeks;
    const isWeeks = numConsecutiveDays != 0 ? false : true;
    const useDaysValue = !isWeeks ? daysOrWeeksValue : null;

    const losers = await getCleanedStockData(false, false, country);

    function isConsecutiveLoser(quotes, weekly) {
        const consecutiveLosers = [];
        if (quotes.length <= 1) return false;
        for (let i = 0; i < quotes.length; i++) {
            if (!quotes[i].close) {
                i += 1;
                break;
            }
            if (i + 1 === quotes.length) {
                if (quotes[i - 1].close - quotes[i].close > 0) {
                    consecutiveLosers.push(true);
                }
                break;
            }
            if (quotes[i].close - quotes[i + 1].close > 0) {
                consecutiveLosers.push(true);
            } else {
                consecutiveLosers.push(false);
            }
        }
        const isLastElemFalse =
            consecutiveLosers.findIndex((loser) => !loser) ===
            consecutiveLosers.length - 1
                ? true
                : false;
        if (weekly && today.getDay() !== 2 && isLastElemFalse) {
            return true;
        }
        return !consecutiveLosers.some((loser) => !loser);
    }
    try {
        let historicalData;
        let batches = splitStockListIfToMany(batch, losers);
        let batch1 = batches.batch1;
        let batch2 = batches.batch2;
        if (batch === "batch1") {
            historicalData = await calcConsecutiveStocks(
                batch1,
                isConsecutiveLoser,
                isWeeks,
                useDaysValue,
                daysOrWeeksValue,
                interval,
            );
        } else if (batch === "batch2") {
            historicalData = await calcConsecutiveStocks(
                batch2,
                isConsecutiveLoser,
                isWeeks,
                useDaysValue,
                daysOrWeeksValue,
                interval,
            );
        } else {
            historicalData = await calcConsecutiveStocks(
                losers,
                isConsecutiveLoser,
                isWeeks,
                useDaysValue,
                daysOrWeeksValue,
                interval,
            );
        }

        const consecutiveLosers = historicalData.filter((loser) => loser);

        res.send(consecutiveLosers);
    } catch (err) {
        console.error(err);
        res.send("Please wait before requesting more data");
    }
});

module.exports = app;
