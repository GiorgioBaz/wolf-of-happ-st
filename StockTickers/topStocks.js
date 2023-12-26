const utils = require("./utils");

async function allStocks() {
    let allStocks = [];
    const usStocks = await utils("./StockTickers/CSV/Top1000USStocksbyMC.csv");
    allStocks.push(...usStocks);
    //TODO: Implement top 1000 AU stocks
    // const auStocks = await utils("./StockTickers/CSV/Top1000AUStocksbyMC.csv");
    // allStocks.push(...auStocks);
    return allStocks;
}

module.exports = allStocks();
