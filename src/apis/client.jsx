import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? '/spaceon' : 'http://janghong.asia',
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
