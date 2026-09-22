import type { FeedbackPayload } from "@/types/feedback";
import { ApiError } from "./errors";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export async function submitFeedback(
  sessionId: string,
  payload: FeedbackPayload,
): Promise<{ saved: boolean }> {
  const response = await fetch(`${apiBaseUrl}/api/v1/sessions/${sessionId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new ApiError(response.status, `Feedback request failed with ${response.status}`);
  }
  return (await response.json()) as { saved: boolean };
}
