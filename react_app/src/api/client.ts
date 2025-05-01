// src/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3006',
});

const saved = localStorage.getItem('token');
if (saved) {
  api.defaults.headers.common.Authorization = `Bearer ${saved}`;
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
