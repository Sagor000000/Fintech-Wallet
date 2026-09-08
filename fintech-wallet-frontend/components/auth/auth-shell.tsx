import Link from "next/link";
import { Wallet } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-full grid lg:grid-cols-2 bg-slate-50">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 px-12 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_40%)]" />
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
            <Wallet className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Fintech Wallet</span>
        </Link>
        <div className="relative z-10 max-w-md space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-300">
            Secure banking
          </p>
          <h2 className="text-4xl font-semibold leading-tight">
            Send, save, and manage money with a JWT-protected wallet.
          </h2>
          <p className="text-base leading-7 text-slate-300">
            Your session is authenticated with a Bearer token from the Spring Boot API.
            Protected wallet actions require that token on every request.
          </p>
        </div>
        <p className="relative z-10 text-sm text-slate-400">
          1-hour JWT session · BCrypt passwords · Role-based accounts
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
              <Wallet className="size-5" />
            </span>
            <span className="font-semibold text-slate-900">Fintech Wallet</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
