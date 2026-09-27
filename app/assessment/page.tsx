"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENT_FORM_VERSION, getForm } from "@/api/assessment";
import { completeSession, createSession, getSessionStatus, saveAnswer } from "@/api/session";
import { isSessionNotFound } from "@/api/errors";
import {
  clearSessionId,
  getStoredSessionRevision,
  storeSessionId,
  useSessionId,
} from "@/hooks/useSession";
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
import { CURRENT_FORM_REVISION } from "@/utils/formRevision";

function emptyAnswer(): DraftAnswer {
  return {
    option_codes: [],
    other_text: null,
    extra_text: null,
    text_value: null,
  };
}

function getScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
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

type FormValidationMeta = {
  min_total?: number;
  min_per_section?: boolean;
  required_questions?: string[];
};

type FormSectionMeta = {
  questions?: string[];
  min_required?: number;
};

type FormMeta = {
  validation?: FormValidationMeta;
  sections?: Record<string, FormSectionMeta>;
};

type ValidationIssue = {
  questionId: string;
  message: string;
};

export default function AssessmentPage() {
  const router = useRouter();
  const { sessionId, resolved: sessionResolved } = useSessionId();
  const [form, setForm] = useState<QuestionnaireForm | null>(null);
  const [draft, setDraft] = useState<DraftAnswers>(() => {
    if (typeof window !== "undefined") {
      return restoreDraft(window.localStorage, sessionId);
    }
    return {};
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [submitError, setSubmitError] = useState(false);
  const [showValidationNotice, setShowValidationNotice] = useState(false);
  const [isSavedFlash, setIsSavedFlash] = useState(false);
  const saveTimers = useRef<Record<string, number>>({});
  const validationNoticeRef = useRef<HTMLDivElement>(null);

  // Load form definition
  useEffect(() => {
    let active = true;
    getForm(CURRENT_FORM_VERSION)
      .then((data) => {
        if (active) setForm(data);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => {
      active = false;
    };
  }, [retryToken]);

  // Ensure clean, valid session exists
  useEffect(() => {
    if (!sessionResolved) return;
    if (!sessionId) {
      createSession(CURRENT_FORM_VERSION)
        .then(({ session_id }) => {
          storeSessionId(session_id);
        })
        .catch(() => {
          // Do not create a fake client-only session. Without the backend,
          // answers cannot be persisted and Processing cannot reach Report.
          setHasError(true);
      });
    } else {
      // Never reuse a session created before the current questionnaire revision.
      // Its backend may still contain answers for questions that are no longer
      // represented in the current draft.
      if (getStoredSessionRevision() !== CURRENT_FORM_REVISION) {
        if (typeof window !== "undefined") {
          clearDraft(window.localStorage);
        }
        createSession(CURRENT_FORM_VERSION)
          .then(({ session_id }) => {
            setDraft({});
            storeSessionId(session_id);
          })
          .catch(() => {
            clearSessionId();
            setHasError(true);
          });
        return;
      }

      // If returning to assessment with an already completed session, start a fresh session
      getSessionStatus(sessionId)
        .then((sessionStatus) => {
          if (sessionStatus.status === "completed" || sessionStatus.form_version !== CURRENT_FORM_VERSION) {
            clearSessionId();
            if (typeof window !== "undefined") {
              clearDraft(window.localStorage);
            }
            setDraft({});
          }
        })
        .catch((error: unknown) => {
          if (isSessionNotFound(error)) {
            clearSessionId();
            if (typeof window !== "undefined") {
              clearDraft(window.localStorage);
            }
            setDraft({});
            return;
          }

          // Keep the failure visible instead of continuing with a session
          // whose status and answers cannot be verified or persisted.
          setHasError(true);
        });
    }
  }, [retryToken, sessionResolved, sessionId]);

  // Handle answers update
  const updateAnswer = (itemId: string, changes: Partial<DraftAnswer>) => {
    const previous = draft[itemId] ?? emptyAnswer();
    const updated: DraftAnswer = { ...previous, ...changes };
    const nextDraft = { ...draft, [itemId]: updated };

    setDraft(nextDraft);
    if (typeof window !== "undefined") {
      saveDraft(window.localStorage, nextDraft, sessionId);
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
            createSession(CURRENT_FORM_VERSION)
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
        descLo: "ຈຸດແຂງທີ່ຄົນອື່ນຊົມເຊີຍ ແລະ ສິ່ງທີ່ເຄີຍເຮັດຈົນພູມໃຈ",
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
      academic: {
        titleLo: "ໝວດ 5 — ການຮຽນ ແລະ ວິຊາການ (Academic)",
        descLo: "ວິຊາທີ່ຖະໜັດ, ດ້ານທີ່ຍາກ ແລະ ທິດທາງການຮຽນຮູ້",
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
      constraints: {
        titleLo: "ໝວດ 7 — ຂໍ້ຈຳກັດ ແລະ ບໍລິບົດ (Constraints)",
        descLo: "ເວລາ, ສະຖານທີ່, ການເດີນທາງ ແລະ ບໍລິບົດຄອບຄົວ",
        icon: HelpCircle,
      },
      journey: {
        titleLo: "ໝວດ 8 — ເສັ້ນທາງການເດີນຕໍ່ (Journey)",
        descLo: "ວິທີປັບຕົວເມື່ອບໍ່ເປັນໄປຕາມແຜນ ແລະ ຄວາມຍືດຢຸ່ນໃນອະນາຄົດ",
        icon: Route,
      },
      flexibility: {
        titleLo: "ໝວດ 8 — ຄວາມຍືດຢຸ່ນ ແລະ ຄວາມພ້ອມ (Flexibility)",
        descLo: "ຄວາມພ້ອມປ່ຽນທາງ, ຄວາມສ່ຽງ ແລະ ຕົວຊ່ວຍຄວາມປອດໄພ",
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

  const completionStatus = useMemo(() => {
    const meta = (form?.meta ?? {}) as FormMeta;
    const minimumTotal = meta.validation?.min_total ?? 20;
    const requiredQuestions = meta.validation?.required_questions ?? [];
    const sectionMeta = meta.sections ?? {};
    const incompleteSections = Object.entries(sectionMeta)
      .map(([section, config]) => {
        const questionIds = config.questions ?? [];
        const answered = questionIds.filter((questionId) => {
          const item = form?.questions?.find((question) => question.id === questionId);
          return item ? isAnswered(item, draft[questionId]) : false;
        }).length;
        const required = config.min_required ?? 0;
        return { section, answered, required };
      })
        .filter(({ answered, required }) => Boolean(meta.validation?.min_per_section) && answered < required);
    const missingRequired = requiredQuestions.filter((questionId) => {
      const item = form?.questions?.find((question) => question.id === questionId);
      return !item || !isAnswered(item, draft[questionId]);
    });
    const incompleteSelections = (form?.questions ?? [])
      .filter((item) => {
        const minSelect = item.min_select ?? 0;
        const selectedCount = draft[item.id]?.option_codes?.length ?? 0;
        return minSelect > 0 && selectedCount > 0 && selectedCount < minSelect;
      })
      .map((item) => item.id);
    const issuesByQuestion = new Map<string, ValidationIssue>();

    (form?.questions ?? [])
      .filter((item) => !isAnswered(item, draft[item.id]))
      .forEach((item) => {
        const minSelect = item.min_select ?? 0;
        const selectedCount = draft[item.id]?.option_codes?.length ?? 0;
        const message =
          minSelect > 0 && selectedCount > 0
            ? "ເລືອກຢ່າງໜ້ອຍ " + minSelect + " ຂໍ້ (ຕອນນີ້ເລືອກແລ້ວ " + selectedCount + " ຂໍ້)"
            : "ຍັງບໍ່ມີຄຳຕອບ";
        issuesByQuestion.set(item.id, { questionId: item.id, message });
      });

    return {
      minimumTotal,
      incompleteSections,
      missingRequired,
      incompleteSelections,
      issues: Array.from(issuesByQuestion.values()),
      isReady:
        answeredQCount >= minimumTotal &&
        incompleteSections.length === 0 &&
        missingRequired.length === 0 &&
        incompleteSelections.length === 0,
    };
  }, [answeredQCount, draft, form]);

  const scrollToQuestion = (questionId: string) => {
    const question = document.getElementById("question-" + questionId);
    if (!question) return;
    question.focus({ preventScroll: true });
    question.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
  };

  const handleComplete = async () => {
    if (!completionStatus.isReady) {
      setShowValidationNotice(true);
      requestAnimationFrame(() => {
        const notice = validationNoticeRef.current;
        if (!notice) return;
        notice.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
        notice.focus({ preventScroll: true });
      });
      return;
    }

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
          <ErrorBanner
            onRetry={() => {
              setHasError(false);
              setRetryToken((token) => token + 1);
            }}
          />
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="flex-1 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-xl text-center space-y-4">
          <Loading className="h-48" />
          <p className="text-sm text-[#746C5F]">ກຳລັງໂຫລດແບບສຳຫຼວດ...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* Sticky Progress & Navigation Bar */}
      <section aria-labelledby="assessment-progress-heading" className="sticky top-16 z-30 bg-[#F9F8F5]/95 backdrop-blur-md subtle-border-b py-3.5 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <h2 id="assessment-progress-heading" className="sr-only">ຄວາມຄືບໜ້າການສຳຫຼວດ</h2>
          <div className="flex items-center space-x-3">
            <span className="text-xs sm:text-sm font-bold text-[#1D2229]">
              ຕອບແລ້ວ {answeredQCount} / {totalQuestions} ຂໍ້
            </span>
            <div aria-hidden="true" className="w-20 sm:w-36 h-2 bg-[#EBE7DD] rounded-full overflow-hidden hidden xs:block">
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
                className="btn-primary min-h-11 px-3.5 py-1.5 rounded-lg bg-[#2D4C3E] hover:bg-[#233C31] text-xs"
              >
                <span>ສັງເຄາະຜົນ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Continuous Form Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-14">
        {submitError ? <ErrorBanner onRetry={handleComplete} /> : null}

        {/* Intro Banner */}
        <div className="text-center max-w-xl mx-auto pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#746C5F] block mb-1.5">
            ການສຳຫຼວດແບບຕໍ່ເນື່ອງ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A1F] tracking-tight">
            28 ຄຳຖາມເພື່ອຄວາມເຂົ້າໃຈຕົນເອງ
          </h1>
          <p className="text-xs sm:text-sm text-[#615B50] mt-2 leading-relaxed">
            ເລື່ອນຕອບຕາມລຳດັບຢ່າງສະບາຍໃຈ. ທຸກຄຳຕອບຈະຖືກບັນທຶກອັດຕະໂນມັດ. ບໍ່ມີຂໍ້ໃດຖືກຫຼືຜິດ.
          </p>
        </div>

        {showValidationNotice ? (
          <div
            ref={validationNoticeRef}
            id="assessment-validation-summary"
            tabIndex={-1}
            role="alert"
            aria-labelledby="assessment-validation-heading"
            className="max-w-2xl mx-auto rounded-2xl border border-[#D7B97A] bg-[#FFF8E8] px-4 py-4 text-sm text-[#5B4525] shadow-xs"
          >
            <h2 id="assessment-validation-heading" className="font-semibold">ກ່ອນເປີດບົດສະທ້ອນ ກະລຸນາຕອບຄຳຖາມໃຫ້ຄົບກ່ອນ</h2>
            <p className="mt-1 text-xs leading-relaxed">
              ຕອບແລ້ວ {answeredQCount}/{totalQuestions} ຂໍ້. ຕ້ອງຕອບຢ່າງໜ້ອຍ {completionStatus.minimumTotal} ຂໍ້ ແລະ ໃຫ້ຄົບຕາມຂັ້ນຕ່ຳຂອງແຕ່ລະໝວດ.
            </p>
            {completionStatus.issues.length > 0 ? (
              <div className="mt-3 border-t border-[#E7D5AA] pt-3">
                <p className="text-xs font-semibold text-[#5B4525]">
                  ຈຸດທີ່ຕ້ອງແກ້ ({completionStatus.issues.length})
                </p>
                <ul className="mt-1.5 space-y-1">
                  {completionStatus.issues.map((issue) => (
                    <li key={issue.questionId}>
                      <button
                        type="button"
                        onClick={() => scrollToQuestion(issue.questionId)}
                        className="text-left text-xs text-[#7A3E2D] underline underline-offset-2 hover:text-[#5B2F24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3E2D]"
                      >
                        {issue.questionId}: {issue.message} ↗
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Section Groups */}
        {sections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <section key={sec.id} aria-labelledby={`${sec.id}-heading`} className="space-y-6 pt-4">
              {/* Section Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F2EFE8] subtle-border">
                <div className="flex items-center space-x-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-white subtle-border flex items-center justify-center text-[#2D4C3E]">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h2 id={`${sec.id}-heading`} className="text-lg sm:text-xl font-bold text-[#171A1F]">
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
                      validationMessage={
                        showValidationNotice
                          ? completionStatus.issues.find((issue) => issue.questionId === item.id)?.message
                          : undefined
                      }
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
              className="btn-primary w-full py-4 bg-[#2D4C3E] hover:bg-[#22392F] text-sm sm:text-base"
            >
              <span>{submitting ? "ກຳລັງສັງເຄາະຂໍ້ມູນ..." : completionStatus.isReady ? "ສັງເຄາະບົດສະທ້ອນ" : "ກວດຄຳຕອບກ່ອນ"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
