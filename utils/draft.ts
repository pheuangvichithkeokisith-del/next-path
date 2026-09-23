import type { DraftAnswers } from "@/types/form";

export const DRAFT_STORAGE_KEY = "pathai.assessment.draft.v1";

export function restoreDraft(storage: Pick<Storage, "getItem">): DraftAnswers {
  try {
    const stored = storage.getItem(DRAFT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DraftAnswers) : {};
  } catch {
    return {};
  }
}

export function saveDraft(
  storage: Pick<Storage, "setItem">,
  draft: DraftAnswers,
): void {
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearDraft(storage: Pick<Storage, "removeItem">): void {
  storage.removeItem(DRAFT_STORAGE_KEY);
}
