"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getForm } from "@/api/assessment";
import { completeSession, createSession, getSessionStatus, saveAnswer } from "@/api/session";
import { isSessionNotFound } from "@/api/errors";
import { clearSessionId, storeSessionId, useSessionId } from "@/hooks/useSession";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import Question from "@/components/Question";
import { clearDraft, restoreDraft, saveDraft } from "@/utils/draft";
import {
  BookmarkCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Compass,
  Layers,
  HelpCircle,
  Lightbulb,
  Heart,
  Target,
  Route,
  UserCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  DraftAnswer,
  DraftAnswers,
  FormItem,
  QuestionnaireForm,
} from "@/types/form";

function emptyAnswer(): DraftAnswer {
  return {
    option_codes: [],
    other_text: null,
    extra_text: null,
    text_value: null,
  };
}

function isAnswered(item: FormItem, answer: DraftAnswer | undefined): boolean {
  if (!answer) return false;
  if (item.type === "text") {
    return Boolean(answer.text_value?.trim());
  }
  if (answer.option_codes.length === 0) {
    return false;
  }
  return item.min_select === undefined || answer.option_codes.length >= item.min_select;
}

interface SectionGroup {
  id: string;
  titleLo: string;
  descLo: string;
  icon: LucideIcon;
  items: FormItem[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const { sessionId, resolved: sessionResolved } = useSessionId();
  const [form, setForm] = useState<QuestionnaireForm | null>(null);
  const [draft, setDraft] = useState<DraftAnswers>(() => {
    if (typeof window !== "undefined") {
      return restoreDraft(window.localStorage);
    }
    return {};
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [isSavedFlash, setIsSavedFlash] = useState(false);
  const saveTimers = useRef<Record<string, number>>({});

  // Load form definition
  useEffect(() => {
    let active = true;
    getForm()
      .then((data) => {
        if (active) setForm(data);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Ensure clean, valid session exists
  useEffect(() => {
    if (!sessionResolved) return;
    if (!sessionId) {
      createSession()
        .then(({ session_id }) => {
          storeSessionId(session_id);
        })
        .catch(() => {
          const fallbackId = `session-${Date.now()}`;
          storeSessionId(fallbackId);
        });
    } else {
      // If returning to assessment with an already completed session, start a fresh session
      getSessionStatus(sessionId)
        .then(({ status }) => {
          if (status === "completed") {
            clearSessionId();
            if (typeof window !== "undefined") {
              clearDraft(window.localStorage);
            }
            setDraft({});
            createSession().then(({ session_id }) => {
              storeSessionId(session_id);
            });
          }
        })
        .catch(() => {
          // Offline fallback
        });
    }
  }, [sessionResolved, sessionId]);

  // Handle answers update
  const updateAnswer = (itemId: string, changes: Partial<DraftAnswer>) => {
    const previous = draft[itemId] ?? emptyAnswer();
    const updated: DraftAnswer = { ...previous, ...changes };
    const nextDraft = { ...draft, [itemId]: updated };

    setDraft(nextDraft);
    if (typeof window !== "undefined") {
      saveDraft(window.localStorage, nextDraft);
    }

    // Auto-save flash feedback
    setIsSavedFlash(true);
    setTimeout(() => setIsSavedFlash(false), 1200);

    // Async autosave to backend if session exists
    if (sessionId) {
      const previousTimer = saveTimers.current[itemId];
      if (previousTimer !== undefined) window.clearTimeout(previousTimer);
      saveTimers.current[itemId] = window.setTimeout(() => {
        saveAnswer(sessionId, itemId, updated).catch((err) => {
          if (isSessionNotFound(err)) {
            clearSessionId();
            createSession()
              .then(({ session_id }) => storeSessionId(session_id))
              .catch(() => undefined);
          }
        });
      }, 250);
    }
  };

  const sections = useMemo<SectionGroup[]>(() => {
    if (!form) return [];

    const result: SectionGroup[] = [];

    // 1. Demographics
    if (form.demographics && form.demographics.length > 0) {
      result.push({
        id: "sec-demo",
        titleLo: "ຂໍ້ມູນເບື້ອງຕົ້ນ (Demographics)",
        descLo: "ກະລຸນາບອກຂໍ້ມູນທົ່ວໄປເພື່ອຊ່ວຍໃຫ້ລະບົບເຂົ້າໃຈບໍລິບົດຂອງທ່ານ",
        icon: UserCheck,
        items: form.demographics,
      });
    }

    // Group Q1-Q28 into the 8 actual modules
    const qList = form.questions || [];
    const secMap: Record<string, { titleLo: string; descLo: string; icon: LucideIcon }> = {
      interests: {
        titleLo: "ໝວດ 1 — ຄວາມສົນໃຈ (Interests)",
        descLo: "ສິ່ງທີ່ເຮັດແລ້ວມີຄວາມສຸກ ລືມເວລາ ແລະ ຢາກຮຽນຮູ້",
        icon: Compass,
      },
      skills: {
        titleLo: "ໝວດ 2 — ທັກສະ (Skills)",
        descLo: "ຈຸດແຂງທີ່ຄົນອື່ນຊົມเชย ແລະ ສິ່ງທີ່ເຄີຍເຮັດຈົນພູມໃຈ",
        icon: Sparkles,
      },
      values: {
        titleLo: "ໝວດ 3 — ຄ່ານິຍົມ (Values)",
        descLo: "ສິ່ງທີ່ສຳຄັນທີ່ສຸດໃນການເຮັດວຽກ ແລະ ສິ່ງທີ່ຢາກໃຫ້ຄົນຈື່",
        icon: Heart,
      },
      work_style: {
        titleLo: "ໝວດ 4 — ຮູບແບບການເຮັດວຽກ (Work Style)",
        descLo: "ວິທີຮັບມືກັບບັນຫາ ການຕັດສິນໃຈ ແລະ ສະພາບແວດລ້ອມທີ່ມັກ",
        icon: Layers,
      },
      learning: {
        titleLo: "ໝວດ 5 — ການຮຽນ ແລະ ການຮຽນຮູ້ (Learning)",
        descLo: "ດ້ານທີ່ຢາກຮຽນຮູ້ເພີ່ມ ແລະ ວິທີຮຽນທີ່ເຂົ້າໃຈດີທີ່ສຸດ",
        icon: Lightbulb,
      },
      goals: {
        titleLo: "ໝວດ 6 — ເປົ້າໝາຍ (Goals)",
        descLo: "ພາບຕົນເອງໃນອີກ 5 ປີ ແລະ ຜົນດີທີ່ຢາກສ້າງໃຫ້ສັງຄົມ",
        icon: Target,
      },
      feasibility: {
        titleLo: "ໝວດ 7 — ຄວາມເປັນໄປໄດ້ຕົວຈິງ (Feasibility)",
        descLo: "ຂໍ້ຈຳກັດດ້ານເວລາ ສະຖານທີ່ ແລະ ຄວາມພ້ອມໃນການຍ້າຍພື້ນທີ່",
        icon: HelpCircle,
      },
      journey: {
        titleLo: "ໝວດ 8 — ເສັ້ນທາງການເດີນຕໍ່ (Journey)",
        descLo: "ວິທີປັບຕົວເມື່ອບໍ່ເປັນໄປຕາມແຜນ ແລະ ຄວາມຍືດຢຸ່ນໃນອະນາຄົດ",
        icon: Route,
      },
    };

    const grouped: Record<string, FormItem[]> = {};
    for (const q of qList) {
      const secKey = q.section || "general";
      if (!grouped[secKey]) grouped[secKey] = [];
      grouped[secKey].push(q);
    }

    for (const [key, items] of Object.entries(grouped)) {
      const meta = secMap[key] || {
        titleLo: `ໝວດ ${key}`,
        descLo: "",
        icon: Compass,
      };
      result.push({
        id: `sec-${key}`,
        titleLo: meta.titleLo,
        descLo: meta.descLo,
        icon: meta.icon,
        items,
      });
    }

    return result;
  }, [form]);

  // Total questions count (Q1-Q28)
  const totalQuestions = form?.questions?.length ?? 28;
  const answeredQCount = useMemo(() => {
    if (!form?.questions) return 0;
    return form.questions.filter((q) => isAnswered(q, draft[q.id])).length;
  }, [form, draft]);

  const percentage = Math.min(100, Math.round((answeredQCount / totalQuestions) * 100));

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError(false);
    try {
      if (sessionId) {
        // Explicitly flush and save ALL answered items in draft to ensure 100% data persistence
        const itemsToSave = Object.entries(draft).filter(([, ans]) =>
          (ans.option_codes && ans.option_codes.length > 0) ||
          ans.text_value ||
          ans.extra_text ||
          ans.other_text
        );
        await Promise.all(
          itemsToSave.map(([itemId, ans]) => saveAnswer(sessionId, itemId, ans))
        );
        await completeSession(sessionId);
      }
      router.push("/processing");
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (hasError) {
    return (
      <main className="flex-1 px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <ErrorBanner onRetry={() => setHasError(false)} />
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="flex-1 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-xl text-center space-y-4">
          <Loading className="h-48" />
          <p className="text-sm text-[#7D7565]">ກຳລັງໂຫລດແບບສຳຫຼວດ...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* Sticky Progress & Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[#F9F8F5]/95 backdrop-blur-md subtle-border-b py-3 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs sm:text-sm font-bold text-[#1D2229]">
              ຕອບແລ້ວ {answeredQCount} / {totalQuestions} ຂໍ້
            </span>
            <div className="w-24 sm:w-36 h-2 bg-[#EBE7DD] rounded-full overflow-hidden hidden xs:block">
              <div
                className="h-full bg-[#2D4C3E] rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-save indicator */}
            <span
              className={`text-xs text-[#2D4C3E] font-medium flex items-center space-x-1 transition-opacity duration-300 ${
                isSavedFlash ? "opacity-100" : "opacity-0"
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ບັນທຶກອັດຕະໂນມັດແລ້ວ</span>
            </span>

            {answeredQCount >= 10 && (
              <button
                onClick={handleComplete}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded-lg bg-[#2D4C3E] text-white text-xs font-semibold hover:bg-[#233C31] transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>ສັງເຄາະຜົນ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Continuous Form Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {submitError ? <ErrorBanner onRetry={handleComplete} /> : null}

        {/* Intro Banner */}
        <div className="text-center max-w-xl mx-auto pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7D7565] block mb-1.5">
            ການສຳຫຼວດແບບຕໍ່ເນື່ອງ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A1F] tracking-tight">
            28 ຄຳຖາມເພື່ອຄວາມເຂົ້າໃຈຕົນເອງ
          </h1>
          <p className="text-xs sm:text-sm text-[#615B50] mt-2 leading-relaxed">
            ເລື່ອນຕອບຕາມລຳດັບຢ່າງສະບາຍໃຈ. ທຸກຄຳຕອບຈະຖືກບັນທຶກອັດຕະໂນມັດ. ບໍ່ມີຂໍ້ໃດຖືກຫຼືຜິດ.
          </p>
        </div>

        {/* Section Groups */}
        {sections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <section key={sec.id} className="space-y-6 pt-4">
              {/* Section Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F2EFE8] subtle-border">
                <div className="flex items-center space-x-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-white subtle-border flex items-center justify-center text-[#2D4C3E]">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#171A1F]">
                    {sec.titleLo}
                  </h2>
                </div>
                {sec.descLo && (
                  <p className="text-xs sm:text-sm text-[#61584A] mt-1.5 leading-relaxed pl-11">
                    {sec.descLo}
                  </p>
                )}
              </div>

              {/* Questions in this Section */}
              <div className="space-y-4">
                {sec.items.map((item) => {
                  const currentAns = draft[item.id] ?? emptyAnswer();
                  return (
                    <Question
                      key={item.id}
                      item={item}
                      answer={currentAns}
                      onChange={(changes) => updateAnswer(item.id, changes)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Bottom Submit Section */}
        <div className="pt-8 pb-12 subtle-border-t text-center space-y-4">
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-white subtle-border shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#171A1F]">
                ສຳເລັດການສຳຫຼວດ
              </h3>
              <p className="text-xs text-[#6A6357] mt-1">
                ທ່ານໄດ້ຕອບແລ້ວ {answeredQCount} ຈາກ {totalQuestions} ຂໍ້. ພ້ອມແລ້ວກົດປຸ່ມດ້ານລຸ່ມເພື່ອເປີດບົດສະທ້ອນ.
              </p>
            </div>

            <button
              onClick={handleComplete}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-[#2D4C3E] hover:bg-[#22392F] text-white font-medium transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer text-sm sm:text-base"
            >
              <span>{submitting ? "ກຳລັງສັງເຄາະຂໍ້ມູນ..." : "ສັງເຄາະບົດສະທ້ອນ (Open Reflection)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
