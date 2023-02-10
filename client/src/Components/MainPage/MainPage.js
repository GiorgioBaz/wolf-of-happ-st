import Axios from "axios";
import { useState, useEffect } from "react";

import "./MainPage.css";
import showLoading from "../../showLoading";

function MainPage() {
    const [stockType, setStockType] = useState("gainers");
    const [numConsecutiveDays, setNumConsecutiveDays] = useState(0);
    const [numConsecutiveWeeks, setNumConsecutiveWeeks] = useState(0);
    const [interval, setInterval] = useState("1d");
    const [losers, setLosers] = useState([]);
    const [gainers, setGainers] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const isDays = interval === "1d";

    function handleStockTypeChange(e) {
        setStockType(e.target.value);
    }

    function handleIntervalChange(e) {
        setInterval(e.target.value);
    }

    function handleConsecutiveInputChange(e) {
        if (isDays) {
            setNumConsecutiveDays(e.target.value);
        } else {
            setNumConsecutiveWeeks(e.target.value);
        }
    }

    useEffect(() => {
        showLoading(loading);
    }, [loading]);

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMsg("");
        const config = {
            params: {
                numConsecutiveDays,
                interval,
                numConsecutiveWeeks,
            },
        };
        if (stockType === "gainers") {
            setLoading(true);
            const gainers = await Axios.get(
                "http://localhost:5000/stocks/consecutiveGainers",
                config
            );
            if (typeof gainers.data === "string") {
                setLoading(false);
                setErrorMsg(gainers.data);
            } else {
                setLoading(false);
                setGainers(gainers.data);
            }
        } else {
            setLoading(true);
            const losers = await Axios.get(
                "http://localhost:5000/stocks/consecutiveLosers",
                config
            );
            if (typeof losers.data === "string") {
                setLoading(false);
                setErrorMsg(losers.data);
            } else {
                setLoading(false);
                setLosers(losers.data);
            }
        }
    }
    return (
        <div className="App">
            <form id="stocksForm" onSubmit={handleSubmit}>
                <div className="stocks">
                    <div className="stockTypeButtons">
                        <div className="gainers">
                            <input
                                className="stockType"
                                type={"radio"}
                                onChange={handleStockTypeChange}
                                value="gainers"
                                id="gainersInput"
                                checked={stockType === "gainers"}
                            />
                            <label htmlFor="gainersInput">Gainers</label>
                        </div>

                        <div className="losers">
                            <input
                                className="stockType"
                                type={"radio"}
                                onChange={handleStockTypeChange}
                                value="losers"
                                id="losersInput"
                                checked={stockType === "losers"}
                            />
                            <label htmlFor="losersInput">Losers</label>
                        </div>
                    </div>
                    <div className="intervalDiv">
                        <label htmlFor="interval">Interval:</label>
                        <select
                            className="interval"
                            value={interval}
                            onChange={handleIntervalChange}
                        >
                            <option value={"1d"}>Daily</option>
                            <option value={"1wk"}>Weekly</option>
                        </select>
                    </div>

                    <p>Number Of Consecutive {isDays ? "Days:" : "Weeks:"}</p>
                    <input
                        className={
                            stockType === "gainers"
                                ? "numConsecutiveInput green"
                                : "numConsecutiveInput red"
                        }
                        onChange={handleConsecutiveInputChange}
                        value={
                            isDays ? numConsecutiveDays : numConsecutiveWeeks
                        }
                    ></input>
                </div>

                <button className="submitBtn" type="submit">
                    Retrieve
                </button>
            </form>

            {errorMsg && <p className="error">{errorMsg}</p>}

            <div className="results">
                {gainers.length !== 0 && (
                    <div className="gainersResults">
                        <ul className="gainersUl">
                            {gainers.map((gainer, i) => (
                                <li className="gainerTicker" key={i}>
                                    {gainer}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {losers.length !== 0 && (
                    <div className="losersResults">
                        <ul className="losersUl">
                            {losers.map((loser, i) => (
                                <li className="loserTicker" key={i}>
                                    {loser}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainPage;
