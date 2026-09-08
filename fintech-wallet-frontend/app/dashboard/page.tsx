"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { logout } from "@/lib/auth";
import { getCurrentUserWallet } from "@/lib/wallet";
import { WalletBalanceCard } from "@/components/dashboard/wallet-balance-card";
import { AccountDetailsCard } from "@/components/dashboard/account-details-card";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history";
import { SendMoneyForm } from "@/components/dashboard/send-money-form";
import { DepositFundsForm } from "@/components/dashboard/deposit-funds-form";
import { useAuth } from "@/components/auth/auth-provider";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { Wallet } from "@/types/wallet";

export default function DashboardPage() {
  const router = useRouter();
  const { token, isHydrated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);

  const loadWalletData = useCallback(async () => {
    if (!token) return;

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const walletData = await getCurrentUserWallet();
      if (requestId !== requestIdRef.current) {
        return;
      }
      setWallet(walletData);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
      }

      setWallet(null);
      setLoadError("Unable to load your wallet right now. Please try again.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [router, token]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      void loadWalletData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isHydrated, loadWalletData, router, token]);

  const handleTransactionSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    void loadWalletData();
  }, [loadWalletData]);

  if (!isHydrated || !token) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  if (isLoading || !wallet) {
    if (loadError && !isLoading) {
      return (
        <div className="flex min-h-full items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadWalletData()}
              className="mt-4 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50">
        <LoaderCircle className="size-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <DashboardHeader
        walletId={wallet.id}
        activeSection="dashboard"
        onLogout={() => {
          logout();
          router.replace("/login");
        }}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">
                Welcome back, {wallet.user.name}! Manage your wallet and transactions.
              </p>
            </div>
            <Link
              href="/kyc"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <span className="size-2 rounded-full bg-white/90" />
              Complete KYC
            </Link>
          </div>
          {loadError ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {loadError}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <WalletBalanceCard wallet={wallet} />
            <TransactionHistoryCard key={refreshKey} walletId={wallet.id} />
          </div>

          <div className="space-y-6">
            <AccountDetailsCard wallet={wallet} />
            <SendMoneyForm 
              walletId={wallet.id} 
              currentBalance={wallet.currentBalance}
              onSuccess={handleTransactionSuccess}
            />
            <DepositFundsForm 
              walletId={wallet.id} 
              currentBalance={wallet.currentBalance}
              onSuccess={handleTransactionSuccess}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
