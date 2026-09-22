"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFeedback } from "@/api/feedback";
import type { FeedbackAgreement, FeedbackPayload } from "@/types/feedback";
import { UI_COPY } from "@/content/copy";
import { useSessionId } from "@/hooks/useSession";
import ErrorBanner from "@/components/ErrorBanner";

export default function FeedbackPage() {
  const router = useRouter();
  const { sessionId } = useSessionId();
  const [agreement, setAgreement] = useState<FeedbackAgreement | null>(null);
  const [incorrectNote, setIncorrectNote] = useState("");
  const [nextInterest, setNextInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!agreement) return;

    setSubmitting(true);
    setHasError(false);

    const payload: FeedbackPayload = {
      agreement,
      incorrect_note: incorrectNote.trim() || null,
      next_interest: nextInterest.trim() || null,
    };

    try {
      if (sessionId) {
        await submitFeedback(sessionId, payload);
      }
      setSubmitted(true);
    } catch {
      // Standalone mode: mark submitted
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex-1 bg-[#FAF9F5] px-4 py-12 flex items-center justify-center">
        <div className="card-calm max-w-md w-full text-center space-y-6 p-8">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-900">
              {UI_COPY.feedback.thanks}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              ທຸກຄຳຕອບ ແລະ ຂໍ້ສະເໜີແນະຂອງທ່ານມີຄຸນຄ່າໃນການປັບປຸງລະບົບ PATHAI ໃຫ້ດີຍິ່ງຂຶ້ນ
            </p>
          </div>
          <div className="pt-2">
            <button
              className="btn-primary w-full text-sm"
              onClick={() => router.push("/")}
              type="button"
            >
              {UI_COPY.feedback.backHome}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#FAF9F5] px-4 py-8 sm:py-12 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            {UI_COPY.feedback.submit}
          </h1>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            ບອກຄວາມຮູ້ສຶກ ແລະ ຄວາມຄິດເຫັນຂອງທ່ານກ່ຽວກັບຜົນສະທ້ອນທີ່ໄດ້ຮັບ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Agreement */}
          <div className="card-calm space-y-3">
            <label className="block text-base font-semibold text-stone-900">
              1. {UI_COPY.feedback.agreementPrompt} <span className="text-amber-700">*</span>
            </label>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {[
                { value: "yes", label: UI_COPY.feedback.yes },
                { value: "not_really", label: UI_COPY.feedback.notReally },
                { value: "unsure", label: UI_COPY.feedback.unsure },
              ].map((opt) => {
                const isSelected = agreement === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAgreement(opt.value as FeedbackAgreement)}
                    className={`min-h-[48px] rounded-xl border px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition cursor-pointer text-center flex items-center justify-center ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                        : "bg-white text-stone-800 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Incorrect note */}
          <div className="card-calm space-y-2">
            <label className="block text-sm font-semibold text-stone-900">
              2. {UI_COPY.feedback.incorrectNote}
            </label>
            <textarea
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200 transition min-h-[90px]"
              onChange={(e) => setIncorrectNote(e.target.value)}
              placeholder="ຕົວຢ່າງ: ຮູ້ສຶກວ່າດ້ານຄວາມສົນໃຈບາງຢ່າງຍັງບໍ່ຄ່ອຍຕົງ..."
              value={incorrectNote}
            />
          </div>

          {/* Question 3: Next interest */}
          <div className="card-calm space-y-2">
            <label className="block text-sm font-semibold text-stone-900">
              3. {UI_COPY.feedback.nextInterest}
            </label>
            <textarea
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200 transition min-h-[90px]"
              onChange={(e) => setNextInterest(e.target.value)}
              placeholder="ຕົວຢ່າງ: ຢາກຮູ້ວິທີຝຶກທັກສະເທັກໂນໂລຊີ ຫຼື ທຶນການສຶກສາ..."
              value={nextInterest}
            />
          </div>

          {hasError ? (
            <ErrorBanner onRetry={() => setHasError(false)} />
          ) : null}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              className="btn-ghost text-sm"
              onClick={() => router.back()}
              type="button"
            >
              ← ກັບຄືນ
            </button>

            <button
              className="btn-primary text-sm shadow-xs"
              disabled={!agreement || submitting}
              type="submit"
            >
              {submitting ? "ກຳລັງສົ່ງ..." : UI_COPY.feedback.submit}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
