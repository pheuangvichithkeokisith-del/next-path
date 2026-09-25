import type { DraftAnswer } from "@/types/form";
import type { SessionResponse, SessionStatus } from "@/types/session";
import { ApiError } from "./errors";
import { CURRENT_FORM_VERSION } from "./assessment";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new ApiError(response.status, `Request failed with ${response.status}`);
  return (await response.json()) as T;
}

export function createSession(formVersion = CURRENT_FORM_VERSION): Promise<SessionResponse> {
  return request<SessionResponse>(`/sessions?form_version=${encodeURIComponent(formVersion)}`, { method: "POST" });
}

export function saveAnswer(sessionId: string, questionId: string, answer: DraftAnswer): Promise<unknown> {
  return request(`/sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ question_id: questionId, ...answer }),
  });
}

export function completeSession(sessionId: string): Promise<{ status: string }> {
  return request<{ status: string }>(`/sessions/${sessionId}/complete`, { method: "POST" });
}

export function getSessionStatus(sessionId: string): Promise<SessionStatus> {
  return request<SessionStatus>(`/sessions/${sessionId}/status`);
}
