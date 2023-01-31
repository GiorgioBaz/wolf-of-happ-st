const express = require("express");
const app = express();
const Stocks = require("../models/stocks");
require("dotenv").config({ path: "../config.env" });
const yahooFinance = require("yahoo-finance2").default;

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

app.get("/allStocksPM", async function (req, res) {
    const cleanedData = await getCleanedStockData(true);
    res.send(cleanedData);
});

app.get("/gainers", async function (req, res) {
    const cleanedData = await getCleanedStockData(false, true);
    res.send(cleanedData);
});

app.get("/losers", async function (req, res) {
    const cleanedData = await getCleanedStockData();
    res.send(cleanedData);
});

app.get("/consecutiveGainers", async function (req, res) {
    //check historical data for the last 8 days and store that in an array in mongodb :)
    const gainers = await getCleanedStockData(false, true);

    async function getHistoricalData(ticker, fromDate, toDate) {
        return await yahooFinance.historical(ticker, {
            period1: fromDate,
            period2: toDate,
        });
    }

    function isConsecutiveGainer(quotes) {
        const consecutiveGainers = [];
        for (let i = 0; i < quotes.length; i++) {
            if (i + 1 === quotes.length) break;
            if (quotes[i].close - quotes[i + 1].close < 0) {
                consecutiveGainers.push(true);
            } else {
                consecutiveGainers.push(false);
            }
        }
        return !consecutiveGainers.some((gainer) => !gainer);
    }

    const consecutiveGainers = await Promise.all(
        gainers.filter(async (gainer) => {
            const historicalData = await getHistoricalData(
                gainer,
                "2023-01-25",
                "2023-01-31"
            );
            return isConsecutiveGainer(historicalData);

            // This filter is absolutely fucked it keeps returning the same data despite changes to isConsecutiveGainer(), will need to investigate how to fix this later on
        })
    );
    console.log(
        isConsecutiveGainer([
            {
                close: 102.419998,
            },
            {
                close: 101.129997,
            },
            {
                close: 103.199997,
            },
            {
                close: 103.209999,
            },
        ])
    );
    res.send(consecutiveGainers);
});

module.exports = app;
