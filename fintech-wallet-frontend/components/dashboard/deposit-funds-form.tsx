"use client";

import { useState } from "react";
import { Wallet, LoaderCircle, AlertCircle } from "lucide-react";
import { depositFunds } from "@/lib/wallet";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

type DepositFundsFormProps = {
  walletId: number;
  currentBalance?: number;
  onSuccess?: () => void;
};

export function DepositFundsForm({ walletId, currentBalance = 0, onSuccess }: DepositFundsFormProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
  }>({});

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};

    if (!amount.trim()) {
      errors.amount = "Amount is required";
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.amount = "Please enter a valid amount greater than 0";
      } else if (amountNum > 1000000) {
        errors.amount = "Maximum deposit amount is ৳1,000,000";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function getSpecificErrorMessage(error: unknown): string {
    const errorMessage = getApiErrorMessage(error);
    
    if (errorMessage.includes("Wallet not found")) {
      return "Wallet not found. Please try again.";
    }
    
    return errorMessage;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Clear previous errors
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const amountNum = parseFloat(amount);
      await depositFunds(walletId, amountNum);
      toast.success("Deposit successful! Funds added to your wallet.");

      // Reset form
      setAmount("");
      setFieldErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const specificError = getSpecificErrorMessage(error);
      toast.error(specificError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(value: string) {
    setFieldErrors((prev) => ({ ...prev, amount: undefined }));
    setAmount(value);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
          <Wallet className="size-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">Deposit Funds</h3>
          <p className="text-sm text-slate-600">Add money to your wallet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-800">
            Amount (BDT)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-4 ${
              fieldErrors.amount
                ? "border-red-300 ring-red-500/30 focus:border-red-500"
                : "border-slate-200 ring-emerald-500/30 focus:border-emerald-500"
            } bg-white`}
            placeholder="0.00"
          />
          {fieldErrors.amount && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="size-3" />
              {fieldErrors.amount}
            </p>
          )}
          {currentBalance > 0 && !fieldErrors.amount && (
            <p className="mt-1.5 text-xs text-slate-500">
              Current balance: ৳{currentBalance.toFixed(2)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="size-4" />
              Deposit Funds
            </>
          )}
        </button>
      </form>
    </div>
  );
}
