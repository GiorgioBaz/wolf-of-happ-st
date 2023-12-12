const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const path = require("path");
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

app.use("/stocks", Stocks);

app.use(express.static(path.resolve(__dirname, "./client/build")));
app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.listen(port, () => console.log(`Server started on port ${port}`));
