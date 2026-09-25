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
    <main className="flex-1 bg-[#FAF9F5] px-4 py-10 sm:px-6 sm:py-16 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl surface-panel p-6 sm:p-10">
        {/* Title & Introduction */}
        <div className="eyebrow mb-5">
          <span className="eyebrow-dot"></span>
          <span>ກ່ອນເລີ່ມ — ຂໍ້ມູນຂອງທ່ານ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A1F] leading-tight">
          {UI_COPY.introduction.heading}
        </h1>

        <p className="mt-3 text-base text-[#5B5345] leading-relaxed">
          ກະລຸນາອ່ານລາຍລະອຽດການເກັບກຳຂໍ້ມູນກ່ອນເລີ່ມຕົ້ນ ເພື່ອຄວາມໂປ່ງໃສ ແລະ ຄວາມສະບາຍໃຈຂອງທ່ານ
        </p>

        {/* Data Cards (Collected vs Not Collected) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="surface-panel p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>ສິ່ງທີ່ລະບົບເກັບກຳ</span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {UI_COPY.introduction.collected}
            </p>
          </div>

          <div className="surface-panel p-5">
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
        <div className="mt-4 rounded-2xl bg-[#F2EFE8] border border-[#E5E1D8] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            ຈຸດປະສົງການນຳໃຊ້
          </p>
          <p className="text-sm text-stone-700 leading-relaxed">
            {UI_COPY.introduction.purpose}
          </p>
        </div>

        {/* Consent Checkbox */}
        <ConsentCheckbox checked={consented} onChange={setConsented} />

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
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
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
