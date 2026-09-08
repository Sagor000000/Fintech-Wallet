import { api } from "@/lib/api";
import { clearAccessToken, setAccessToken } from "@/lib/token";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";

function parseJwtResponse(data: unknown): string {
  if (typeof data !== "string") {
    throw new Error("Login did not return a JWT token.");
  }

  const trimmed = data.trim();

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed) as string;
  }

  return trimmed;
}

export async function login(payload: LoginRequest): Promise<string> {
  const response = await api.post<string>("/users/login", payload, {
    responseType: "text",
  });
  const token = parseJwtResponse(response.data);
  setAccessToken(token);
  return token;
}

export async function register(payload: RegisterRequest): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/users/register", payload);
  return response.data;
}

export function logout(): void {
  clearAccessToken();
}
