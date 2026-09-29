"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/api/session";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import { UI_COPY } from "@/content/copy";
import { storeSessionId } from "@/hooks/useSession";

export default function IntroductionPage() {
  const router = useRouter();
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function begin(): Promise<void> {
    setBusy(true);
    setHasError(false);
    try {
      const { session_id } = await createSession();
      storeSessionId(session_id);
      router.push("/assessment");
    } catch {
      setHasError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex-1 bg-[#FAF9F5] px-4 py-10 sm:px-6 sm:py-16 flex flex-col justify-center overflow-hidden">
      {/* Ambient Floating Orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 overflow-hidden opacity-50 z-0">
        <div className="absolute top-8 left-16 w-60 h-60 rounded-full bg-[#2D4C3E]/6 blur-3xl animate-float-slow" />
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full bg-[#8D5B28]/5 blur-3xl animate-float-reverse" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl surface-panel p-6 sm:p-10 z-10 animate-fade-in-scale">
        {/* Title & Introduction */}
        <div className="eyebrow mb-5 animate-fade-in-up">
          <span className="eyebrow-dot"></span>
          <span>ກ່ອນເລີ່ມ — ຂໍ້ມູນຂອງທ່ານ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A1F] leading-tight animate-fade-in-up delay-75">
          {UI_COPY.introduction.heading}
        </h1>

        <p className="mt-3 text-base text-[#5B5345] leading-relaxed animate-fade-in-up delay-100">
          ກະລຸນາອ່ານລາຍລະອຽດການເກັບກຳຂໍ້ມູນກ່ອນເລີ່ມຕົ້ນ ເພື່ອຄວາມໂປ່ງໃສ ແລະ ຄວາມສະບາຍໃຈຂອງທ່ານ
        </p>

        {/* Data Cards (Collected vs Not Collected) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up delay-150">
          <div className="surface-panel p-5 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse-ring"></span>
              <span>ສິ່ງທີ່ລະບົບເກັບກຳ</span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {UI_COPY.introduction.collected}
            </p>
          </div>

          <div className="surface-panel p-5 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-2 text-stone-600 font-medium text-sm mb-2">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              <span>ສິ່ງທີ່ບໍ່ເກັບກຳ</span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {UI_COPY.introduction.notCollected}
            </p>
          </div>
        </div>

        {/* Purpose */}
        <div className="mt-4 rounded-2xl bg-[#F2EFE8] border border-[#E5E1D8] p-4 sm:p-5 animate-fade-in-up delay-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            ຈຸດປະສົງການນຳໃຊ້
          </p>
          <p className="text-sm text-stone-700 leading-relaxed">
            {UI_COPY.introduction.purpose}
          </p>
        </div>

        {/* Consent Checkbox */}
        <div className="animate-fade-in-up delay-250">
          <ConsentCheckbox checked={consented} onChange={setConsented} />
        </div>

        {/* Error / Loading State */}
        {hasError ? (
          <div className="mt-5">
            <ErrorBanner onRetry={begin} />
          </div>
        ) : null}

        {busy ? (
          <div className="mt-5">
            <Loading className="h-14" />
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
          <button
            className="w-full sm:w-auto btn-primary justify-center shadow-sm"
            disabled={!consented || busy}
            onClick={begin}
            type="button"
          >
            {UI_COPY.introduction.confirm}
            <span className="ml-2">→</span>
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/")}
            className="btn-ghost text-sm"
          >
            ກັບຄືນໜ້າຫຼັກ
          </button>
        </div>
      </div>
    </main>
  );
}
