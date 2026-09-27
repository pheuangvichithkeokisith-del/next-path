"use client";

import { useSyncExternalStore } from "react";
import { CURRENT_FORM_REVISION } from "@/utils/formRevision";

const SESSION_KEY = "pathai.session.id.v1";
const SESSION_REVISION_KEY = "pathai.session.revision.v1";

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

function getResolvedSnapshot(): boolean {
  return true;
}

function getServerResolvedSnapshot(): boolean {
  return false;
}

export function storeSessionId(
  sessionId: string,
  revision = CURRENT_FORM_REVISION,
): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, sessionId);
    window.localStorage.setItem(SESSION_REVISION_KEY, revision);
    window.dispatchEvent(new Event("storage"));
  }
}

export function clearSessionId(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_REVISION_KEY);
    window.dispatchEvent(new Event("storage"));
  }
}

export function getStoredSessionRevision(): string | null {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(SESSION_REVISION_KEY)
    : null;
}

export function useSessionId(): { sessionId: string | null; resolved: boolean } {
  const sessionId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolved = useSyncExternalStore(subscribe, getResolvedSnapshot, getServerResolvedSnapshot);

  return { sessionId, resolved };
}
