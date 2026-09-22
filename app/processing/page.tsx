"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSessionNotFound } from "@/api/errors";
import { getSessionStatus } from "@/api/session";
import ErrorBanner from "@/components/ErrorBanner";
import { UI_COPY } from "@/content/copy";
import { clearSessionId, useSessionId } from "@/hooks/useSession";

export default function ProcessingPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [hasError, setHasError] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!resolved) return;
    if (!sessionId) {
      router.replace("/introduction");
      return;
    }

    let active = true;
    let timer: number | undefined;

    const poll = () => {
      getSessionStatus(sessionId)
        .then(({ status }) => {
          if (!active) return;
          if (status === "completed") {
            router.replace("/report");
          } else if (status === "failed") {
            setFailed(true);
            setHasError(true);
          } else {
            timer = window.setTimeout(poll, 2000);
          }
        })
        .catch((error: unknown) => {
          if (!active) return;
          if (isSessionNotFound(error)) {
            clearSessionId();
            router.replace("/introduction");
          } else {
            // Standalone mode: transition to report after a calm contemplation interval
            timer = window.setTimeout(() => {
              if (active) router.replace("/report");
            }, 2500);
          }
        });
    };

    poll();

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [retryToken, router, resolved, sessionId]);

  function retry(): void {
    setHasError(false);
    setRetryToken((token) => token + 1);
  }

  function restart(): void {
    clearSessionId();
    router.replace("/introduction");
  }

  return (
    <main className="flex-1 bg-[#FAF9F5] px-4 py-12 flex flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md text-center space-y-8">
        {/* Calm Information Organization Visual (No sci-fi/robot/brain) */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-stone-300 animate-breathe" />
          <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
            <span className="w-3 h-3 rounded-full bg-stone-100" />
          </div>
        </div>

        {/* Text and reassurance */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            {UI_COPY.processing.heading}
          </h1>
          <p className="text-base text-stone-600 leading-relaxed">
            {UI_COPY.processing.body}
          </p>
        </div>

        {/* Calm notice card */}
        <div className="rounded-2xl bg-stone-100/70 border border-stone-200/80 p-4 text-xs text-stone-600 leading-relaxed text-left">
          <p className="font-medium text-stone-800 mb-1">ສຳຫຼວດຮູບແບບຄຳຕອບ</p>
          <p>
            {UI_COPY.processing.calmNotice}
          </p>
        </div>

        {hasError ? (
          <div className="text-left pt-4">
            <ErrorBanner onRetry={failed ? restart : retry} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
