const utils = require("./utils");

async function allStocks() {
    let allStocks = [];
    const usStocks = await utils("./StockTickers/CSV/Top1000USStocksbyMC.csv");
    allStocks.push(...usStocks);
    // const auStocks = await utils("./StockTickers/CSV/Top1000AUStocksbyMC.csv");
    // allStocks.push(...auStocks);
    return allStocks;
}

module.exports = allStocks();
