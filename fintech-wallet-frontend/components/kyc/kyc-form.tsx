"use client";

import { useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/api";
import { submitKyc } from "@/lib/kyc";
import type { KycSubmissionRequest } from "@/types/auth";

export function KycForm() {
  const [formData, setFormData] = useState<KycSubmissionRequest>({
    nid: "",
    name: "",
    fatherName: "",
    motherName: "",
    dob: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof KycSubmissionRequest, string>>>({});

  function updateField<K extends keyof KycSubmissionRequest>(field: K, value: string) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormData((current) => ({ ...current, [field]: value } as KycSubmissionRequest));
  }

  function validateForm() {
    const errors: Partial<Record<keyof KycSubmissionRequest, string>> = {};

    if (!formData.nid.trim()) errors.nid = "NID is required";
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.fatherName.trim()) errors.fatherName = "Father's name is required";
    if (!formData.motherName.trim()) errors.motherName = "Mother's name is required";
    if (!formData.dob) errors.dob = "Date of birth is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitKyc({
        nid: formData.nid.trim(),
        name: formData.name.trim(),
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        dob: formData.dob,
      });

      toast.success(response || "KYC submitted successfully.");
      setFormData({
        nid: "",
        name: "",
        fatherName: "",
        motherName: "",
        dob: "",
      });
      setFieldErrors({});
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="size-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-950">KYC Verification</h2>
          <p className="text-sm text-slate-600">Submit the exact identity fields required by the backend.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="NID" error={fieldErrors.nid}>
          <input
            value={formData.nid}
            onChange={(event) => updateField("nid", event.target.value)}
            className={inputClass(fieldErrors.nid)}
            placeholder="Enter your NID number"
          />
        </Field>
        <Field label="Name" error={fieldErrors.name}>
          <input
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={inputClass(fieldErrors.name)}
            placeholder="Enter your full name"
          />
        </Field>
        <Field label="Father's name" error={fieldErrors.fatherName}>
          <input
            value={formData.fatherName}
            onChange={(event) => updateField("fatherName", event.target.value)}
            className={inputClass(fieldErrors.fatherName)}
            placeholder="Enter your father's name"
          />
        </Field>
        <Field label="Mother's name" error={fieldErrors.motherName}>
          <input
            value={formData.motherName}
            onChange={(event) => updateField("motherName", event.target.value)}
            className={inputClass(fieldErrors.motherName)}
            placeholder="Enter your mother's name"
          />
        </Field>
        <Field label="Date of birth" error={fieldErrors.dob}>
          <input
            type="date"
            value={formData.dob}
            onChange={(event) => updateField("dob", event.target.value)}
            className={inputClass(fieldErrors.dob)}
          />
        </Field>
      </div>

      <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isSubmitting ? "Submitting..." : "Submit KYC"}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:ring-4 ${
    error ? "border-red-300 focus:border-red-500 ring-red-500/30" : "border-slate-200 focus:border-emerald-500"
  } bg-white`;
}