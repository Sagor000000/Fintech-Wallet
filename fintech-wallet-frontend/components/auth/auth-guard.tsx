"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !token) {
      router.push("/login");
    }
  }, [isHydrated, router, token]);

  if (!isHydrated || !token) {
    return null;
  }

  return <>{children}</>;
}
