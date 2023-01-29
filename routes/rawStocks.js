const express = require("express");
const app = express();
const Stocks = require("../models/stocks");
require("dotenv").config({ path: "../config.env" });
const yahooFinance = require("yahoo-finance2").default;

app.get("/allStocksPM", async function (req, res) {
    const stockTickers = await require("../StockTickers/topStocks");
    // Stocks.find({}, (err, stock) => {
    //     if (err) throw err;
    //     if (!stock) res.send("Ya dun goofed");
    //     else {
    //         res.send(stock);
    //     }
    // });

    const stockData = await yahooFinance.quote(stockTickers);

    const cleanedStockData = stockData.map((stock) => {
        return {
            symbol: stock.symbol,
            changePercent: stock.regularMarketChangePercent,
        };
    });
    res.send(cleanedStockData);
});

module.exports = app;
