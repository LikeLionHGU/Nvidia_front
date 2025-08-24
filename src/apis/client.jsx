// src/apis/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://janghong.asia' : '/spaceon',
  headers: { 'Content-Type': 'application/json' },
});

export default api;