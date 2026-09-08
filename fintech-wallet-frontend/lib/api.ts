import axios from "axios";

import { getAccessToken } from "@/lib/token";
import type { ApiErrorDetails } from "@/types/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong. Please try again.";
  }

  const data = error.response?.data;

  // Handle plain text responses from backend
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as Partial<ApiErrorDetails>;
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      return data;
    }
    return data;
  }

  // Handle JSON responses
  if (data && typeof data === "object" && "message" in data) {
    return String((data as ApiErrorDetails).message);
  }

  return error.message || "Something went wrong. Please try again.";
}

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
