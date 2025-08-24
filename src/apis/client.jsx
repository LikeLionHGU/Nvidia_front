import axios from "axios";

const api = axios.create({
  baseURL: "/api/spaceon", // 항상 Edge Function 경유
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;