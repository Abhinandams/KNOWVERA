import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

const api = axios.create({
  baseURL: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : "/",
});

export default api;