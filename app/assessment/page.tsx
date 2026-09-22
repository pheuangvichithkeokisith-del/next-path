"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getForm } from "@/api/assessment";
import { completeSession, saveAnswer } from "@/api/session";
import { isSessionNotFound } from "@/api/errors";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { UI_COPY, PROPOSED_COPY } from "@/content/copy";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import ProgressTracker from "@/components/ProgressTracker";
import Question from "@/components/Question";
import SubmitConfirm from "@/components/SubmitConfirm";
import { restoreDraft, saveDraft } from "@/utils/draft";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  // Redirect if no session
  useEffect(() => {
    if (!sessionResolved) return;
    if (!sessionId) {
      router.replace("/introduction");
    }
  }, [sessionResolved, sessionId, router]);

  const items = useMemo<FormItem[]>(() => {
    if (!form) return [];
    return [...(form.demographics ?? []), ...(form.questions ?? [])];
  }, [form]);

  const currentItem = items[currentIndex];
  const totalQuestions = form?.questions?.length ?? 28;
  const isDemographics = currentItem ? currentItem.id.startsWith("D") : false;
  const questionNumber = isDemographics ? 0 : currentIndex - (form?.demographics?.length ?? 3) + 1;

  // Handle answers update
  function updateAnswer(changes: Partial<DraftAnswer>): void {
    if (!currentItem) return;
    const previous = draft[currentItem.id] ?? emptyAnswer();
    const updated: DraftAnswer = { ...previous, ...changes };
    const nextDraft = { ...draft, [currentItem.id]: updated };
    
    setDraft(nextDraft);
    if (typeof window !== "undefined") {
      saveDraft(window.localStorage, nextDraft);
    }

    // Async autosave to backend if session exists
    if (sessionId) {
      saveAnswer(sessionId, currentItem.id, updated).catch((err) => {
        if (isSessionNotFound(err)) {
          clearSessionId();
          router.replace("/introduction");
        }
      });
    }
  }

  function handleNext(): void {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      triggerSubmit();
    }
  }

  function handleBack(): void {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const missingCount = useMemo(() => {
    if (!form) return 0;
    return form.questions.filter((q) => !isAnswered(q, draft[q.id])).length;
  }, [form, draft]);

  function triggerSubmit(): void {
    if (missingCount > 0) {
      setShowConfirm(true);
    } else {
      executeComplete();
    }
  }

  async function executeComplete(): Promise<void> {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      if (sessionId) {
        await completeSession(sessionId);
      }
      router.push("/processing");
    } catch {
      // Standalone fallback: transition directly to processing
      router.push("/processing");
    } finally {
      setSubmitting(false);
    }
  }

  if (hasError) {
    return (
      <main className="flex-1 bg-[#FAF9F5] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <ErrorBanner onRetry={() => setHasError(false)} />
        </div>
      </main>
    );
  }

  if (!form || !currentItem) {
    return (
      <main className="flex-1 bg-[#FAF9F5] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <Loading className="h-64" />
        </div>
      </main>
    );
  }

  const currentAnswer = draft[currentItem.id] ?? emptyAnswer();
  const isFinalItem = currentIndex === items.length - 1;

  return (
    <main className="flex-1 bg-[#FAF9F5] px-4 py-6 sm:py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress header */}
        <ProgressTracker
          current={Math.max(1, questionNumber)}
          isDemographics={isDemographics}
          sectionTitle={currentItem.section_lao}
          total={totalQuestions}
        />

        {/* Question Card (Card-calm) */}
        <div className="card-calm shadow-xs transition-all duration-200">
          <Question
            answer={currentAnswer}
            item={currentItem}
            onChange={updateAnswer}
          />
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            className="btn-secondary text-sm"
            disabled={currentIndex === 0 || submitting}
            onClick={handleBack}
            type="button"
          >
            ← {PROPOSED_COPY.back}
          </button>

          <div className="flex items-center gap-3">
            {isFinalItem ? (
              <button
                className="btn-primary text-sm shadow-xs"
                disabled={submitting}
                onClick={triggerSubmit}
                type="button"
              >
                {submitting ? "ກຳລັງສົ່ງ..." : UI_COPY.assessment.submit}
                <span className="ml-1.5">✓</span>
              </button>
            ) : (
              <button
                className="btn-primary text-sm shadow-xs"
                disabled={submitting}
                onClick={handleNext}
                type="button"
              >
                {PROPOSED_COPY.next} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for incomplete questions */}
      {showConfirm ? (
        <SubmitConfirm
          missing={missingCount}
          onEdit={() => setShowConfirm(false)}
          onSubmit={executeComplete}
        />
      ) : null}
    </main>
  );
}
