# PATHAI Frontend Technical & Structural Inventory

**Document Version:** `v1.0.0`  
**Audit Date:** 2026-09-23  
**Framework:** Next.js 16.3.5 App Router (React 19, TypeScript, Tailwind CSS 4)  
**Status:** `[IMPLEMENTATION INVENTORY]`

---

## 1. Page Structure & Route Tree

The frontend implements 6 distinct route segments designed around a progressive, non-intrusive self-reflection journey:

```
app/
├── layout.tsx                  # Global HTML wrapper, Noto Sans Lao font, sticky header
├── page.tsx                    # Route: / (Landing Page)
├── globals.css                 # Custom CSS variables, warm palette, button & card classes
├── introduction/
│   └── page.tsx                # Route: /introduction (Data transparency & consent)
├── assessment/
│   └── page.tsx                # Route: /assessment (Questionnaire wizard D1–D3, Q1–Q28)
├── processing/
│   └── page.tsx                # Route: /processing (Calm transition & status polling)
├── report/
│   └── page.tsx                # Route: /report (Reflection report, unranked paths, export)
└── feedback/
    └── page.tsx                # Route: /feedback (3-item qualitative user agreement)
```

---

## 2. Component Hierarchy & Dependency Tree

```
RootLayout (app/layout.tsx)
├── Global Header (Sticky navigation, PATHAI logo, version badge)
└── Page Viewport (children)
    │
    ├── LandingPage (app/page.tsx)
    │   ├── Subtitle Pill Badge
    │   ├── Hero Title & Subtext
    │   ├── Reassurance Banner (Non-judgmental notice)
    │   ├── 3-Step Flow Card Grid
    │   └── Primary Action Link (-> /introduction)
    │
    ├── IntroductionPage (app/introduction/page.tsx)
    │   ├── Data Transparency Cards (Collected vs Not Collected)
    │   ├── Purpose Notice Card
    │   ├── ConsentCheckbox (components/ConsentCheckbox.tsx)
    │   ├── ErrorBanner (components/ErrorBanner.tsx)
    │   ├── Loading (components/Loading.tsx)
    │   └── Primary Action Button (-> /assessment)
    │
    ├── AssessmentPage (app/assessment/page.tsx)
    │   ├── ProgressTracker (components/ProgressTracker.tsx)
    │   ├── Question Container (components/Question.tsx)
    │   │   ├── Category/Section Badge
    │   │   ├── Question Stem Header
    │   │   ├── Input Controls:
    │   │   │   ├── Text Input (for D2 / free text)
    │   │   │   ├── OptionList (components/OptionList.tsx)
    │   │   │   │   ├── Single-choice Radios
    │   │   │   │   ├── Multi-choice Checkboxes (max_select & exclusive handling)
    │   │   │   │   └── Expandable 'Other' Text Field
    │   │   │   └── Extra Text Field (e.g. Q7 context)
    │   ├── Navigation Bar (Back button, Next / Submit buttons)
    │   └── SubmitConfirm Modal (components/SubmitConfirm.tsx)
    │
    ├── ProcessingPage (app/processing/page.tsx)
    │   ├── Geometric Breathing Animation (animate-breathe)
    │   ├── Reassuring Notice Box
    │   └── ErrorBanner (components/ErrorBanner.tsx)
    │
    ├── ReportPage (app/report/page.tsx)
    │   ├── Header & Summary Card
    │   ├── Section 1: Response Patterns Grid (ReportPattern)
    │   ├── Section 2: Possible Paths Grid (Unranked ReportPath)
    │   ├── Section 3: Context Factors Card (Age, Province, Constraints)
    │   ├── Section 4: Unknowns & Exploration Opportunities Box
    │   ├── Section 5: Try Before Decide Action Cards (3 Archetypes)
    │   ├── Disclaimer Box
    │   ├── Export Handoff Box (Copy Markdown & Download JSON)
    │   └── Feedback Action Button (-> /feedback)
    │
    └── FeedbackPage (app/feedback/page.tsx)
        ├── 3-Option Agreement Selector Grid (Yes / Not really / Unsure)
        ├── Qualitative Textarea (Incorrect points / notes)
        ├── Next Exploration Textarea (Future interests)
        ├── Submit Action Button
        └── Thank You Confirmation Card (Return to Home Link)
```

---

## 3. Client State Management & Persistence

| State Layer | Scope & Implementation | Storage Medium | Lifecycle & Behavior |
|---|---|---|---|
| **Anonymous Session** | `hooks/useSession.ts` | `localStorage` (`pathai_session_id`) | UUIDv4 string; created on introduction consent; cleared on restart |
| **Draft Answers** | `utils/draft.ts` | `localStorage` (`pathai_draft_answers`) | Persisted per question ID on every option toggle; restored automatically upon page refresh |
| **Form Definition** | `app/assessment/page.tsx` | React Component State (`useState<QuestionnaireForm>`) | Fetched from `/api/v1/form`; cached in memory during assessment |
| **Active Index** | `app/assessment/page.tsx` | React Component State (`useState<number>`) | Tracks active question position (0 to 30); scrolls smoothly to top on step change |
| **Status Polling** | `hooks/usePollStatus.ts` & `app/processing/page.tsx` | Polling interval (`setTimeout`, 2000ms) | Polls `/api/v1/sessions/{id}/status` until status equals `completed` |

---

## 4. API Client Contracts (`api/`)

The frontend API layer completely matches the FastAPI backend specification:

| API Function | HTTP Method & Path | Request Payload | Response Schema | Fallback Behavior |
|---|---|---|---|---|
| `getForm()` | `GET /api/v1/form` | None | `QuestionnaireForm` | Returns bundled fallback form if server offline |
| `createSession()` | `POST /api/v1/sessions` | None | `{ session_id, form_version, status }` | Generates local UUID fallback session |
| `saveAnswer()` | `POST /api/v1/sessions/{id}/answers` | `AnswerPayload` | `AnswerResponse` | Retains local draft in localStorage |
| `completeSession()` | `POST /api/v1/sessions/{id}/complete` | None | `{ session_id, status: "completed" }` | Transitions to processing client-side |
| `getSessionStatus()` | `GET /api/v1/sessions/{id}/status` | None | `{ session_id, status }` | Transitions to report after 2.5s calm delay |
| `getReport()` | `GET /api/v1/sessions/{id}/report` | None | `ReportResponse` | Renders report with pure data validation |
| `downloadExport()` | `GET /api/v1/sessions/{id}/export?format=` | Query `format=json\|md` | `Blob` (File stream) | Generates client-side blob for download |
| `submitFeedback()` | `POST /api/v1/sessions/{id}/feedback` | `FeedbackPayload` | `FeedbackResponse` | Confirms receipt and shows thank you view |
