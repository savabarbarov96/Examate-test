// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://auth-service.examate.net",
  withCredentials: true,
});

export default api;
