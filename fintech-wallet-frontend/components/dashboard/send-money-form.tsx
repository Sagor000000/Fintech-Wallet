"use client";

import { useState } from "react";
import { Send, LoaderCircle, AlertCircle } from "lucide-react";
import type { TransferRequest, TransferResponse } from "@/types/wallet";
import { transferFunds, verifyOtp } from "@/lib/wallet";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

type SendMoneyFormProps = {
  walletId: number;
  currentBalance?: number;
  onSuccess?: () => void;
};

export function SendMoneyForm({ walletId, currentBalance = 0, onSuccess }: SendMoneyFormProps) {
  const [receiverWalletId, setReceiverWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTransactionId, setOtpTransactionId] = useState<number | null>(null);
  const [otpNotice, setOtpNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    receiverWalletId?: string;
    amount?: string;
    category?: string;
    pin?: string;
    otp?: string;
  }>({});

  function extractOtpChallenge(payload: unknown): {
    transactionId: number | null;
    message: string;
  } | null {
    const readString = (value: unknown): string | null => {
      if (typeof value === "string") {
        return value;
      }

      if (value && typeof value === "object") {
        const objectValue = value as {
          message?: unknown;
          error?: unknown;
          detail?: unknown;
          data?: unknown;
        };

        return (
          readString(objectValue.message) ??
          readString(objectValue.error) ??
          readString(objectValue.detail) ??
          readString(objectValue.data)
        );
      }

      return null;
    };

    const message = readString(payload);
    const payloadObject = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
    const transactionIdCandidate =
      payloadObject?.transactionId ?? payloadObject?.transactionID ?? payloadObject?.id;

    if (transactionIdCandidate && typeof transactionIdCandidate === "number") {
      return {
        transactionId: transactionIdCandidate,
        message: message ?? "Transaction requires OTP verification.",
      };
    }

    if (!message || !/otp/i.test(message)) {
      return null;
    }

    const transactionIdFromMessage = message.match(/transaction\s*id[:#\s-]*(\d+)/i)?.[1]
      ?? message.match(/\bid[:#\s-]*(\d+)/i)?.[1]
      ?? message.match(/\btransaction[:#\s-]*(\d+)/i)?.[1];

    return {
      transactionId: transactionIdFromMessage ? Number(transactionIdFromMessage) : null,
      message,
    };
  }

  function closeOtpModal() {
    setOtp("");
    setOtpTransactionId(null);
    setOtpNotice("");
    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
  }

  function resetForm() {
    setReceiverWalletId("");
    setAmount("");
    setCategory("");
    setPin("");
    closeOtpModal();
    setFieldErrors({});
  }

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};

    // Validate receiver wallet ID
    if (!receiverWalletId.trim()) {
      errors.receiverWalletId = "Receiver wallet ID is required";
    } else if (isNaN(parseInt(receiverWalletId)) || parseInt(receiverWalletId) <= 0) {
      errors.receiverWalletId = "Please enter a valid wallet ID";
    } else if (parseInt(receiverWalletId) === walletId) {
      errors.receiverWalletId = "You cannot send money to your own wallet";
    }

    // Validate amount
    if (!amount.trim()) {
      errors.amount = "Amount is required";
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.amount = "Please enter a valid amount greater than 0";
      } else if (amountNum > currentBalance) {
        errors.amount = `Insufficient balance. Available: ৳${currentBalance.toFixed(2)}`;
      } else if (amountNum > 1000000) {
        errors.amount = "Maximum transfer amount is ৳1,000,000";
      }
    }

    // Validate category
    if (!category.trim()) {
      errors.category = "Please select a category";
    }

    // Validate PIN
    if (!pin.trim()) {
      errors.pin = "Transaction PIN is required";
    } else if (!/^\d{4,6}$/.test(pin)) {
      errors.pin = "PIN must be 4-6 digits";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function getSpecificErrorMessage(error: unknown): string {
    const errorMessage = getApiErrorMessage(error);
    
    // Map specific backend error messages to user-friendly messages
    if (errorMessage.includes("Insufficient Balance")) {
      return "Insufficient balance for this transfer";
    }
    if (errorMessage.includes("Receiver wallet not found")) {
      return "Invalid receiver wallet ID";
    }
    if (errorMessage.includes("Invalid Transaction PIN")) {
      return "Incorrect transaction PIN";
    }
    if (errorMessage.includes("not kyc verified")) {
      return "KYC verification required for transfers. Please complete KYC first.";
    }
    if (errorMessage.includes("Duplicate Transaction")) {
      return "Duplicate transaction detected. Please wait 30 seconds.";
    }
    if (errorMessage.includes("Security Error")) {
      return "Security error: You can only send from your own wallet";
    }
    if (errorMessage.includes("requires OTP")) {
      return "Transaction requires OTP verification. Please check your email.";
    }
    
    return errorMessage;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (otpTransactionId !== null) {
      toast.error("Enter the OTP code to complete the pending transfer.");
      return;
    }

    // Clear previous errors
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: TransferRequest = {
        senderWalletId: walletId,
        receiverWalletId: parseInt(receiverWalletId),
        amount: parseFloat(amount),
        category,
        pin,
      };

      const response = await transferFunds(request);
      const otpChallenge = extractOtpChallenge(response as TransferResponse);

      if (otpChallenge && otpChallenge.transactionId) {
        setOtpTransactionId(otpChallenge.transactionId);
        setOtpNotice(otpChallenge.message);
        setOtp("");
        toast.success(otpChallenge.message || "OTP required. Please check your email.", {
          duration: 6000,
        });
        return;
      }

      toast.success("Transfer successful! Money sent successfully.");
      resetForm();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const otpChallenge = extractOtpChallenge(
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : error
      );

      if (otpChallenge && otpChallenge.transactionId) {
        setOtpTransactionId(otpChallenge.transactionId);
        setOtpNotice(otpChallenge.message);
        setOtp("");
        toast.success(otpChallenge.message || "OTP required. Please check your email.", {
          duration: 6000,
        });
        return;
      }

      const specificError = getSpecificErrorMessage(error);
      toast.error(specificError, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(
    field: keyof typeof fieldErrors,
    value: string
  ) {
    // Clear error for this field when user starts typing
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    
    switch (field) {
      case "receiverWalletId":
        setReceiverWalletId(value);
        break;
      case "amount":
        setAmount(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "pin":
        setPin(value);
        break;
      case "otp":
        setOtp(value);
        break;
    }
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otpTransactionId === null) {
      return;
    }

    if (!otp.trim()) {
      setFieldErrors((prev) => ({ ...prev, otp: "OTP is required" }));
      return;
    }

    if (!/^\d{4,8}$/.test(otp)) {
      setFieldErrors((prev) => ({ ...prev, otp: "OTP must be 4-8 digits" }));
      return;
    }

    setIsVerifyingOtp(true);

    try {
      await verifyOtp(otpTransactionId, otp);
      toast.success("Transfer successful! OTP verification completed.");
      resetForm();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), {
        duration: 5000,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
          <Send className="size-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">Send Money</h3>
          <p className="text-sm text-slate-600">
            Transfer funds to another wallet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-800">
            Receiver Wallet ID
          </label>
          <input
            type="number"
            required
            value={receiverWalletId}
            onChange={(e) => handleInputChange("receiverWalletId", e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-4 ${
              fieldErrors.receiverWalletId
                ? "border-red-300 ring-red-500/30 focus:border-red-500"
                : "border-slate-200 ring-emerald-500/30 focus:border-emerald-500"
            } bg-white`}
            placeholder="Enter wallet ID"
          />
          {fieldErrors.receiverWalletId && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="size-3" />
              {fieldErrors.receiverWalletId}
            </p>
          )}
        </div>

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
            onChange={(e) => handleInputChange("amount", e.target.value)}
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
              Available balance: ৳{currentBalance.toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-800">
            Category
          </label>
          <select
            required
            value={category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-4 ${
              fieldErrors.category
                ? "border-red-300 ring-red-500/30 focus:border-red-500"
                : "border-slate-200 ring-emerald-500/30 focus:border-emerald-500"
            } bg-white`}
          >
            <option value="">Select category</option>
            <option value="TRANSFER">Transfer</option>
            <option value="PAYMENT">Payment</option>
            <option value="GIFT">Gift</option>
            <option value="OTHER">Other</option>
          </select>
          {fieldErrors.category && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="size-3" />
              {fieldErrors.category}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-800">
            Transaction PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            required
            maxLength={6}
            value={pin}
            onChange={(e) => handleInputChange("pin", e.target.value.replace(/\D/g, ""))}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-4 ${
              fieldErrors.pin
                ? "border-red-300 ring-red-500/30 focus:border-red-500"
                : "border-slate-200 ring-emerald-500/30 focus:border-emerald-500"
            } bg-white`}
            placeholder="Enter your PIN"
          />
          {fieldErrors.pin && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="size-3" />
              {fieldErrors.pin}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send Money
            </>
          )}
        </button>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-700">Transfer Information:</p>
          <ul className="mt-1 space-y-1">
            <li>• Transfers over ৳10,000 require OTP verification</li>
            <li>• Duplicate transactions are blocked for 30 seconds</li>
            <li>• KYC verification is required for transfers</li>
          </ul>
        </div>
      </form>

      {otpTransactionId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-950">OTP verification required</h4>
              <p className="mt-1 text-sm text-slate-600">
                {otpNotice || "Enter the OTP sent to your email to complete the transfer."}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-800">
                  OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => handleInputChange("otp", e.target.value.replace(/\D/g, ""))}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-4 ${
                    fieldErrors.otp
                      ? "border-red-300 ring-red-500/30 focus:border-red-500"
                      : "border-slate-200 ring-emerald-500/30 focus:border-emerald-500"
                  } bg-white`}
                  placeholder="Enter OTP"
                />
                {fieldErrors.otp && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="size-3" />
                    {fieldErrors.otp}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeOtpModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isVerifyingOtp ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
