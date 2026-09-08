import { api } from "@/lib/api";

export async function getSmartInsights(walletId: number): Promise<string> {
  const response = await api.get<string>(`/transactions/insights/${walletId}`, {
    responseType: "text",
  });

  return response.data;
}

export async function askFinancialQuestion(
  walletId: number,
  question: string
): Promise<{ success: boolean; answer: string | null; message: string }> {
  const response = await api.post<{ success: boolean; answer: string | null; message: string }>(
    `/transactions/insights/${walletId}/ask`,
    { question },
  );

  return response.data;
}
