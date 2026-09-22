import type { QuestionnaireForm } from "@/types/form";
import staticQuestions from "@/data/questions.json";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export async function getForm(): Promise<QuestionnaireForm> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/form`, {
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as QuestionnaireForm;
    }
  } catch {
    // Fall back to bundled static questions in offline/standalone mode
  }

  return staticQuestions as unknown as QuestionnaireForm;
}
