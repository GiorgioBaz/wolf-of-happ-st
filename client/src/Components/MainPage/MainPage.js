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
    const [isDisabled, setIsDisabled] = useState(true);
    const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
    const [numGainers, setNumGainers] = useState(0);
    const [numLosers, setNumLosers] = useState(0);
    const [batch, setBatch] = useState("");
    const [disableBtn1, setDisableBtn1] = useState(false);
    const [disableBtn2, setDisableBtn2] = useState(false);

    // WE NEED TO ADD SOME FUNCTIONALITY TO STORE THE NUMBER OF RECORDS IN LOCALSTORAGE AND UPDATE IT IF ITS A DIFFERENT DAY THEN WHEN IT WAS FIRST CALLED

    const isDays = interval === "1d";

    function handleStockTypeChange(e) {
        setStockType(e.target.value);
    }

    function handleIntervalChange(e) {
        setInterval(e.target.value);
    }

    function handleConsecutiveInputChange(e) {
        setIsDisabled(false);
        if (isDays) {
            setNumConsecutiveWeeks(0);
            setNumConsecutiveDays(e.target.value);
        } else {
            setNumConsecutiveDays(0);
            setNumConsecutiveWeeks(e.target.value);
        }
    }

    function handleBatchClick(e) {
        setBatch(e.target.className);
        e.target.className === "batch1"
            ? setDisableBtn1(true)
            : setDisableBtn2(true);
    }

    useEffect(() => {
        async function getNumGainersAndLosers() {
            setLoading(true);
            const stocks = await Axios.get(
                "http://localhost:5000/stocks/numGainersAndLosers"
            );
            setNumGainers(stocks.data.gainers);
            setNumLosers(stocks.data.losers);
            setLoading(false);
        }
        getNumGainersAndLosers();
    }, []);

    useEffect(() => {
        setHasSubmittedForm(true);
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
                batch,
            },
        };
        if (stockType === "gainers") {
            setLoading(true);
            const gainersRes = await Axios.get(
                "http://localhost:5000/stocks/consecutiveGainers",
                config
            );
            if (typeof gainersRes.data === "string") {
                setLoading(false);
                setErrorMsg(gainersRes.data);
            } else if (!batch) {
                setLoading(false);
                setGainers(gainersRes.data);
            } else {
                setLoading(false);
                setGainers((prevGainers) => [
                    ...prevGainers,
                    ...gainersRes.data,
                ]);
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
            } else if (!batch) {
                setLoading(false);
                setLosers(losers.data);
            } else {
                setLoading(false);
                setLosers((prevLosers) => [...prevLosers, ...losers.data]);
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
                    {(numGainers > 50 || numLosers > 600) && (
                        <div className="stockBatches">
                            <button
                                className="batch1"
                                type="button"
                                onClick={handleBatchClick}
                                disabled={disableBtn1}
                            >
                                Batch 1
                            </button>
                            <button
                                className="batch2"
                                type="button"
                                onClick={handleBatchClick}
                                disabled={disableBtn2}
                            >
                                Batch 2
                            </button>
                        </div>
                    )}

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

                <button
                    disabled={isDisabled ? true : false}
                    className="submitBtn"
                    type="submit"
                >
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
                {gainers.length === 0 && !errorMsg && !hasSubmittedForm && (
                    <p>
                        No gainers for{" "}
                        {isDays ? numConsecutiveDays : numConsecutiveWeeks}{" "}
                        consecutive {isDays ? "days" : "weeks"}
                    </p>
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
                {losers.length === 0 && !errorMsg && !hasSubmittedForm && (
                    <p>
                        No losers for{" "}
                        {isDays ? numConsecutiveDays : numConsecutiveWeeks}{" "}
                        consecutive {isDays ? "days" : "weeks"}
                    </p>
                )}
            </div>
        </div>
    );
}

export default MainPage;
