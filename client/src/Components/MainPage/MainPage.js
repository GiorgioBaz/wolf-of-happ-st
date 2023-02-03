import Axios from "axios";
import { useState } from "react";

import "./MainPage.css";

function MainPage() {
    const [stockType, setStockType] = useState("gainers");
    const [numConsecutiveDays, setNumConsecutiveDays] = useState(1);
    const [losers, setLosers] = useState([]);
    const [gainers, setGainers] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    function handleStockTypeChange(e) {
        setStockType(e.target.value);
    }

    function handleConsecutiveDaysChange(e) {
        setNumConsecutiveDays(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMsg("");
        const config = {
            params: {
                numConsecutiveDays,
            },
        };
        if (stockType === "gainers") {
            const gainers = await Axios.get(
                "http://localhost:5000/stocks/consecutiveGainers",
                config
            );
            if (typeof gainers.data === "string") {
                setErrorMsg(gainers.data);
            } else {
                setGainers(gainers.data);
            }
        } else {
            const losers = await Axios.get(
                "http://localhost:5000/stocks/consecutiveLosers",
                config
            );
            if (typeof losers.data === "string") {
                setErrorMsg(losers.data);
            } else {
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
                    <div className="consecutiveDaysDiv">
                        <p>Number Of Consecutive Days:</p>
                        <input
                            className="numConsecutiveDays"
                            onChange={handleConsecutiveDaysChange}
                            value={numConsecutiveDays}
                        ></input>
                    </div>
                </div>

                <button className="submitBtn" type="submit">
                    Retrieve
                </button>
            </form>

            {errorMsg && <p className="error">{errorMsg}</p>}

            <div className="results">
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

                {gainers.length !== 0 && (
                    <div className="gainersResults">
                        <ul className="gainersUl">
                            {gainers.map((gainer, i) => (
                                <li className="gainersTicker" key={i}>
                                    {gainer}
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
