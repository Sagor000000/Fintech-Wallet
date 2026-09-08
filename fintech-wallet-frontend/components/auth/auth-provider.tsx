"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getAccessToken, subscribeToAccessTokenChanges } from "@/lib/token";

type AuthContextValue = {
  token: string | null;
  isHydrated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const syncToken = () => {
      setToken(getAccessToken());
      setIsHydrated(true);
    };

    syncToken();
    return subscribeToAccessTokenChanges(syncToken);
  }, []);

  return <AuthContext.Provider value={{ token, isHydrated }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}