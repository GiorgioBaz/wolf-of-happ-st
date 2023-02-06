const express = require("express");
const app = express();
const Stocks = require("../models/stocks");
require("dotenv").config({ path: "../config.env" });
const yahooFinance = require("yahoo-finance2").default;
const moment = require("moment-business-days");

const today = new Date();

//

async function getCleanedStockData(all = false, gaining = false) {
    const stockTickers = await require("../StockTickers/topStocks");
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

async function getHistoricalData(ticker, fromDate, toDate) {
    return await yahooFinance.historical(ticker, {
        period1: fromDate,
        period2: toDate,
    });
}

function getDateXDaysAgo(daysAgo) {
    return moment(today).businessSubtract(daysAgo)._d;
}

app.get("/allStocksPM", async function (req, res) {
    const cleanedData = await getCleanedStockData(true);
    res.send(cleanedData);
});

app.get("/gainers", async function (req, res) {
    const cleanedData = await getCleanedStockData(false, true);
    //We need to figure out WTF IS GOING ON WITH THE TICKERS FOR AU
    // const cleanedData = await yahooFinance.quote("FSA.AX");
    res.send(cleanedData);
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
    //check historical data for the last 8 days and store that in an array in mongodb :)
    const numConsecutiveDays = req.query.numConsecutiveDays;
    const gainers = await getCleanedStockData(false, true);

    function isConsecutiveGainer(quotes) {
        const consecutiveGainers = [];
        for (let i = 0; i < quotes.length; i++) {
            if (i + 1 === quotes.length) {
                if (quotes[i - 1].close - quotes[i] < 0) {
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
        return !consecutiveGainers.some((gainer) => !gainer); // resolves as true if there is a single "false" entry in the array - but once we add ! it resolves as false which is the desired outcome as if there is a false that means at one point the stock wasnt gaining
    }
    try {
        const historicalData = await Promise.all(
            gainers.map(async (gainer) => {
                const data = await getHistoricalData(
                    gainer,
                    getDateXDaysAgo(numConsecutiveDays),
                    today
                );
                if (isConsecutiveGainer(data)) {
                    return gainer;
                }
            })
        );
        const consecutiveGainers = historicalData.filter((gainer) => gainer);

        res.send(consecutiveGainers);
    } catch (err) {
        // console.error(err);
        res.send("Please wait before requesting more data");
    }
});

app.get("/consecutiveLosers", async function (req, res) {
    //check historical data for the last 8 days and store that in an array in mongodb :)
    const numConsecutiveDays = req.query.numConsecutiveDays;
    const losers = await getCleanedStockData();

    function isConsecutiveLoser(quotes) {
        const consecutiveLosers = [];
        for (let i = 0; i < quotes.length; i++) {
            if (i + 1 === quotes.length) {
                if (quotes[i - 1].close - quotes[i] > 0) {
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
        return !consecutiveLosers.some((loser) => !loser);
    }
    try {
        const historicalData = await Promise.all(
            losers.map(async (loser) => {
                const data = await getHistoricalData(
                    loser,
                    getDateXDaysAgo(numConsecutiveDays),
                    today
                );
                if (isConsecutiveLoser(data)) {
                    return loser;
                }
            })
        );
        const consecutiveLosers = historicalData.filter((loser) => loser);

        res.send(consecutiveLosers);
    } catch (err) {
        // console.error(err);
        res.send("Please wait before requesting more data");
    }
});

module.exports = app;
