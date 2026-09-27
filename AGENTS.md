# PATHAI Agent Instructions & Memory

## Project Context
- **Path:** `/home/pheuang01/Projects/nextpath01/nextpath01`
- **Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Lucide React, FastAPI SQLite Backend.
- **Reference Docs:** 
  - `PROJECT_MEMORY.md` (Full context summary)
  - `/home/pheuang01/Documents/test04.md` (Questionnaire master UX reference)
  - `/home/pheuang01/Documents/test05.md` (Questionnaire master JSON schema)
  - `/home/pheuang01/Projects/BACKUPS/PATHAI_BACKUP_2026-09-16_22-51/project-files/Projects/prototype project01.md` (8 Dimensions Spec)

## Core Principles
1. **Human & Calm:** Warm organic paper aesthetic (`#F9F8F5`, `#2D4C3E`, `#8D5B28`, `#7A3E2D`).
2. **Lao-First Experience:** Prioritize clean Noto Sans Lao typography, line-heights, and natural Lao phrasing.
3. **Continuous Scroll Form:** All questions rendered in an unhurried, scrollable form grouped by the 8 modules.
4. **AI Prompt Integration:** Generate clean markdown prompt exports for youth to consult external AI (ChatGPT, Claude, Gemini).
5. **Never break:** Q1–Q28 questionnaire data, D1–D3 demographics, backend API endpoints, or DS engine logic.

## Frontend Brand Boundary (2026-09-26)
- User-facing frontend wording uses `Next-path`; remove old brand and developer-facing labels from visible UI where appropriate.
- Keep the frontend AI prompt flow and report behavior working, but use plain Lao labels for buttons and sections instead of terms such as JSON, Backend, Signal Engine, or Calculation Proof.
- This pass is frontend-only. Do not change backend endpoints, backend export headers/filenames, storage keys, form versions, scoring identifiers, or legacy questionnaire data without a separate migration decision.
- Backend technical routes (`/docs`, `/redoc`, and OpenAPI) and backend `PATHAI` identifiers remain unchanged and are documented as internal/backend scope.

## QA and Build Boundary (2026-09-26)
- Frontend report deduplication is implemented in `api/report.ts` and `app/processing/page.tsx`; it prevents duplicate report requests caused by repeated React effects or competing navigation paths in one browser tab.
- The standard frontend build command is `npm run build` → `next build --webpack` because Turbopack process/port creation is restricted in the current test environment.
- Backend pytest uses an isolated temporary SQLite database and initializes tables before each test; the full suite passed 71 tests when run outside the sandbox.
- Backend report creation now handles the independent-tab/client race: a concurrent unique collision is rolled back and the already-committed report is reused. Regression coverage lives in `backend/tests/test_report_concurrency.py`. Do not change questionnaire data, scoring, API contracts, or session behavior while maintaining this path.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
