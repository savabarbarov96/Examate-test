// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://auth-service.examate.net:8081",
  withCredentials: true,
});

export default api;
