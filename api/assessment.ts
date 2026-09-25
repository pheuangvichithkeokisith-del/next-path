import type { QuestionnaireForm } from "@/types/form";
import staticQuestions from "@/data/questions.json";
import v4Questions from "@/v4.0/questions_full.json";

export const CURRENT_FORM_VERSION = "v4.0.0";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export async function getForm(version = CURRENT_FORM_VERSION): Promise<QuestionnaireForm> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/form?version=${encodeURIComponent(version)}`, {
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as QuestionnaireForm;
    }
  } catch {
    // Fall back to bundled static questions in offline/standalone mode
  }

  return (version === CURRENT_FORM_VERSION ? v4Questions : staticQuestions) as unknown as QuestionnaireForm;
}
