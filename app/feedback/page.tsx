"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitFeedback } from "@/api/feedback";
import type { FeedbackAgreement, FeedbackPayload } from "@/types/feedback";
import { useSessionId } from "@/hooks/useSession";
import ErrorBanner from "@/components/ErrorBanner";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";

export default function FeedbackPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [agreement, setAgreement] = useState<FeedbackAgreement | null>(null);
  const [incorrectNote, setIncorrectNote] = useState("");
  const [nextInterest, setNextInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (resolved && !sessionId) {
      router.replace("/");
    }
  }, [resolved, router, sessionId]);

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
      if (!sessionId) {
        setHasError(true);
        return;
      }

      await submitFeedback(sessionId, payload);
      setSubmitted(true);
    } catch {
      setHasError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex-1 px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white subtle-border shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center mx-auto text-xl font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#171A1F]">
              ຂອບໃຈສຳລັບຄຳຄິດເຫັນ
            </h2>
            <p className="text-xs sm:text-sm text-[#6A6357] leading-relaxed">
              ທຸກຄຳຕອບ ແລະ ຂໍ້ສະເໜີແນະຂອງທ່ານມີຄຸນຄ່າໃນການປັບປຸງລະບົບ Next-path ໃຫ້ດີຍິ່ງຂຶ້ນ.
            </p>
          </div>
          <div className="pt-2">
            <button
              className="btn-primary w-full text-sm"
              onClick={() => router.push("/")}
              type="button"
            >
              ກັບຄືນໜ້າຫຼັກ
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main aria-labelledby="feedback-heading" className="flex-1 px-4 py-10 sm:py-14 flex flex-col items-center max-w-xl mx-auto w-full">
      <div className="w-full space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-1.5 text-xs text-[#7A7365] hover:text-[#171A1F] mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ກັບຄືນ</span>
          </button>

          <h1 id="feedback-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171A1F]">
            ໃຫ້ຄຳເຫັນກ່ຽວກັບລະບົບ (Feedback)
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#6A6357] leading-relaxed">
            ບອກຄວາມຮູ້ສຶກ ແລະ ຄວາມຄິດເຫັນຂອງທ່ານກ່ຽວກັບຜົນສະທ້ອນທີ່ໄດ້ຮັບ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question 1: Agreement */}
          <div className="surface-panel p-5 sm:p-6 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-[#171A1F]">
              1. ທ່ານຮູ້ສຶກວ່າຜົນສະທ້ອນກົງກັບຕົວທ່ານຫຼືບໍ່? <span className="text-[#8A4F3E]">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[
                { value: "yes", label: "ກົງຫຼາຍ" },
                { value: "not_really", label: "ບໍ່ຄ່ອຍກົງ" },
                { value: "unsure", label: "ຍັງບໍ່ແນ່ໃຈ" },
              ].map((opt) => {
                const isSelected = agreement === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAgreement(opt.value as FeedbackAgreement)}
                    className={`min-h-12 rounded-xl border px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer text-center flex items-center justify-center select-none ${
                      isSelected
                        ? "bg-[#2D4C3E] text-white border-[#2D4C3E] shadow-2xs"
                        : "bg-white text-[#2C271F] subtle-border hover:bg-[#FAF9F5]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Incorrect note */}
          <div className="surface-panel p-5 sm:p-6 space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-[#171A1F]">
              2. ມີຈຸດໃດທີ່ທ່ານຮູ້ສຶກວ່າຍັງບໍ່ຄ່ອຍຖືກຕ້ອງ? (ຖ້າມີ)
            </label>
            <textarea
              className="input-calm w-full min-h-[7rem] resize-y text-sm"
              onChange={(e) => setIncorrectNote(e.target.value)}
              placeholder="ຕົວຢ່າງ: ຮູ້ສຶກວ່າດ້ານຄວາມສົນໃຈບາງຢ່າງຍັງບໍ່ຄ່ອຍກົງ..."
              value={incorrectNote}
            />
          </div>

          {/* Question 3: Next interest */}
          <div className="surface-panel p-5 sm:p-6 space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-[#171A1F]">
              3. ທ່ານຢາກໃຫ້ລະບົບຊ່ວຍແນະນຳຫຍັງຕື່ມອີກໃນອະນາຄົດ?
            </label>
            <textarea
              className="input-calm w-full min-h-[7rem] resize-y text-sm"
              onChange={(e) => setNextInterest(e.target.value)}
              placeholder="ຕົວຢ່າງ: ຢາກຮູ້ວິທີຝຶກທັກສະເທັກໂນໂລຊີ ຫຼື ທຶນການສຶກສາ..."
              value={nextInterest}
            />
          </div>

          {hasError ? <ErrorBanner onRetry={() => setHasError(false)} /> : null}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              className="btn-primary w-full text-sm sm:text-base flex items-center justify-center space-x-2"
              disabled={!agreement || submitting}
              type="submit"
            >
              <span>{submitting ? "ກຳລັງສົ່ງ..." : "ສົ່ງຄຳຄິດເຫັນ"}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
