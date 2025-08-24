import axios from "axios";

const api = axios.create({
  baseURL: '/api/spaceon', 
  headers: { "Content-Type": "application/json" },
});

export default api;