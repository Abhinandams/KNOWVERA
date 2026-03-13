import axios from "axios";
import { clearAuthSession } from "../utils/authStorage";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const api = axios.create({
  baseURL: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : "/",
  withCredentials: true,
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuthSession();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
