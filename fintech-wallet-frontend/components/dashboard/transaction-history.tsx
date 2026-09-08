"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft, Clock, LoaderCircle } from "lucide-react";
import type { Transaction } from "@/types/wallet";
import { getTransactionHistory } from "@/lib/wallet";
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { logout } from "@/lib/auth";

type TransactionHistoryProps = {
  walletId: number;
};

export function TransactionHistoryCard({ walletId }: TransactionHistoryProps): ReactNode {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadTransactions() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getTransactionHistory(walletId, page, 10);

        if (!mounted) {
          return;
        }

        setTransactions(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (isUnauthorizedError(error)) {
          logout();
          router.replace("/login");
          return;
        }

        setTransactions([]);
        setTotalPages(0);
        setLoadError(getApiErrorMessage(error));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      mounted = false;
    };
  }, [page, reloadNonce, router, walletId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-950">Recent Transactions</h3>
          <p className="text-sm text-slate-600">Your latest wallet activities</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="size-6 animate-spin text-slate-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadNonce((current) => current + 1)}
            className="mt-3 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No transactions found
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${
                    transaction.senderWallet.id === walletId
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {transaction.senderWallet.id === walletId ? (
                    <ArrowUpRight className="size-5" />
                  ) : (
                    <ArrowDownLeft className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-950">
                    {transaction.senderWallet.id === walletId
                      ? `Sent to Wallet #${transaction.receiverWallet.id}`
                      : `Received from Wallet #${transaction.senderWallet.id}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="size-3" />
                    {formatDate(transaction.timestamp)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.senderWallet.id === walletId
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {transaction.senderWallet.id === walletId ? "-" : "+"}
                  {formatAmount(transaction.amount)}
                </p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
