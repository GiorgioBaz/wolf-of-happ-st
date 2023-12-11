import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://wolf-of-happ-st.onrender.com/stocks",
});
