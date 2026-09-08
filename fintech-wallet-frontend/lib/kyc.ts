import { api } from "@/lib/api";
import type { KycSubmissionRequest } from "@/types/auth";

export async function submitKyc(request: KycSubmissionRequest): Promise<string> {
  const response = await api.post<string>("/kyc/verify", request, {
    responseType: "text",
  });

  return response.data;
}