import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";
import { useUserStore } from "@/hooks/useUserStore";

declare module "axios" {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
    _retry?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    requiresAuth?: boolean;
    _retry?: boolean;
  }
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://server.eazika.com';
const BASE_URL = `${SERVER_URL}/api/v2`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// --- REQUEST INTERCEPTOR ---
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.requiresAuth === false) return config;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (token) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers = {
          ...(config.headers as Record<string, unknown>),
          Authorization: `Bearer ${token}`,
        } as typeof config.headers;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // CRITICAL FIX: Check if the failing request is the logout endpoint
    const isLogoutRequest = originalRequest.url?.includes('/logout');

    // If Logout API returns 401, it means token is already dead. 
    // Don't retry, don't refresh. Just let the app clear local state.
    if (isLogoutRequest && error.response?.status === 401) {
         return Promise.resolve({ data: { success: true } }); // Fake success to stop loop
    }

    // Handle 401 (Unauthorized) for other requests
    if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken"); 
        
        if (!refreshToken) throw new Error("No refresh token");

        // Call Refresh API
        const response = await axios.post(`${BASE_URL}/users/refresh`, {
            refreshToken: refreshToken
        }, {
            withCredentials: true 
        });

        const { accessToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        useUserStore.getState().setAuthToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.warn("Session expired. Refresh failed. Logging out...");
        
        // FORCE LOGOUT: Clear storage manually to avoid calling the API again
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // General Error Logging
    if (error.response) {
      console.warn("API Error:", error.response.data?.message || error.response.statusText);
    } else if (error.request) {
      console.warn("Network Error: Backend unreachable.");
    } else {
      console.warn("Request Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { isAxiosError };