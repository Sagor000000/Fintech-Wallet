"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Wallet as WalletIcon } from "lucide-react";

import {
  loadStoredNotifications,
  markNotificationAsReadLocally,
  storeNotification,
  subscribeToWalletNotifications,
} from "@/lib/notifications";
import type { NotificationItem } from "@/types/auth";

type DashboardHeaderProps = {
  walletId: number;
  activeSection?: "dashboard" | "transactions" | "cards" | "insights" | "kyc";
  onLogout: () => void;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", section: "dashboard" },
  { href: "/transactions", label: "Transactions", section: "transactions" },
  { href: "/cards", label: "Cards", section: "cards" },
  { href: "/insights", label: "Insights", section: "insights" },
  { href: "/kyc", label: "KYC", section: "kyc" },
];

export function DashboardHeader({ walletId, activeSection, onLogout }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStoredNotifications(walletId)
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const initializeNotifications = () => {
      setNotifications(loadStoredNotifications(walletId));
    };

    const initialLoadTimer = window.setTimeout(initializeNotifications, 0);
    const unsubscribe = subscribeToWalletNotifications(
      walletId,
      (notification) => {
        setNotifications(() => storeNotification(walletId, notification));
        setIsOpen(true);
      },
      setIsConnected
    );

    return () => {
      window.clearTimeout(initialLoadTimer);
      unsubscribe();
    };
  }, [walletId]);

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      const updated = markNotificationAsReadLocally(walletId, notification.id);
      setNotifications(updated);
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
            <WalletIcon className="size-4" />
          </span>
          Fintech Wallet
        </Link>

        <div className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.section;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : item.label === "KYC"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="relative inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Open notifications"
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />
              ) : null}
            </button>

            {isOpen ? (
              <div className="absolute right-0 z-20 mt-3 w-[22rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-slate-950">Notifications</h3>
                  <span className="text-xs text-slate-500">{isConnected ? `${unreadCount} unread` : "Offline"}</span>
                </div>

                <div className="max-h-80 space-y-2 overflow-auto">
                  {!isConnected && notifications.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-slate-500">Connecting to notifications...</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-slate-500">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition hover:bg-slate-50 ${
                          notification.isRead
                            ? "border-slate-100 bg-white"
                            : "border-emerald-200 bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-950">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-[11px] uppercase tracking-wide text-slate-400">
                            {notification.type ?? "Alert"}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSigningOut(true);
              onLogout();
            }}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogOut className={`size-4 ${isSigningOut ? "animate-pulse" : ""}`} />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}