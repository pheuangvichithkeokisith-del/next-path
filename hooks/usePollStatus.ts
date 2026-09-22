"use client";

import { useEffect, useRef, useState } from "react";
import { getSessionStatus } from "@/api/session";
import type { SessionStatus } from "@/types/session";

export function usePollStatus(
  sessionId: string | null,
  intervalMs = 2000,
): { status: SessionStatus | null; error: Error | null } {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await getSessionStatus(sessionId!);
        if (cancelled) return;
        setStatus(res);
        if (res.status !== "completed" && res.status !== "failed") {
          timerRef.current = setTimeout(checkStatus, intervalMs);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId, intervalMs]);

  return { status, error };
}
