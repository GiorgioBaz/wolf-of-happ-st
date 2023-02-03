const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
const Stocks = require("./routes/rawStocks");

const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());
app.use(
    cors({
        origin: "http://localhost:3000", // <-- location of the react app were connecting to
        credentials: true,
    })
);

// Since mongoose's Promise is deprecated, we override it with Node's Promise
mongoose.Promise = global.Promise;

// Connect to Mongo
mongoose
    .connect(process.env.DB, { useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));

app.use("/stocks", Stocks);

app.listen(port, () => console.log(`Server started on port ${port}`));
