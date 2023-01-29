const csv = require("fast-csv");
module.exports = function readFromCSV(stocksCSV) {
    return new Promise((resolve) => {
        let returnLit = [];
        csv.parseFile(stocksCSV, { headers: true })
            .on("data", (data) => {
                returnLit.push(data["ticker"].trim());
            })
            .on("end", () => {
                resolve(returnLit);
            });
    });
};
