const ACCESS_TOKEN_KEY = "fw_access_token";
const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60;
const AUTH_CHANGE_EVENT = "fw-auth-change";

function readAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ACCESS_TOKEN_KEY}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(ACCESS_TOKEN_KEY.length + 1));
}

function writeAccessTokenCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${ACCESS_TOKEN_COOKIE_MAX_AGE}; samesite=lax`;
}

function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}

function emitAuthChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeToAccessTokenChanges(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", listener);
  window.addEventListener(AUTH_CHANGE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
  };
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? readAccessTokenFromCookie();
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  writeAccessTokenCookie(token);
  emitAuthChange();
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  clearAccessTokenCookie();
  emitAuthChange();
}
