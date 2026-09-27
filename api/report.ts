import type { ReportResponse } from "@/types/report";
import { ApiError } from "./errors";

export type { ReportResponse };

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

// A completed session's report is immutable from the frontend's point of view.
// Reuse the same promise when React or navigation starts the request twice so
// the backend only receives one report-generation request per session.
const reportRequests = new Map<string, Promise<ReportResponse>>();

export async function getReport(sessionId: string): Promise<ReportResponse> {
  const existingRequest = reportRequests.get(sessionId);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/sessions/${sessionId}/report`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new ApiError(response.status, `Report request failed with ${response.status}`);
      }
      return (await response.json()) as ReportResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, "Report service is unavailable");
    }
  })();

  const sharedRequest = request.catch((error: unknown) => {
    // Let the UI retry after a transient failure while keeping successful
    // reports cached for the lifetime of this browser tab.
    if (reportRequests.get(sessionId) === sharedRequest) {
      reportRequests.delete(sessionId);
    }
    throw error;
  });
  reportRequests.set(sessionId, sharedRequest);
  return sharedRequest;
}

export async function downloadExport(
  sessionId: string,
  format: "json" | "md",
): Promise<Blob> {
  try {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/sessions/${sessionId}/export?format=${format}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      throw new ApiError(response.status, `Export request failed with ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "Export service is unavailable");
  }
}
