"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "pathai.session.id.v1";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string | null {
  return typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
}

function getServerSnapshot(): string | null {
  return null;
}

export function storeSessionId(sessionId: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, sessionId);
    window.dispatchEvent(new Event("storage"));
  }
}

export function clearSessionId(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("storage"));
  }
}

export function useSessionId(): { sessionId: string | null; resolved: boolean } {
  const sessionId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolved = typeof window !== "undefined";

  return { sessionId, resolved };
}
