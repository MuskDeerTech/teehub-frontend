import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Optional: Add API key/token for secure routes
api.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_API_KEY; // set in .env.local
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
