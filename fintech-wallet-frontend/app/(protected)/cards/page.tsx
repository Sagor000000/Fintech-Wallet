"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { logout } from "@/lib/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { getCurrentUserWallet } from "@/lib/wallet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CardManager } from "@/components/cards/card-manager";
import type { Wallet } from "@/types/wallet";
import { useEffect, useState } from "react";
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/api";

export default function CardsPage() {
  const router = useRouter();
  const { token, isHydrated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    let mounted = true;

    async function loadWallet() {
      setLoadError(null);
      try {
        const response = await getCurrentUserWallet();
        if (mounted) {
          setWallet(response);
        }
      } catch (error) {
        if (mounted) {
          if (isUnauthorizedError(error)) {
            logout();
            router.replace("/login");
            return;
          }

          setWallet(null);
          setLoadError(getApiErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWallet();

    return () => {
      mounted = false;
    };
  }, [isHydrated, router, token]);

  return (
    <AuthGuard>
      <div className="min-h-full bg-slate-50">
        {wallet ? (
          <DashboardHeader
            walletId={wallet.id}
            activeSection="cards"
            onLogout={() => {
              logout();
              router.replace("/login");
            }}
          />
        ) : null}

        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                <ArrowLeft className="size-4" />
                Back to dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Cards</h1>
              <p className="mt-2 text-sm text-slate-600">Create, view, and delete cards linked to the current user.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <span className="text-sm text-slate-500">Loading cards...</span>
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
              {loadError}
            </div>
          ) : wallet ? (
            <CardManager userId={wallet.user.id} />
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
