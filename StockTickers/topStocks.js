const utils = require("./utils");

async function usStocks() {
    const usStocks = await utils("./StockTickers/CSV/Top1000USStocksbyMC.csv");
    return usStocks;
}

async function hkStocks() {
    const hkStocks = await utils("./StockTickers/CSV/Top500HKStocksbyMC.csv");
    return hkStocks;
}

module.exports = {
    usStocks: usStocks(),
    hkStocks: hkStocks(),
};
