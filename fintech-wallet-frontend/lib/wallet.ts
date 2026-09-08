import { api } from "@/lib/api";
import type {
  Wallet,
  TransactionHistoryResponse,
  TransferRequest,
  TransferResponse,
} from "@/types/wallet";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/users/me");
  return response.data;
}

export async function getCurrentUserWallet(): Promise<Wallet> {
  const response = await api.get<Wallet>("/wallets/my-wallet");
  return response.data;
}

export async function getTransactionHistory(
  walletId: number,
  page: number = 0,
  size: number = 10
): Promise<TransactionHistoryResponse> {
  const response = await api.get<TransactionHistoryResponse>(
    `/transactions/history/${walletId}`,
    {
      params: { page, size },
    }
  );
  return response.data;
}

export async function transferFunds(request: TransferRequest): Promise<TransferResponse> {
  const response = await api.post<TransferResponse>("/transactions/transfer", request, {
    responseType: "text",
  });
  return response.data;
}

export async function depositFunds(walletId: number, amount: number): Promise<string> {
  const response = await api.post<string>(
    `/wallets/${walletId}/deposit`,
    null,
    {
      params: { amount },
      responseType: "text",
    }
  );
  return response.data;
}

export async function verifyOtp(transactionId: number, otp: string): Promise<string> {
  const response = await api.post<string>(
    "/transactions/verify-otp",
    null,
    {
      params: { transactionId, otp },
      responseType: "text",
    }
  );
  return response.data;
}

export async function getSmartInsights(walletId: number): Promise<string> {
  const response = await api.get<string>(`/transactions/insights/${walletId}`, {
    responseType: "text",
  });
  return response.data;
}
