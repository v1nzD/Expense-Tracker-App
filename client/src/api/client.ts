import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // get token from seucre storage
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        // attach authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error getting token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
