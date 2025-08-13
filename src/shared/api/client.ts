// src/shared/api/client.ts
import axios, { AxiosInstance } from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL?.toString().replace(/\/+$/, '') ||
  'http://localhost:5050';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // включай/выключай cookies по необходимости
  withCredentials: false,
});

// — маленькие хелперы (опционально)
export const http = {
  get:  <T = any>(url: string, cfg?: any) => api.get<T>(url, cfg).then(r => r.data),
  post: <T = any>(url: string, data?: any, cfg?: any) => api.post<T>(url, data, cfg).then(r => r.data),
  patch:<T = any>(url: string, data?: any, cfg?: any) => api.patch<T>(url, data, cfg).then(r => r.data),
  del:  <T = any>(url: string, cfg?: any) => api.delete<T>(url, cfg).then(r => r.data),
};

// на случай, если где‑то импорт идёт как default
export default api;
