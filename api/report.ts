import type { ReportResponse } from "@/types/report";
import { ApiError } from "./errors";

export type { ReportResponse };

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export async function getReport(sessionId: string): Promise<ReportResponse> {
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
