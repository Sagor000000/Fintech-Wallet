import { getAccessToken } from "@/lib/token";

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && token.length > 0;
}
