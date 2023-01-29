const express = require("express");
const app = express();
const Stocks = require("../models/stocks");
require("dotenv").config({ path: "../config.env" });

app.get("/allStocks", function (req, res) {
    Stocks.find({}, (err, stock) => {
        if (err) throw err;
        if (!stock) res.send("Ya dun goofed");
        else {
            res.send(stock);
        }
    });
});

module.exports = app;
