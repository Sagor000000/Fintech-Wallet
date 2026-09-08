"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { logout } from "@/lib/auth";
import { KycForm } from "@/components/kyc/kyc-form";
import { useState } from "react";

export default function KycPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-full bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950">
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSigningOut(true);
                logout();
                router.replace("/login");
              }}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <ShieldCheck className={`size-4 ${isSigningOut ? "animate-pulse" : ""}`} />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Identity verification</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Complete your KYC profile</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Submit your National ID and matching family details so the backend can verify your account.
            </p>
          </div>

          <KycForm />
        </main>
      </div>
    </AuthGuard>
  );
}