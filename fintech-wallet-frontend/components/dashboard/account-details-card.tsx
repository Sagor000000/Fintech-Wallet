"use client";

import { User, Mail, Shield, CheckCircle, XCircle, CreditCard } from "lucide-react";
import type { Wallet } from "@/types/wallet";

type AccountDetailsCardProps = {
  wallet: Wallet;
};

export function AccountDetailsCard({ wallet }: AccountDetailsCardProps) {
  const { user } = wallet;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
          <User className="size-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">Account Details</h3>
          <p className="text-sm text-slate-600">Your personal information</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <User className="size-4 text-slate-400" />
            <span className="text-sm text-slate-600">Name</span>
          </div>
          <span className="text-sm font-medium text-slate-950">{user.name}</span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-slate-400" />
            <span className="text-sm text-slate-600">Email</span>
          </div>
          <span className="text-sm font-medium text-slate-950">{user.email}</span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 text-slate-400" />
            <span className="text-sm text-slate-600">User ID</span>
          </div>
          <span className="text-sm font-medium text-slate-950">{user.id}</span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-slate-400" />
            <span className="text-sm text-slate-600">Role</span>
          </div>
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {user.role}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-slate-400" />
            <span className="text-sm text-slate-600">KYC Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            {user.isKycVerified ? (
              <>
                <CheckCircle className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Not Verified</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="size-4 text-slate-400" />
            <span className="text-sm text-slate-600">Account Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            {user.isActive ? (
              <>
                <CheckCircle className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">Active</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">Inactive</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
