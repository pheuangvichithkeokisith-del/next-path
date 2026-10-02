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
  ArrowRight,
  Sparkles,
  Compass,
  Layers,
  HelpCircle,
  Lightbulb,
  Heart,
  Target,
  Route,
  UserCheck,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
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
  const [isNavDockOpen, setIsNavDockOpen] = useState(false);
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

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
          setHasError(true);
        });
      return;
    }

    const storedRevision = getStoredSessionRevision();
    if (storedRevision && storedRevision !== CURRENT_FORM_REVISION) {
      clearSessionId();
      if (typeof window !== "undefined") {
        clearDraft(window.localStorage);
      }
      createSession(CURRENT_FORM_VERSION)
        .then(({ session_id }) => {
          setDraft({});
          storeSessionId(session_id);
        })
        .catch(() => {
          setHasError(true);
        });
      return;
    }

    let active = true;
    getSessionStatus(sessionId)
      .then(({ status }) => {
        if (!active) return;
        if (status === "completed") {
          clearSessionId();
          if (typeof window !== "undefined") {
            clearDraft(window.localStorage);
          }
          setDraft({});
          createSession(CURRENT_FORM_VERSION)
            .then(({ session_id }) => {
              storeSessionId(session_id);
            })
            .catch(() => {
              setHasError(true);
            });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (isSessionNotFound(error)) {
          clearSessionId();
          if (typeof window !== "undefined") {
            clearDraft(window.localStorage);
          }
          setDraft({});
          createSession(CURRENT_FORM_VERSION)
            .then(({ session_id }) => {
              storeSessionId(session_id);
            })
            .catch(() => {
              setHasError(true);
            });
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId, sessionResolved]);

  // Answer updater with local storage autosave and backend sync
  const updateAnswer = (questionId: string, changes: Partial<DraftAnswer>) => {
    setDraft((prev) => {
      const current = prev[questionId] ?? emptyAnswer();
      const updated: DraftAnswer = { ...current, ...changes };
      const nextDraft = { ...prev, [questionId]: updated };

      if (typeof window !== "undefined") {
        saveDraft(window.localStorage, nextDraft, sessionId);
      }

      // Debounce saving individual answer to backend (600ms)
      if (typeof window !== "undefined") {
        if (saveTimers.current[questionId]) {
          window.clearTimeout(saveTimers.current[questionId]);
        }
        saveTimers.current[questionId] = window.setTimeout(async () => {
          if (sessionId) {
            try {
              await saveAnswer(sessionId, questionId, updated);
              setIsSavedFlash(true);
              setTimeout(() => setIsSavedFlash(false), 2000);
            } catch {
              // Silently fail network error; draft is in localStorage and will retry
            }
          }
        }, 600);
      }

      return nextDraft;
    });

    if (showValidationNotice) {
      setShowValidationNotice(false);
    }
  };

  // Group questions by section
  const sections = useMemo<SectionGroup[]>(() => {
    if (!form) return [];
    const result: SectionGroup[] = [];
    const dList = form.demographics || [];
    const qList = form.questions || [];

    if (dList.length > 0) {
      result.push({
        id: "sec-demo",
        titleLo: "ຂໍ້ມູນພື້ນຖານ (Demographics)",
        descLo: "ຂໍ້ມູນທົ່ວໄປເພື່ອຊ່ວຍໃຫ້ບົດສະທ້ອນສອດຄ່ອງກັບທ່ານຫຼາຍຂຶ້ນ (ບໍ່ລະບຸຕົວຕົນ)",
        icon: UserCheck,
        items: dList,
      });
    }

    const secMap: Record<string, { titleLo: string; descLo: string; icon: LucideIcon }> = {
      interests: {
        titleLo: "ໝວດ 1 — ຄວາມສົນໃຈ (Interests)",
        descLo: "ສິ່ງທີ່ເຮັດແລ້ວມີຄວາມສຸກ ລືມເວລາ ແລະ ຢາກຄົ້ນຫາ",
        icon: Compass,
      },
      skills: {
        titleLo: "ໝວດ 2 — ທັກສະ ແລະ ຄວາມຖະໜັດ (Skills)",
        descLo: "ສິ່ງທີ່ເຮັດໄດ້ດີ ຖືກຊົມເຊີຍ ແລະ ເຄີຍສ້າງຄວາມພູມໃຈ",
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

  // Keep internal Q IDs stable for scoring/API contracts, while showing a
  // simple continuous number in the order the cards appear on the page.
  const displayNumberById = useMemo<Record<string, number>>(() => {
    const numbers: Record<string, number> = {};
    let number = 1;
    for (const section of sections) {
      for (const item of section.items) {
        if (item.id.startsWith("Q")) {
          numbers[item.id] = number;
          number += 1;
        }
      }
    }
    return numbers;
  }, [sections]);

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
    setFocusedQuestionId(questionId);
    setTimeout(() => setFocusedQuestionId(null), 3000);
  };

  const scrollToNextUnanswered = () => {
    if (!form?.questions) return;
    const nextQ = form.questions.find((q) => !isAnswered(q, draft[q.id]));
    if (nextQ) {
      scrollToQuestion(nextQ.id);
    }
    setIsNavDockOpen(false);
  };

  const scrollToSection = (secId: string) => {
    const sectionEl = document.getElementById(`${secId}-heading`);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    }
    setIsNavDockOpen(false);
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
    <div className="relative pb-24">
      {/* Skip Link for Keyboard Accessibility */}
      <a
        href="#assessment-questions"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#2D4C3E] text-[#F9F8F5] px-4 py-2 rounded-lg font-medium shadow-md"
      >
        ຂ້າມໄປຍັງຄຳຖາມແບບສຳຫຼວດ
      </a>

      {/* Sticky Progress Header */}
      <section
        aria-labelledby="assessment-progress-heading"
        className="sticky top-18 z-30 bg-[#F9F8F5]/95 backdrop-blur-md border-b border-[#E5E1D8] py-3.5 px-4 sm:px-6 shadow-xs transition-all"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <h2 id="assessment-progress-heading" className="sr-only">
            ຄວາມຄືບໜ້າການສຳຫຼວດ
          </h2>

          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs sm:text-sm font-semibold text-[#2D4C3E] flex items-center gap-1.5">
              <span>ຕອບແລ້ວ</span>
              <span className="font-bold text-[#8D5B28]">{answeredQCount}</span>
              <span>/</span>
              <span>{totalQuestions} ຂໍ້</span>
            </span>

            <span className="text-xs text-[#2D4C3E]/70 hidden md:inline">
              {answeredQCount === totalQuestions
                ? "ຕອບຄົບທຸກຂໍ້ແລ້ວ! ພ້ອມເບິ່ງຜົນສະທ້ອນ 🎉"
                : answeredQCount >= 20
                ? "ຍັງເຫຼືອອີກໜ້ອຍດຽວ, ຕອບສະບາຍໆ"
                : "ຄ່ອຍໆ ຕອບຕາມຄວາມຮູ້ສຶກ"}
            </span>

            {/* Autosave status toast */}
            <span
              className={`text-xs text-[#2D4C3E] font-medium flex items-center gap-1 transition-opacity duration-300 ${
                isSavedFlash ? "opacity-100" : "opacity-0"
              }`}
            >
              <Check className="w-3.5 h-3.5 text-[#2D4C3E]" />
              <span>ບັນທຶກຮ່າງແລ້ວ</span>
            </span>
          </div>

          {/* Spring Progress Bar */}
          <div className="w-full sm:w-64 flex items-center gap-2">
            <div
              className="flex-1 h-2 rounded-full bg-[#E5E1D8] overflow-hidden"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ຄວາມຄືບໜ້າການຕອບແບບສຳຫຼວດ"
            >
              <div
                className="h-full bg-[#2D4C3E] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#2D4C3E] w-9 text-right">
              {percentage}%
            </span>
          </div>
        </div>
      </section>

      {/* Main Continuous Form Content */}
      <div id="assessment-questions" className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {submitError ? <ErrorBanner onRetry={handleComplete} /> : null}

        {/* Intro Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] text-[#8D5B28] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ແບບສຳຫຼວດຕົນເອງ (Self-reflection)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D4C3E] mb-2">
            28 ຄຳຖາມເພື່ອຄວາມເຂົ້າໃຈຕົນເອງ
          </h1>
          <p className="text-xs sm:text-sm text-[#2D4C3E]/80 leading-relaxed">
            ຄຳຖາມທັງໝົດແບ່ງອອກເປັນ 8 ພາກສ່ວນ. ບໍ່ມີການກຳນົດເວລາ ແລະ ບໍ່ມີຄຳຕອບທີ່ຖືກ ຫຼື ຜິດ.
            ເຈົ້າສາມາດເລື່ອນຕອບຢ່າງຕໍ່ເນື່ອງ (Continuous scroll) ແລະ ຂໍ້ມູນຈະບັນທຶກຮ່າງອັດຕະໂນມັດ.
          </p>
        </div>

        {/* Validation Errors Alert Box */}
        {showValidationNotice && (
          <div
            ref={validationNoticeRef}
            id="assessment-validation-summary"
            tabIndex={-1}
            role="alert"
            className="p-5 rounded-2xl bg-[#FDF3F0] border border-[#7A3E2D]/40 text-[#7A3E2D] shadow-xs space-y-3 animate-fade-in-up"
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>ຍັງມີບາງຂໍ້ທີ່ຍັງບໍ່ທັນໄດ້ຕອບ ຫຼື ຍັງເລືອກບໍ່ຄົບ:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#7A3E2D]/90">
              ກະລຸນາກົດທີ່ລາຍການດ້ານລຸ່ມນີ້ ເພື່ອໄປຍັງຂໍ້ດັ່ງກ່າວ ແລະ ເລືອກຄຳຕອບ:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {completionStatus.issues.map((issue) => (
                <button
                  key={issue.questionId}
                  type="button"
                  onClick={() => scrollToQuestion(issue.questionId)}
                  className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#7A3E2D]/40 text-xs font-semibold text-[#7A3E2D] hover:bg-[#7A3E2D] hover:text-[#FFFFFF] transition-all cursor-pointer shadow-2xs"
                >
                  ໄປທີ່ຂໍ້ {displayNumberById[issue.questionId] ?? issue.questionId.replace("Q", "")}: {issue.message}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section Groups */}
        <div className="space-y-12">
          {sections.map((sec, secIdx) => {
            const IconComp = sec.icon;
            return (
              <section
                key={sec.id}
                id={sec.id}
                aria-labelledby={`${sec.id}-heading`}
                className="space-y-6"
              >
                {/* Module Header */}
                <div className="pt-6 border-t border-[#E5E1D8]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8D5B28] mb-1">
                    {secIdx === 0 ? (
                      <span>ຂໍ້ມູນເບື້ອງຕົ້ນ (Demographics)</span>
                    ) : (
                      <span>ພາກສ່ວນທີ {secIdx} ຈາກ 8</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] text-[#2D4C3E] flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h2
                      id={`${sec.id}-heading`}
                      className="text-lg sm:text-xl font-bold text-[#2D4C3E]"
                    >
                      {sec.titleLo}
                    </h2>
                  </div>
                  {sec.descLo && (
                    <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-2 leading-relaxed">
                      {sec.descLo}
                    </p>
                  )}
                </div>

                {/* Question Cards */}
                <div className="space-y-5">
                  {sec.items.map((item) => {
                    const currentAns = draft[item.id] ?? emptyAnswer();
                    const isFocused = focusedQuestionId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`transition-all duration-300 rounded-2xl ${
                          isFocused ? "ring-2 ring-[#8D5B28] shadow-md" : ""
                        }`}
                      >
                        <Question
                          item={item}
                          answer={currentAns}
                          displayNumber={displayNumberById[item.id]}
                          validationMessage={
                            showValidationNotice
                              ? completionStatus.issues.find(
                                  (issue) => issue.questionId === item.id
                                )?.message
                              : undefined
                          }
                          onChange={(changes) => updateAnswer(item.id, changes)}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Submission Bar */}
        <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#E5E1D8] text-sm font-medium text-[#2D4C3E]/80 hover:bg-[#F4EFEA] transition-colors cursor-pointer"
          >
            ກັບຄືນໜ້າຫຼັກ (Home)
          </button>

          <button
            onClick={handleComplete}
            disabled={submitting}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#2D4C3E] text-[#F9F8F5] text-base font-semibold hover:bg-[#233c31] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E]"
          >
            <span>
              {submitting
                ? "ກຳລັງສັງເຄາະຂໍ້ມູນ..."
                : completionStatus.isReady
                ? "ສຳເລັດການຕອບ ແລະ ເບິ່ງຜົນສະທ້ອນ"
                : "ກວດຄຳຕອບກ່ອນ"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Quick Navigation Helper Dock */}
      <div className="fixed bottom-6 right-6 z-40">
        {isNavDockOpen && (
          <div className="mb-3 w-72 bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl shadow-xl p-4 space-y-3 font-sans animate-fade-in-scale">
            <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
              <span className="font-bold text-xs text-[#2D4C3E] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#8D5B28]" />
                <span>ເມນູຂ້າມໄປຍັງໝວດຕ່າງໆ</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNavDockOpen(false)}
                className="text-xs text-[#2D4C3E]/60 hover:text-[#2D4C3E]"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin pr-1 text-xs">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#F4EFEA] text-[#2D4C3E]/85 transition-colors flex items-center justify-between"
                >
                  <span className="line-clamp-1">{sec.titleLo}</span>
                  <span className="text-[11px] text-[#8D5B28] shrink-0 font-medium ml-1">
                    {idx === 0 ? "3 ຂໍ້" : `${sec.items.length} ຂໍ້`}
                  </span>
                </button>
              ))}
            </div>

            {answeredQCount < totalQuestions && (
              <div className="pt-2 border-t border-[#E5E1D8]/60">
                <button
                  type="button"
                  onClick={scrollToNextUnanswered}
                  className="w-full py-2 px-3 rounded-xl bg-[#EBF2EE] hover:bg-[#d8e6de] text-[#2D4C3E] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
                  <span>ໄປຫາຂໍ້ທີ່ຍັງບໍ່ໄດ້ຕອບ</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          type="button"
          onClick={() => setIsNavDockOpen(!isNavDockOpen)}
          className="p-3.5 rounded-full bg-[#2D4C3E] text-[#F9F8F5] shadow-lg hover:bg-[#233c31] transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
          aria-label="ເປີດເມນູຂ້າມໝວດ"
        >
          <Layers className="w-5 h-5 text-[#E5E1D8]" />
          <span className="text-xs font-semibold hidden sm:inline">ຂ້າມໝວດ</span>
          {isNavDockOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
