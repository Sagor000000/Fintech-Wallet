import { api } from "@/lib/api";
import type { AddCardRequest, Card } from "@/types/cards";

export async function getUserCards(userId: number): Promise<Card[]> {
  const response = await api.get<Card[]>(`/cards/user/${userId}`);
  return response.data;
}

export async function addCard(request: AddCardRequest): Promise<Card> {
  const response = await api.post<Card>("/cards/add", request);
  return response.data;
}

export async function deleteCard(cardId: number): Promise<string> {
  const response = await api.delete<string>(`/cards/${cardId}`);
  return response.data;
}
