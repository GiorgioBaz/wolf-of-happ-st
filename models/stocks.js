const mongoose = require("mongoose");
const { Schema } = mongoose;
const Stocks = new mongoose.Schema({
    ticker: {
        type: String,
        required: true, //mandatory attribute
        trim: true, //cuts whitespace at the end of the input field
        default: "",
    },
});

module.exports = mongoose.model("stocks", Stocks);
