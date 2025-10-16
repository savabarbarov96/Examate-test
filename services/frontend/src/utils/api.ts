import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081",
  // withCredentials: true,
});

export default api;
