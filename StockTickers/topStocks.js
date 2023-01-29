const utils = require("./utils");

function usStocks() {
    return utils("./StockTickers/CSV/Top1000USStocksbyMC.csv");
}

module.exports = usStocks();
