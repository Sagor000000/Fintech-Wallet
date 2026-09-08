"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, LoaderCircle, RefreshCw, Send, MessageCircle } from "lucide-react";

import { getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { askFinancialQuestion, getSmartInsights } from "@/lib/insights";
import { logout } from "@/lib/auth";

type AiInsightsPanelProps = {
  walletId: number;
};

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

export function AiInsightsPanel({ walletId }: AiInsightsPanelProps) {
  const router = useRouter();
  const [insights, setInsights] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadInsights() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getSmartInsights(walletId);
        if (mounted) {
          setInsights(response);
          setMessages((current) => {
            const assistantMessage: ChatMessage = {
              id: Date.now(),
              role: "assistant",
              content: response,
            };

            return current.length === 0 ? [assistantMessage] : current;
          });
        }
      } catch (error) {
        if (mounted) {
          if (isUnauthorizedError(error)) {
            logout();
            router.replace("/login");
            return;
          }

          setInsights("");
          setLoadError(getApiErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadInsights();

    return () => {
      mounted = false;
    };
  }, [refreshNonce, router, walletId]);

  async function handleAskQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsAsking(true);

    try {
      const response = await askFinancialQuestion(walletId, trimmedQuestion);
      const assistantContent = response.success
        ? response.answer || "No answer was returned by the backend."
        : response.message || "Unable to answer that question right now.";

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: assistantContent,
        },
      ]);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        logout();
        router.replace("/login");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: getApiErrorMessage(error),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100">
            <Sparkles className="size-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-950">Smart Financial Insights</h3>
            <p className="text-sm text-slate-600">Backend-generated advice for your wallet</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsRefreshing(true);
            setRefreshNonce((current) => current + 1);
          }}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="size-6 animate-spin text-slate-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
            {insights || "No insights returned by the backend."}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="size-4 text-indigo-600" />
              <h4 className="text-sm font-semibold text-slate-950">Ask about your wallet</h4>
            </div>

            <div className="max-h-64 space-y-3 overflow-auto rounded-xl bg-slate-50 p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ask about spending, saving, or how to manage your wallet better.
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAskQuestion} className="mt-4 flex gap-3">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4"
                placeholder="Ask a question about your wallet"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAsking ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                {isAsking ? "Sending..." : "Ask"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
