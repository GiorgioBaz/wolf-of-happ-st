import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import MainPage from "./Components/MainPage/MainPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="App">
                            <MainPage />
                        </div>
                    }
                />
                <Route path="/register" element={<div className="App"></div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
