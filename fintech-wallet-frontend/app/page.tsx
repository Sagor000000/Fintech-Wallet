import Link from "next/link";
import { ArrowRight, ShieldCheck, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-full bg-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
            <Wallet className="size-4" />
          </span>
          Fintech Wallet
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
            <ShieldCheck className="size-3.5" />
            JWT authenticated
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            A modern wallet for deposits, transfers, and cards.
          </h1>
          <p className="text-lg leading-8 text-slate-300">
            Create an account or sign in to receive a one-hour JWT from the Spring Boot API.
            That token unlocks the rest of the wallet endpoints.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Create account
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
