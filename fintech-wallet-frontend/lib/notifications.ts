import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type { NotificationItem } from "@/types/auth";

const NOTIFICATION_STORAGE_PREFIX = "fw_notifications_";
const DEFAULT_BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

function getNotificationsStorageKey(walletId: number): string {
  return `${NOTIFICATION_STORAGE_PREFIX}${walletId}`;
}

export function loadStoredNotifications(walletId: number): NotificationItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(getNotificationsStorageKey(walletId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredNotifications(walletId: number, notifications: NotificationItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getNotificationsStorageKey(walletId), JSON.stringify(notifications));
}

function buildNotificationItem(message: string): NotificationItem {
  return {
    id: Date.now(),
    title: "Wallet notification",
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
    type: "WALLET",
  };
}

function getWebSocketUrl(): string {
  return `${DEFAULT_BACKEND_BASE_URL.replace(/\/$/, "")}/ws`;
}

function parseNotificationMessage(body: string): NotificationItem {
  try {
    const parsed = JSON.parse(body) as Partial<NotificationItem> & { message?: string };
    if (parsed && typeof parsed.message === "string") {
      return {
        id: typeof parsed.id === "number" ? parsed.id : Date.now(),
        title: parsed.title ?? "Wallet notification",
        message: parsed.message,
        isRead: Boolean(parsed.isRead),
        createdAt: parsed.createdAt ?? new Date().toISOString(),
        type: parsed.type,
      };
    }
  } catch {
    // Fall through to plain-text handling.
  }

  return buildNotificationItem(body);
}

export function subscribeToWalletNotifications(
  walletId: number,
  onNotification: (notification: NotificationItem) => void,
  onConnectionChange?: (connected: boolean) => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const client = new Client({
    webSocketFactory: () => new SockJS(getWebSocketUrl()),
    reconnectDelay: 5000,
    debug: () => undefined,
  });

  let subscription: { unsubscribe: () => void } | null = null;

  client.onConnect = () => {
    onConnectionChange?.(true);
    subscription = client.subscribe(`/topic/notifications/${walletId}`, (frame: IMessage) => {
      onNotification(parseNotificationMessage(frame.body));
    });
  };

  client.onDisconnect = () => {
    onConnectionChange?.(false);
  };

  client.onStompError = () => {
    onConnectionChange?.(false);
  };

  client.activate();

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
    client.deactivate();
  };
}

export function markNotificationAsReadLocally(
  walletId: number,
  notificationId: number
): NotificationItem[] {
  const notifications = loadStoredNotifications(walletId).map((notification) =>
    notification.id === notificationId ? { ...notification, isRead: true } : notification
  );

  saveStoredNotifications(walletId, notifications);
  return notifications;
}

export function storeNotification(walletId: number, notification: NotificationItem): NotificationItem[] {
  const existing = loadStoredNotifications(walletId);
  const next = [notification, ...existing].slice(0, 20);
  saveStoredNotifications(walletId, next);
  return next;
}