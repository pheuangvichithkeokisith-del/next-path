"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitFeedback } from "@/api/feedback";
import type { FeedbackAgreement, FeedbackPayload } from "@/types/feedback";
import { useSessionId } from "@/hooks/useSession";
import ErrorBanner from "@/components/ErrorBanner";
import {
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const RATING_DESCRIPTIONS = [
  "ຍັງບໍ່ຄ່ອຍກົງກັບຂ້ອຍປານໃດ",
  "ກົງບາງສ່ວນ ແຕ່ຍັງມີບາງຈຸດທີ່ບໍ່ແມ່ນ",
  "ກົງປານກາງ ຊ່ວຍໃຫ້ເຫັນບາງມຸມມອງ",
  "ກົງກັບຂ້ອຍຫຼາຍ ສອດຄ່ອງກັບຄວາມຮູ້ສຶກ",
  "ກົງຫຼາຍທີ່ສຸດ! ເຮັດໃຫ້ເຂົ້າໃຈຕົນເອງຊັດເຈນຂຶ້ນ",
];

export default function FeedbackPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [rating, setRating] = useState<number>(5);
  const [feltComfortable, setFeltComfortable] = useState<boolean>(true);
  const [comments, setComments] = useState<string>("");
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
    setSubmitting(true);
    setHasError(false);

    let agreement: FeedbackAgreement = "yes";
    if (rating <= 2) agreement = "not_really";
    else if (rating === 3) agreement = "unsure";

    const payload: FeedbackPayload = {
      agreement,
      incorrect_note: comments.trim() || null,
      next_interest: feltComfortable ? "ຮູ້ສຶກສະບາຍໃຈບໍ່ກົດດັນ" : "ຢາກໃຫ້ປັບປຸງ",
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

  // If user visits feedback with no session
  if (resolved && !sessionId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF3F0] text-[#7A3E2D] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#2D4C3E]">ຍັງບໍ່ພົບເຊດຊັນການສຳຫຼວດ</h1>
          <p className="text-sm text-[#2D4C3E]/75 leading-relaxed">
            ທ່ານຈຳເປັນຕ້ອງຕອບແບບສຳຫຼວດເພື່ອເບິ່ງຜົນສະທ້ອນກ່ອນ ຈຶ່ງຈະສາມາດສົ່ງຄຳຕິຊົມກ່ຽວກັບຜົນໄດ້.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3.5 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <span>ກັບຄືນໜ້າຫຼັກ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => router.push(sessionId ? "/report" : "/")}
        className="inline-flex items-center gap-2 text-sm text-[#2D4C3E]/70 hover:text-[#2D4C3E] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ກັບຄືນໜ້າຜົນສະທ້ອນ (Report)</span>
      </button>

      {submitted ? (
        /* Success State */
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6 animate-fade-in-scale">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#2D4C3E]">
              ຂອບໃຈຫຼາຍໆ ສຳລັບຄຳຕິຊົມຂອງທ່ານ!
            </h1>
            <p className="text-sm text-[#2D4C3E]/80 leading-relaxed max-w-md mx-auto">
              ສຽງຂອງທ່ານມີຄ່າຫຼາຍ ແລະ ຈະຊ່ວຍໃຫ້ Next-path ພັດທະນາໃຫ້ເປັນພື້ນທີ່ທີ່ອົບອຸ່ນ ແລະ ເໝາະສົມກັບໄວໜຸ່ມລາວຫຼາຍຍິ່ງຂຶ້ນ.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push("/report")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E5E1D8] text-sm font-medium text-[#2D4C3E] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
            >
              ກັບໄປອ່ານຜົນສະທ້ອນ
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D4C3E] text-[#F9F8F5] text-sm font-semibold hover:bg-[#233c31] transition-all cursor-pointer"
            >
              ກັບຄືນໜ້າຫຼັກ (Home)
            </button>
          </div>
        </div>
      ) : (
        /* Feedback Form */
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in-scale">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F3EB] text-[#8D5B28] text-xs font-medium mb-3">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>ຄຳຕິຊົມ ແລະ ຄວາມຄິດເຫັນ (Feedback)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E]">
              ຜົນສະທ້ອນນີ້ເປັນແນວໃດແດ່ສຳລັບທ່ານ?
            </h1>
            <p className="text-sm text-[#2D4C3E]/75 mt-1 leading-relaxed">
              ພວກເຮົາຢາກຟັງຄວາມຮູ້ສຶກຂອງທ່ານ ເພື່ອປັບປຸງປະສົບການໃຫ້ດີຂຶ້ນເລື້ອຍໆ.
            </p>
          </div>

          {hasError && <ErrorBanner onRetry={() => setHasError(false)} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Rating Stars / Buttons */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#2D4C3E]">
                1. ຜົນການສະທ້ອນກົງກັບຕົວຕົນ ຫຼື ຄວາມຮູ້ສຶກຂອງທ່ານຫຼາຍປານໃດ?
              </label>

              <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isSelected = rating >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#F7EFE3] text-[#8D5B28] border-2 border-[#8D5B28] scale-105"
                          : "bg-[#F9F8F5] text-[#2D4C3E]/30 border border-[#E5E1D8] hover:border-[#8D5B28]/50"
                      }`}
                      aria-label={`${starVal} ດາວ`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isSelected ? "fill-[#8D5B28] text-[#8D5B28]" : ""
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-medium text-[#8D5B28] pt-1">
                {RATING_DESCRIPTIONS[rating - 1]}
              </p>
            </div>

            {/* 2. Emotional Comfort Checkbox */}
            <div className="space-y-3 pt-2 border-t border-[#E5E1D8]">
              <label className="block text-sm font-semibold text-[#2D4C3E]">
                2. ທ່ານຮູ້ສຶກສະບາຍໃຈ ແລະ ບໍ່ມີຄວາມກົດດັນໃນລະຫວ່າງການຕອບບໍ?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFeltComfortable(true)}
                  className={`p-3.5 rounded-xl border text-sm text-left flex items-center justify-between cursor-pointer transition-all ${
                    feltComfortable
                      ? "bg-[#EBF2EE] border-[#2D4C3E] text-[#2D4C3E] font-semibold"
                      : "bg-[#F9F8F5] border-[#E5E1D8] text-[#2D4C3E]/80 hover:bg-[#F4EFEA]"
                  }`}
                >
                  <span>ສະບາຍໃຈ ຜ່ອນຄາຍດີ</span>
                  {feltComfortable && <CheckCircle2 className="w-4 h-4 text-[#2D4C3E]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFeltComfortable(false)}
                  className={`p-3.5 rounded-xl border text-sm text-left flex items-center justify-between cursor-pointer transition-all ${
                    !feltComfortable
                      ? "bg-[#FDF3F0] border-[#7A3E2D] text-[#7A3E2D] font-semibold"
                      : "bg-[#F9F8F5] border-[#E5E1D8] text-[#2D4C3E]/80 hover:bg-[#F4EFEA]"
                  }`}
                >
                  <span>ຍັງມີບາງຈຸດທີ່ກົດດັນ ຫຼື ຍາວເກີນໄປ</span>
                  {!feltComfortable && <CheckCircle2 className="w-4 h-4 text-[#7A3E2D]" />}
                </button>
              </div>
            </div>

            {/* 3. Open Comments Textarea */}
            <div className="space-y-2 pt-2 border-t border-[#E5E1D8]">
              <label htmlFor="feedback-comments" className="block text-sm font-semibold text-[#2D4C3E]">
                3. ສິ່ງທີ່ທ່ານຢາກບອກພວກເຮົາເພີ່ມເຕີມ (ບໍ່ບັງຄັບ):
              </label>
              <textarea
                id="feedback-comments"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="ບອກສິ່ງທີ່ເຈົ້າມັກ, ສິ່ງທີ່ຢາກໃຫ້ປັບປຸງ ຫຼື ຄວາມຮູ້ສຶກຫຼັງຈາກໄດ້ອ່ານບົດສະທ້ອນ..."
                className="w-full p-4 rounded-2xl border border-[#E5E1D8] bg-[#F9F8F5] text-sm text-[#2D4C3E] placeholder:text-[#2D4C3E]/40 focus:outline-none focus:border-[#2D4C3E] focus:bg-[#FFFFFF] transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-base font-semibold hover:bg-[#233c31] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.985] disabled:opacity-50"
              >
                <span>{submitting ? "ກຳລັງສົ່ງຂໍ້ມູນ..." : "ສົ່ງຄຳຕິຊົມ"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
