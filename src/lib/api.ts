// D:\teehub-frontend\src\lib\api.ts
import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_API_KEY; // Set if required
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;