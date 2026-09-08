"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { logout } from "@/lib/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { getCurrentUserWallet } from "@/lib/wallet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history";
import type { Wallet } from "@/types/wallet";
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/api";

export default function TransactionsPage() {
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
            activeSection="transactions"
            onLogout={() => {
              logout();
              router.replace("/login");
            }}
          />
        ) : null}

        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6 space-y-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Transactions</h1>
            <p className="text-sm text-slate-600">Full paginated transaction history from the backend.</p>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <span className="text-sm text-slate-500">Loading history...</span>
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
              {loadError}
            </div>
          ) : wallet ? (
            <TransactionHistoryCard walletId={wallet.id} />
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
