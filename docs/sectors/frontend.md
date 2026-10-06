# Sector 1 — Frontend

## Scope

Next.js pages, browser session state, draft persistence, API clients, and the
user-facing Lao copy.

## Main files

| Area | Files |
|---|---|
| Pages | `app/page.tsx`, `app/introduction/page.tsx`, `app/assessment/page.tsx`, `app/processing/page.tsx`, `app/report/page.tsx`, `app/feedback/page.tsx` |
| API clients | `api/assessment.ts`, `api/session.ts`, `api/report.ts`, `api/feedback.ts` |
| Browser state | `hooks/useSession.ts`, `utils/draft.ts` |
| Contract types | `types/` |

## Contract checks

- Production API base is `NEXT_PUBLIC_API_BASE_URL`.
- Active form is requested as `v4.0.0`.
- The browser stores only an anonymous session ID and a versioned draft.
- A report is read from the Backend; scores are not calculated in the browser.

## Debug checklist

1. Confirm the page itself loads from Netlify.
2. Confirm API requests target Railway, not `localhost`.
3. Check CORS response headers for the exact Netlify origin.
4. Check the session ID and form revision in browser storage.
5. Retry once after clearing the current session/draft.

