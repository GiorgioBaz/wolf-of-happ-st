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
        return stock.symbol;
    });

    if (all) return cleanedStockData;

    if (gaining) {
        return cleanedStockData.filter((stock) => stock.changePercent > 0);
    } else if (!gaining) {
        return cleanedStockData.filter((stock) => stock.changePercent < 0);
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
    yahooFinance.historical("AAPL", {
        period1: "2023-01-22",
        period2: "2023-01-31",
    });
});

module.exports = app;
