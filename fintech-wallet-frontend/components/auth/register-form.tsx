"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";
import { register } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (transactionPin && !/^\d{4,6}$/.test(transactionPin)) {
      toast.error("Transaction PIN must be 4 to 6 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        passwordHash: password,
        role: "USER",
        transactionPin: transactionPin || undefined,
      });
      toast.success("Account created. Please sign in.");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Full name</span>
        <input
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
          placeholder="Ada Lovelace"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
          placeholder="you@example.com"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
            placeholder="Min. 8 characters"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
            placeholder="Repeat password"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">Transaction PIN</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={transactionPin}
            onChange={(event) => setTransactionPin(event.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
            placeholder="4-6 digits"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
