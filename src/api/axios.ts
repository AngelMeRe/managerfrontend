import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
          queue.forEach((fn) => fn());
          queue = [];
        }
      }
      return new Promise((resolve) => queue.push(() => resolve(api(original))));
    }
    return Promise.reject(error);
  }
);
