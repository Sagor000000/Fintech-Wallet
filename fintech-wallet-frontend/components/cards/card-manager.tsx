"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, LoaderCircle, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { addCard, deleteCard, getUserCards } from "@/lib/cards";
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import type { Card } from "@/types/cards";
import { logout } from "@/lib/auth";

type CardManagerProps = {
  userId: number;
};

export function CardManager({ userId }: CardManagerProps) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cardType, setCardType] = useState("DEBIT");
  const [fullCardNumber, setFullCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCards() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getUserCards(userId);
        if (mounted) {
          setCards(response);
        }
      } catch (error) {
        if (mounted) {
          if (isUnauthorizedError(error)) {
            logout();
            router.replace("/login");
            return;
          }

          setCards([]);
          setLoadError(getApiErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCards();

    return () => {
      mounted = false;
    };
  }, [router, userId]);

  async function handleAddCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (fullCardNumber.replace(/\D/g, "").length < 16) {
      toast.error("Card number must be at least 16 digits.");
      return;
    }

    if (!expiryDate) {
      toast.error("Expiry date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdCard = await addCard({
        userId,
        cardType,
        fullCardNumber: fullCardNumber.replace(/\s+/g, ""),
        expiryDate,
      });

      setCards((current) => [createdCard, ...current]);
      setFullCardNumber("");
      setExpiryDate("");
      setCardType("DEBIT");
      toast.success("Card added successfully.");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        logout();
        router.replace("/login");
        return;
      }

      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCard(cardId: number) {
    setDeletingCardId(cardId);
    try {
      await deleteCard(cardId);
      setCards((current) => current.filter((card) => card.id !== cardId));
      toast.success("Card deleted successfully.");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        logout();
        router.replace("/login");
        return;
      }

      toast.error(getApiErrorMessage(error));
    } finally {
      setDeletingCardId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
            <CreditCard className="size-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-950">Your Cards</h3>
            <p className="text-sm text-slate-600">Cards stored for the current user account</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="size-6 animate-spin text-slate-400" />
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        ) : cards.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No cards added yet.</p>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-medium text-slate-950">{card.cardType}</p>
                  <p className="text-sm text-slate-600">•••• •••• •••• {card.lastFourDigits}</p>
                  <p className="mt-1 text-xs text-slate-500">Expires {card.expiryDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  disabled={deletingCardId === card.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingCardId === card.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAddCard} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
            <Plus className="size-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-950">Add Card</h3>
            <p className="text-sm text-slate-600">Register a new card for this user</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Card type</span>
            <select
              value={cardType}
              onChange={(event) => setCardType(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
            >
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
              <option value="PREPAID">Prepaid</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Full card number</span>
            <input
              value={fullCardNumber}
              onChange={(event) => setFullCardNumber(event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              maxLength={19}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
              placeholder="1234 5678 9012 3456"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Expiry date</span>
            <input
              type="month"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? "Adding card..." : "Add card"}
        </button>
      </form>
    </div>
  );
}
