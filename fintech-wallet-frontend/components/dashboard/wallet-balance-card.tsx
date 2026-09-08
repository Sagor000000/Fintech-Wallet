"use client";

import { Wallet as WalletIcon, TrendingUp } from "lucide-react";
import type { Wallet } from "@/types/wallet";

type WalletBalanceCardProps = {
  wallet: Wallet;
};

export function WalletBalanceCard({ wallet }: WalletBalanceCardProps) {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(balance);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/20">
            <WalletIcon className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-100">Wallet Balance</p>
            <p className="text-3xl font-bold">{formatBalance(wallet.currentBalance)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5">
            <TrendingUp className="size-4" />
            <span className="text-sm font-medium">Active</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-emerald-100">Wallet ID: {wallet.id}</span>
        <span className="text-emerald-100">{wallet.user.name}</span>
      </div>
    </div>
  );
}
