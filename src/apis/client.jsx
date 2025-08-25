import axios from "axios";

const api = axios.create({
  baseURL: "https://janghong.asia", // 항상 Edge Function 경유
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default api;
