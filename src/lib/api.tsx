import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axiosRetry, { exponentialDelay, isNetworkOrIdempotentRequestError } from "axios-retry";
import { auth } from "./firebase"; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });

    // Production-level retry logic
    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: exponentialDelay,
      retryCondition: (error) =>
        isNetworkOrIdempotentRequestError(error) ||
        (!!error.response && error.response.status >= 500),
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Next.js safety check: Firebase Auth only exists on the client (window)
        if (typeof window !== "undefined") {
          const user = auth.currentUser;
          if (user) {
            try {
              const token = await user.getIdToken();
              if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            } catch (tokenError) {
              console.error("Token fetch failed", tokenError);
            }
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private initializeResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // In Next.js, we might want to redirect to /login
          if (typeof window !== "undefined") {
             window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public get instance() {
    return this.axiosInstance;
  }
}

export const apiService = new ApiService().instance;