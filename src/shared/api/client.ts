import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050',
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('API error:', err?.response?.data || err.message);
    return Promise.reject(err);
  }
);
