import type { DraftAnswers } from "@/types/form";
import { CURRENT_FORM_REVISION } from "@/utils/formRevision";

export const DRAFT_STORAGE_KEY = "pathai.assessment.draft.v2";
const LEGACY_DRAFT_STORAGE_KEY = "pathai.assessment.draft.v1";

type StoredDraft = {
  form_revision: string;
  session_id: string;
  answers: DraftAnswers;
};

export function restoreDraft(
  storage: Pick<Storage, "getItem">,
  sessionId: string | null | undefined,
): DraftAnswers {
  if (!sessionId) return {};

  try {
    const stored = storage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as Partial<StoredDraft>;
    if (
      parsed.form_revision !== CURRENT_FORM_REVISION ||
      parsed.session_id !== sessionId ||
      !parsed.answers ||
      typeof parsed.answers !== "object"
    ) {
      return {};
    }

    return parsed.answers;
  } catch {
    return {};
  }
}

export function saveDraft(
  storage: Pick<Storage, "setItem">,
  draft: DraftAnswers,
  sessionId: string | null | undefined,
): void {
  if (!sessionId) return;

  const stored: StoredDraft = {
    form_revision: CURRENT_FORM_REVISION,
    session_id: sessionId,
    answers: draft,
  };
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stored));
}

export function clearDraft(storage: Pick<Storage, "removeItem">): void {
  storage.removeItem(DRAFT_STORAGE_KEY);
  storage.removeItem(LEGACY_DRAFT_STORAGE_KEY);
}
