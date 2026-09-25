# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** 2026-09-25 | PATHAI v4.0 validation hardening + Lao-first province typography + full browser QA | commit `a08b176` pushed to `origin/main`

---

## 1. Project Mission & Core Philosophy
* **What PATHAI Is:** A calm, human-centered self-reflection space and career companion for Lao youth (aged 15+) designed to transform uncertainty into actionable, low-stakes micro-experiments without pressure.
* **What PATHAI Is NOT:** Not a quick career quiz, not an exam, not an automated life-decider, and not a rigid skill test.
* **Key Principles:**
  1. **Self-Reflection & Companion:** Helps youth understand themselves (Interests, Values, Work Style, Constraints) and explore realistic directions in Laos.
  2. **No Hard Judgment:** No binary right/wrong or predictive career rankings.
  3. **Embrace Unknowns & Tensions:** Explicitly highlights uncertainty ("ຍັງບໍ່ແນ່ໃຈ") and inner conflicts (Tensions) as healthy points of reflection rather than bugs to erase.
  4. **"Try Before Decide" (Micro-Experiments):** Emphasizes low-cost, low-risk weekly experiments before committing to years of study or capital.
  5. **Responsible AI by Design:** Generates structured reflection prompts for youth to consult external AI (ChatGPT, Claude, Gemini) or converse with parents and teachers.

---

## 2. Project Directory & References
* **Production App Directory:** `/home/pheuang01/Projects/nextpath01/nextpath01` (Next.js 16 App Router + SQLite backend)
* **Design Reference Directory:** `/home/pheuang01/Projects/nextpath01/Next-path01` (Vite + React UI reference)
* **Questionnaire Master Truth:** `/home/pheuang01/Documents/test04.md` and `/home/pheuang01/Documents/test05.md`
* **Architecture & 8 Dimensions Spec:** `/home/pheuang01/Projects/BACKUPS/PATHAI_BACKUP_2026-09-16_22-51/project-files/Projects/prototype project01.md`

---

## 3. Current Architecture & UX/UI Implementation

### 🏠 Landing Page (`app/page.tsx`)
* Warm organic ivory/sand theme (`#F9F8F5`, `#2D4C3E`, `#8D5B28`, `#7A3E2D`, `#E5E1D8`).
* Youth-first space indicator (*“ພື້ນທີ່ສຳຫຼວດຕົນເອງ ສຳລັບໄວໜຸ່ມລາວ (ອາຍຸ 15+)”*).
* Automatic check on completed sessions to ensure 100% clean starts on return visits.

### 📝 Assessment Studio (`app/assessment/page.tsx`)
* **Google Forms Continuous Scroll Style**: All questions rendered on one page with smooth vertical scrolling.
* Grouped by 8 modules (D1–D3 Demographics, Q1–Q28 Modules).
* Autosave debouncing with instant storage draft purge on session completion.
* Active web form is explicitly `v4.0.0`; the backend loads the versioned v4 form and validates its option codes.
* D3 province selection uses a native searchable/type-ahead `<select>` with all 18 Lao provinces/capital options and explicitly applies `Noto Sans Lao` to the select and its options for readable Lao rendering.
* Option cards now use native radio/checkbox controls with keyboard focus support; D2 has an explicit label and the shared layout includes a skip link.
* The assessment UI reads v4 validation metadata before opening a report (minimum total, minimum per section, required questions, and partial multi-select detection), without changing scoring or API contracts.

### 📊 Report Space & Transparent AI Prompt Export (`app/report/page.tsx`)
* Tabbed sections adhering to the 6-Part Reflection Architecture.
* **1-Click Master AI Prompt Export Button:** Generates structured Lao markdown containing raw user answers, Signal Engine statistics, and thought-provoking AI questions.
* **Calculation Proof Accordion:** Full transparency for users to inspect the exact answers and signals passed to the backend.
* Quick launch links to ChatGPT, Claude, and Gemini.
* For `v4.0.0`, the copied prompt includes translated option text, question stems, section mapping, normalization rules, Q17 penalty, profile correlation, and risk/safety metrics so external AI can audit the result.
* The AI export panel explains the copy → open → paste flow and warns users to review answer/context data before sending it to an external AI.
* v4 reports use `backend/app/services/v4_report_service.py`; legacy sessions continue using the legacy DS engine.

---

## 4. 🧠 Signal Aggregation Engine (v1.0 Refactored & Verified)

### 5 Fluctuation Archetypes — Shannon Entropy Benchmarks (Pytest 5/5 & Live Benchmark 100% ✅)

| # | Case | Profile | $E_r$ Target | Actual $E_r$ | Strategy | Core Paths | Confidence |
|---|------|---------|--------------|--------------|----------|------------|------------|
| 0 | 0% Laser Focus | ນ້ອງເຊັນ 19, ມ.ລ ປີ 2, ວຽງຈັນ | `< 0.15` | `0.13` | Straight Path | `C2 ONLY` | 85.0% |
| 1 | 25% Clear Direction | ນ້ອງນ້ຳ 18, ປ.ຕີ ປີ 1, ວຽງຈັນ | `0.15–0.39` | `0.28` | Core + Exploratory | `C2 (Expl: C1)` | 85.0% |
| 2 | 50% Dual Interest | ນ້ອງເມກ 17, ມ.6, ຫຼວງພະບາງ | `0.40–0.64` | `0.49` | Dual Secondary | `C3 + C6` | 63.0% |
| 3 | 75% Multi-Scattered | ນ້ອງມົນ 19, ປ.ຕີ ປີ 2, ສະຫວັນ | `0.65–0.84` | `0.70` | Exploratory | `C3 (Expl: C2, C6)` | 45.0% |
| 4 | 100% Total Uncertainty | ນ້ອງຟ້າ 16, ມ.5, ຊຽງຂວາງ | `≥ 0.85` | `1.00` | Need Support | `[ ]` | 30.0% |

---

## 5. Development & Testing Commands
```bash
# In /home/pheuang01/Projects/nextpath01/nextpath01
node scripts/test_3_rounds_lifecycle.mjs            # Run 3-Round Clean Lifecycle Test
backend/.venv/bin/python backend/benchmark_5_fluctuations.py # Run 5 Fluctuation Archetypes Benchmark
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_4_fluctuation_cases.py -q # Verify entropy 0/25/50/75/100% (5 passed)
DATABASE_URL=sqlite+aiosqlite:////tmp/pathai-test.db backend/.venv/bin/pytest -q backend/tests # Run ALL backend pytest tests (71 passed ✅)
npm run build                                      # Production build verification (9/9 routes ✅)
./node_modules/.bin/eslint app                     # Frontend lint verification
```

### PATHAI v4.0 Scoring Contract
* Source files: `v4.0/questions_full.json`, `v4.0/scoring.py`, and `backend/app/services/v4_report_service.py`.
* Web sessions request `form_version=v4.0.0`; legacy `v0.9.1` remains available as a fallback/default API form for backward compatibility.
* v4 scoring: question-level normalization to 0–1 using the legal maximum for `max_select`, equal averaging over six scoring sections, Q17 negative penalty subtraction with clamp, then Pearson profile correlation against seven templates.
* v4 context: Q26–Q27 produce `risk_willingness` (1–4); Q28 produces separate `safety_readiness` (0–5). Family/constraint context does not alter career scores.
* v4 is not entropy-based. The entropy benchmarks remain part of the legacy Signal Engine regression suite.

---

## 6. 📅 Session Logs

### Session 2026-09-25 — v4 Completion Guard, Report Recovery & Lao Province Font

**✅ Completed and verified:**
- Reproduced the Q9 partial-selection defect: selecting 1 of the required 2 options could mark a v4 session completed and produce an empty invalid report.
- Added frontend detection for incomplete multi-select answers; the assessment now identifies the affected question (for example, `Q9`) before submission.
- Added backend v4 validation at the completion boundary. Invalid v4 sessions return `409 Conflict` and remain `in_progress`; legacy session behavior is unchanged.
- Added a stale-invalid-v4 report guard so previously persisted invalid reports show a clear recovery state with a Start New action instead of a blank report.
- Completed the v4 scoring/report hardening: active-signal denominators, per-section coverage metadata, semantic context normalization, v4 context serialization, and legacy context isolation.
- Applied `Noto Sans Lao` explicitly to the D3 province `<select>` and `<option>` elements while preserving the native accessible/type-ahead control.

**Verification:** backend suite **71 passed**, focused v4/session tests **26 passed**, browser E2E passed for both complete and invalid-Q9 flows, production build and TypeScript passed, frontend ESLint passed, and `git diff --check` passed.

**Release:** implementation committed as `a08b176` (`fix: validate v4 completion and improve Lao province font`) and pushed to `origin/main`.

### Session 2026-09-25 — Integration Fail-Path Debug & Report Guard

**✅ Reproduced and fixed:**
- `GET /api/v1/sessions/{session_id}/report` returned `200` for a session still in `created`/`in_progress`, allowing an incomplete report before Processing was ready.
- Processing's “Open Reflection” button could be clicked before the status poll reached `completed`.
- Feedback could display success without saving when opened without a session ID.

**Fixes:**
- Report and export now return `409 Conflict` until the session is `completed`.
- Processing disables the Report action until completion; premature Report navigation returns to Processing.
- Feedback redirects session-less users home and never reports a false successful submission.
- Added regression coverage for report/export readiness and aligned the legacy version test with the completed-session contract.

### Session 2026-09-25 — Full Web Function Audit & Fail-Path Fixes

- Reproduced and fixed unsupported questionnaire versions silently falling back to legacy data (`GET /api/v1/form` and session creation now return `400`).
- Reproduced and fixed the v4 completion gate ignoring `meta.validation.required_questions`; the frontend now requires every required question, including Q28.
- Fixed stale-session recovery and non-functional Retry buttons on Assessment and Report by clearing invalid sessions and rerunning the load path.
- Fixed the frontend form client so a server-side `400` is not hidden by the offline bundled-form fallback.
- Fixed pytest teardown hanging after successful async DB tests by disposing the shared SQLite engine in `backend/tests/conftest.py`.
- Verification: backend suite **63 passed and exited 0**, fluctuation benchmark **5/5**, production build **9/9 routes**, route smoke **6/6 HTTP 200**, and clean-state lifecycle **3/3 rounds passed**.
- Browser click-level automation was unavailable in this environment; API, production-route, source-path, and build verification were completed instead.

### Session 2026-09-25 — Browser QA & Runtime Investigation

- Installed the browser-testing stack: global `webapp-testing` and `playwright-best-practices` skills, Playwright Python `1.63.0` in `backend/.venv`, and Chromium.
- Browser E2E passed: consent → Assessment → D1–D3 + Q1–Q28 → autosave → Processing → Report → all report tabs → JSON download → Feedback submission.
- Browser smoke passed at 375px, 768px, and 1440px with no horizontal overflow, console errors, or page errors; direct-access guards for Processing, Report, and Feedback redirected correctly.
- Reproduced the “checked consent but cannot continue” symptom on the existing port-3000 server: the checkbox DOM was checked but the button remained disabled.
- Root cause was a stale `next-server` process (`PID 1112411`, started before the latest build). A fresh Next server passed the same click flow; the current source `ConsentCheckbox` and Introduction state wiring are correct.
- Backend was started on port `8000`; `/health` and the v4 form endpoint returned `200`. Restart the old frontend after stopping the stale port-3000 process so it serves the latest build.
- Test harness notes: D3 uses `select#province-select` (name `province`), not `name="D3"`; an earlier selector failure was test-code-only. Markdown content-type casing also caused one false positive; `curl` confirmed the response header is correct.

### Session 2026-09-25 — PATHAI v4.0 Web Integration & Entropy Regression Check

**✅ Completed:**
- Committed checkpoint before implementation: `ac867bf chore: checkpoint PATHAI v4.0 assessment draft`.
- Added versioned v4 form loading for frontend/backend; the active web form requests `v4.0.0` while legacy forms remain supported.
- Added native province dropdown for D3 with 18 options and keyboard/type-ahead behavior.
- Added v4 scoring path: normalized question scores, equal six-section weighting, Q17 negative penalty, Pearson template correlation, and separate Q26–Q28 context metrics.
- Added v4 report adapter so new option codes do not pass through legacy DS rules.
- Report AI prompt now includes translated/extracted answers, question stems, calculation method, and audit questions for ChatGPT/Claude/Gemini.
- Verification: `npm run lint` passed; `npm run build` passed (9/9 routes); v4 scoring/report smoke tests passed; entropy regression test passed **5/5**.

**Entropy benchmark results (legacy Signal Engine):**
- 0%: `E_r=0.13` → Laser Focus
- 25%: `E_r=0.28` → Clear Direction
- 50%: `E_r=0.49` → Dual Interest
- 75%: `E_r=0.70` → Multi-Scattered
- 100%: `E_r=1.00` → Total Uncertainty

**Important boundary:** v4.0 uses Pearson profile correlation, not entropy. The entropy benchmark remains a regression suite for the legacy Signal Engine.

### Session 2026-09-25 — Frontend UX & Accessibility Pass

**Completed:**
- Replaced clickable option `<div>` elements with native controlled radio/checkbox inputs while preserving the existing card presentation and selection rules.
- Added v4 minimum-answer feedback before completion, keyboard-visible focus states, a skip link, reduced-motion handling, D2 input labeling, and an accessible reset button.
- Updated privacy wording to distinguish “no name/email requested” from anonymous session answer storage.
- Clarified the external AI prompt flow, added a review-before-sharing notice, and exposed report tab/proof toggle states to assistive technology.

**Verification:** `npm run lint` passed; `npm run build` passed (9/9 routes); production-style route checks returned `200` for `/`, `/introduction`, `/assessment`, `/processing`, `/report`, and `/feedback`. No questionnaire, API, database, or scoring source files were changed.

### Session 2026-09-25 — End-to-End Report Access Diagnosis

**✅ Verified full flow with services running:**
- FastAPI backend on `127.0.0.1:8000` and production frontend on `127.0.0.1:3001`.
- Loaded `v4.0.0` form: 3 demographics + 28 questions.
- Created a v4 session, saved all 31 answers, completed the session, and retrieved the report successfully.
- `GET /api/v1/sessions/{session_id}/report` returned `200`, report version `v4.0.0`, summary present, 1 pattern, and 3 possible paths.
- Markdown export returned `200` with `Form Version: v4.0.0`.
- Frontend routes `/`, `/introduction`, `/assessment`, `/processing`, `/report`, and `/feedback` returned `200`.
- Backend regression tests for full flow, session lifecycle, and validation: **23 passed**.

**🔴 Root cause when Report was unreachable:**
- `npm start` starts only the Next.js frontend; it does **not** start FastAPI.
- Without FastAPI on port `8000`, form/session/answer/report API calls fail even though frontend routes still return `200`.
- `app/assessment/page.tsx` currently creates a fake `session-${Date.now()}` fallback when initial session creation fails. This can let the user continue temporarily, but Processing later cannot find that session and redirects to `/`, making the failure look like Report is inaccessible.

**⚠️ Additional error-path findings (not fixed in this diagnostic pass):**
- Direct navigation to `/report` without a valid session silently redirects to `/` instead of explaining that a completed session is required.
- A missing/expired session on Report also redirects silently to `/`; the generic error banner is used only for non-404 report failures.
- Running the frontend alone can still load bundled v4 questions, which may make the form appear functional while autosave and completion cannot persist.

**Operational requirement:** start both services before testing the real flow:
```bash
PYTHONPATH=backend backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
npm start
```

**Boundary:** This was a diagnosis and memory update only. No questionnaire, algorithm, API contract, database, or frontend code was changed in this pass.

### Session 2026-09-25 — Draft and Session Answer Isolation Fix

**✅ Fixed:**
- Draft storage moved from the unscoped `pathai.assessment.draft.v1` payload to a v2 envelope containing `form_revision`, `session_id`, and `answers`.
- Drafts are restored only when both the questionnaire revision and session ID match; a new session cannot inherit answers from another session.
- Legacy v1 drafts are ignored and removed when the user starts a fresh assessment.
- Session storage now records the questionnaire revision separately from the API form version.
- Assessment detects sessions created before the current questionnaire revision and creates a fresh v4 session before allowing submission.
- Removed the fake `session-${Date.now()}` fallback. If the backend is unavailable, the assessment now shows an error instead of proceeding toward a guaranteed Report failure.
- Completed sessions still remain resumable for their own Report/prompt flow, while “Start New” clears the session and draft explicitly.

**Verification:** `npm run lint` passed; `npm run build` passed with all 9 routes generated; `git diff --check` passed. No questionnaire content, scoring rules, API contracts, or database schema were changed.

### Session 2026-09-24 (Thursday) — Signal Engine Math Overhaul & Full Verification

**🎯 Main Objective:**  
ປ່ຽນ `signal_engine.py` ຈາກ `if-else` ທຳມະດາ ໄປເປັນ **Deterministic Statistical Engine** ໂດຍໃຊ້ສູດຄະນິດສາດລະດັບ Master's ທີ່ Qwen ໄດ້ສະເໜີ.

---

**✅ Completed Tasks:**

**1. Evaluated Master's-Level Math Framework Proposal**
- ທ. Qwen ສະເໜີ 4 ສູດ: Shannon Entropy, Bayesian Update, Softmax Normalization, Tension Detection.
- ສະຫຼຸບ: ສູດທີ່ **ເໝາະສົມ** ກັບ PATHAI ຄື Shannon Entropy ($E_r$) ສຳລັບ Fluctuation Gate ແລະ Weighted Scores.
- ສ່ວນ Bayesian ແລະ Softmax **ຊ້ຳຊ້ອນ** ກັບ Logic ທີ່ມີຢູ່ ແລະ **ອາດເພີ່ມ Complexity ໂດຍບໍ່ຈຳເປັນ**.

**2. Implemented Final Signal Aggregation Engine (v1.0)**
- File: [`backend/app/ds/signal_engine.py`](file:///home/pheuang01/Projects/nextpath01/nextpath01/backend/app/ds/signal_engine.py)
- ຈຸດ key ທີ່ implement:
  - Multi-select normalization: `norm_q = min(1.0, raw_pts / 3.0)` (ປ້ອງກັນ score inflation)
  - Explicit unknown sets: `UNCERTAIN_OPTION_CODES`, `PREFER_NOT_OPTION_CODES`, `NO_SIGNAL_CODES`
  - Shannon Entropy Ratio $E_r$ for Fluctuation Classification (5-tier gate)
  - Expanded tensions T1–T7 (ລວມ Lao-specific tensions)
  - Feasibility sensitivity matrix with province context (D3, Q22, Q23)
  - Confidence clamped 20.0–85.0 with transparent deductions
  - Soft Negative Reduction from Q15 (`negative_factor` formula)

**3. Wrote & Verified All Benchmark Tests**
- Files:
  - [`backend/tests/test_4_fluctuation_cases.py`](file:///home/pheuang01/Projects/nextpath01/nextpath01/backend/tests/test_4_fluctuation_cases.py)
  - [`backend/tests/test_signal_engine.py`](file:///home/pheuang01/Projects/nextpath01/nextpath01/backend/tests/test_signal_engine.py)
- **Result: 7/7 tests PASSED ✅ (100%)**
- ຄ່າ $E_r$ ໃນການທົດສອບ:
  - Case 0 (Sen): $E_r = 0.11$ → Straight Path C2 ✅
  - Case 1 (Nam): $E_r = 0.32$ → Core C2 + Sec C1 ✅
  - Case 2 (Mek): $E_r = 0.57$ → Dual Secondary C3, C6 ✅
  - Case 3 (Mon): $E_r = 0.84$ → Exploratory C2, C3, C6 ✅
  - Case 4 (Fah): $E_r = 1.00$ → Need Support ✅

**4. Production Build Verified**
- `npm run build` ✅ — 9/9 static routes prerendered successfully
- No TypeScript or build errors.
### Session 2026-09-24 (Late Night) — Signal Engine v1.1.2: Architecture Decisions & Final Production Release

**🎯 Main Objective:**  
ສະຫຼຸບການຕັດສິນໃຈທາງສະຖາປັດຕະຍະກຳ (Architectural Decisions) ກ່ຽວກັບ **Co-Signal Structural Floors** ແລະ **3–5 Clusters Multi-Scattered Range** ສູ່ Production Build v1.1.2.

---

**✅ Final Architectural Decisions:**

**1. Pure C5 (Health) Co-Signal Handling:**
- **ບົດວິເຄາະ:** ໃນ Matrix ແບບສອບຖາມ C5 ບໍ່ມີ Options ໃນ Q6, Q7, Q10–Q13 ແລະ Options ຂອງ C5 ໃນ Q1–Q5, Q8–Q9 ຈະໃຫ້ Co-signal ກັບ C4 (Social/Care) ສະເໝີ ($C5:3, C4:2$).
- **ການຕັດສິນໃຈ:** ຍອມຮັບສະພາບ **Dual Care Companion (C5 + C4)** ຕາມທຳມະຊາດຈິດຕະວິທະຍາຂອງແບບສອບຖາມ (ບໍ່ໃຊ້ Mathematical Hack). ວາງແຜນ Rebalance Matrix ເພີ່ມ Option C5 ໃນ v1.2.0.

**2. 3–5 Competing Clusters Multi-Scattered Mapping:**
- **ການຕັດສິນໃຈ:** ຂະຫຍາຍຊ່ວງ Multi-Scattered ໃຫ້ກວມເອົາ $N_{\text{eff}} \in [2.85, 5.00)$ ເພື່ອຮອງຮັບໄວໜຸ່ມທີ່ມີຄວາມສົນໃຈ 3, 4, 5 ສາຍພ້ອມກັນ ($E_r \in [0.65, 0.84]$) ໃຫ້ໄດ້ຮັບ Micro-Experiments ຄົບທຸກສາຍ.
- **Total Uncertainty Gate ($N_{\text{eff}} \ge 5.00$ ຫລື Unknown $\ge 15$ ຫລື Top1 $< 30$):** ສະຫງວນໄວ້ສະເພາະ Flat Diffusion (6–7 ສາຍເທົ່າກັນ) ແລະ Extreme Ambiguity ($E_r \ge 0.85$).

**3. Final Continuous $N_{\text{eff}}$ Mapping Table (v1.1.2):**
- **Laser Focus ($N_{\text{eff}} < 1.75$):** $E_r \in [0.00, 0.14]$ (1 Dominant cluster $\ge 82\%$ share)
- **Clear Direction ($1.75 \le N_{\text{eff}} < 2.25$):** $E_r \in [0.15, 0.39]$ (1 Main + 1 Minor tail)
- **Dual Interest ($2.25 \le N_{\text{eff}} < 2.85$):** $E_r \in [0.40, 0.64]$ (2 Competing clusters e.g. 100/85/10)
- **Multi-Scattered ($2.85 \le N_{\text{eff}} < 5.50$):** $E_r \in [0.65, 0.84]$ (3, 4, 5 Competing exploration clusters)
- **Total Uncertainty ($N_{\text{eff}} \ge 5.50$):** $E_r \in [0.85, 1.00]$ (6–7 Flat clusters / Need Support)

**4. Production Verification & Engine Version Sync:**
- **Backend Pytest:** **41/41 tests PASSED (100% ✅)**.
- **Frontend Production Build:** Next.js 16 App Router **9/9 static routes prerendered ✅**.
- **Engine Version:** Synchronized `algorithm_version="1.1.2"` across `signal_engine.py` and test suites.
- **Phase 2 Roadmap:** Fully structured into 4 sprints across H1–H4, M1–M4, L1–L4, and R1–R2.



---

**🔑 Key API Routes (Confirmed Working):**
```
POST /api/v1/sessions                          → Create anonymous session → returns {session_id, form_version}
POST /api/v1/sessions/{sessionId}/answers     → Save single answer per call → {question_id, option_codes[]}
POST /api/v1/sessions/{sessionId}/complete    → Trigger report generation
GET  /api/v1/sessions/{sessionId}/report      → Fetch full engine output
GET  /health                                  → Backend health check (NOT /api/v1/health)
```

---

## 7. 🗺️ Phase 2 Roadmap — PATHAI Signal Engine v1.2.0

> **Status:** Draft / Phase 2 Master Plan  
> **Foundation:** v1.1.2 (Continuous $N_{\text{eff}} = 2^H$ Hill Number Core)  
> **Target:** Explainability, Confidence Cross-Check, Matrix Rebalancing & Regression Harness

### 🎯 3 Core Pillars of Phase 2
1. **Explainability:** Transparent reasons for confidence deductions (`confidence_reasons[]`) and path-level matches (`reasons[]`).
2. **Calibration:** $E_r \leftrightarrow$ Confidence cross-check and data-driven weights calibration ($n \ge 500$).
3. **Matrix Quality & Safety:** Rebalance C5 Health co-signals with regression snapshot safety net (`scripts/snapshot.py`).

---

### 📋 Priority Matrix & Task Breakdown

| Priority | Code | Task / Feature | Key Objective | Sprint |
|---|---|---|---|---|
| 🔴 **High** | **H1** | **$E_r \leftrightarrow$ Confidence Cross-Check** | Penalize confidence when entropy/dispersion is high (E_r ≥ 0.30 → max 80%, ≥ 0.45 → 70%, ≥ 0.60 → 55%, ≥ 0.75 → 40%). | Sprint 1 |
| 🔴 **High** | **H2** | **`confidence_reasons[]` Output Field** | Output canonical reason codes (`unknown_penalty`, `tension_penalty`, `dispersion_penalty`, `province_penalty`, `weak_leader`, `entropy_cap`). | Sprint 1 |
| 🔴 **High** | **H4** | **Regression Snapshot Framework** | Automated test harness (`scripts/snapshot.py`, `scripts/diff_snapshots.py`) running 100+ synthetic profiles to track regression delta. | Sprint 1 |
| 🔴 **High** | **H3** | **C5 Matrix Rebalance (Health Co-Signals)** | Audit and rebalance questionnaire options for C5 in Q6, Q7, Q10–Q13 to reduce artificial C4 co-signals. | Sprint 2 |
| 🟡 **Medium** | **M1** | **Dual Confidence Metrics** | Split confidence into `data_confidence` (completeness) and `fit_confidence` (clarity of preference). | Sprint 2 |
| 🟡 **Medium** | **M2** | **Path-Level Explainability (`reasons[]`)** | Provide explicit reasons why each path was classified as Core, Secondary, or Exploratory. | Sprint 2 |
| 🟡 **Medium** | **M3** | **Multi-Select Saturation Calibration** | Test and optimize multi-select scoring to prevent saturation on broad answers. | Sprint 3 |
| 🟡 **Medium** | **M4** | **Tiered Province Feasibility** | Refine flat province penalties with regional education hub tiers (VTE, LPB, SVK, Remote). | Sprint 3 |
| 🟢 **Low** | **L1** | **Extended Metadata Versioning** | Expose `weights_version`, `matrix_version`, and `rule_set_version` in output. | Sprint 4 |
| 🟢 **Low** | **L2** | **Empirical Weights Calibration** | Bayesian/Grid optimization of `SECTION_WEIGHTS` with $n \ge 500$ real youth responses. | Sprint 4 |
| 🟢 **Low** | **L3** | **UI Contextual Tooltip for C5 Dual** | Frontend guidance clarifying Health + Social Care companion synergies. | Sprint 1 |
| 🟢 **Low** | **L4** | **Export / Share Feature** | Shareable report summary link / PDF export for parents and educators. | Sprint 4 |
| 🔵 **Research** | **R1** | **Cross-Language Validation** | Validate semantic consistency between Lao and English versions. | Backlog |
| 🔵 **Research** | **R2** | **Longitudinal Tracking** | 6–12 month user follow-up study on career reflection satisfaction. | Backlog |

---

### 🛡️ Phase 2 Quality & Safety Gates
* **Automated Test Suite:** $\ge 50/50$ pytest test cases passing 100%.
* **Regression Safety Diff:** $\le 15\%$ classification shift across 100+ synthetic snapshot profiles.
* **Backward Compatibility:** All new fields optional with safe defaults for existing API clients.
* **Lao-First UX:** All explainability reasons paired with friendly, supportive Lao descriptions.

### 🔍 Phase 2 Intake — Senior Code Review (2026-09-25)

> **Status:** รับทราบและบันทึกไว้เป็น backlog เท่านั้น — ยังไม่เริ่ม implementation
> **Review verdict:** Conditional Pass; ต้องปิดประเด็นสำคัญก่อน Production / Pilot Validation

รายงาน review ล่าสุดยืนยันว่า architecture, versioned questionnaire, documentation และ backend separation อยู่ในทิศทางที่ดี แต่พบช่องว่างที่ต้องจัดลำดับไว้ใน Phase 2 ดังนี้:

| ID | Priority | Phase 2 Work Item | Acceptance Direction | Status |
|---|---|---|---|---|
| D-001 | Critical | Frontend unit/integration tests (Vitest + React Testing Library) | ครอบคลุม components, hooks และ validation states สำคัญ | Not Started |
| D-002 | Critical | Critical-flow E2E test (Playwright) | ครอบคลุม questionnaire → save → complete → report/export/feedback | Not Started |
| D-003 | High | Comprehensive v4.0 scoring tests | ครอบคลุม normalization, section weighting, Q17 penalty, Pearson correlation และ Q26–Q28 context | Not Started |
| D-004 | High | Anonymous API abuse protection | กำหนดแนวทาง rate limiting และทดสอบผลกระทบต่อ anonymous session | Not Started |
| D-005 | Medium | CORS/security configuration review | ตรวจ production origins, headers และ API exposure | Not Started |
| D-006 | Medium | Frontend accessibility regression tests | ตรวจ keyboard, focus, screen reader semantics และ responsive states | Not Started |
| D-007 | Medium | CI/CD quality gate | รัน lint, typecheck, backend/frontend tests และ production build อัตโนมัติ | Not Started |
| D-008 | Low | Dependency/version audit | ตรวจ dependency versions, CVEs และความถูกต้องของ lucide-react version | Not Started |

**Scope boundary:** รายการนี้เป็นการบันทึกข้อค้นพบและ acceptance direction เท่านั้น ยังไม่มีการเพิ่ม test framework, security controls, CI workflow หรือแก้โค้ดใด ๆ จาก review ฉบับนี้

### 🔍 Phase 2 Intake — Independent QA & Architecture Review (2026-09-25)

> **Status:** รับทราบและบันทึกไว้เป็น backlog เท่านั้น — ยังไม่เริ่ม implementation
> **Review assessment:** Mature MVP / 8.5 out of 10; เหมาะสมสำหรับ pilot หลังปิดความเสี่ยงสำคัญ

รายงาน Independent Review ฉบับที่สองยืนยันจุดแข็งของระบบ ได้แก่ การแยก Legacy `v0.9.1` กับ active `v4.0.0`, regression snapshot จำนวน 103 synthetic profiles, fluctuation archetypes 0–100%, draft/session isolation, fail-loudly behavior และ accessibility baseline จาก native controls/skip link/focus states

ประเด็นต่อไปนี้ให้ถือเป็น Phase 2 backlog เพิ่มเติม โดยยังไม่มีการยืนยันว่าเป็น defect จนกว่าจะมีการตรวจสอบหรือทดสอบเฉพาะด้าน:

| ID | Priority | Phase 2 Work Item | Acceptance Direction | Status |
|---|---|---|---|---|
| IR-001 | High | CI/CD pipeline automation | ทุก PR รัน lint, typecheck, backend/frontend tests และ production build | Not Started |
| IR-002 | Medium | Visual regression testing | ตรวจ screenshot/layout ของ continuous scroll และ Lao-first responsive UX | Not Started |
| IR-003 | High | PostgreSQL load/concurrency testing | ทดสอบ answer writes และ report flow ที่ 500+ concurrent users พร้อมตรวจ deadlock/timeout | Not Started |
| IR-004 | High | API rate limiting | ออกแบบและทดสอบ per-IP/per-session limits สำหรับ session, answers และ feedback | Not Started |
| IR-005 | High | Pearson zero-variance audit | ตรวจ `scoring.py` สำหรับ zero variance/division-by-zero และกำหนด deterministic fallback | Not Started |
| IR-006 | Medium | Network-chaos/offline draft testing | ทดสอบ offline ระหว่าง Q15–Q20 และการกลับมา online โดยไม่ทำให้ draft สูญหายหรือชนกัน | Not Started |
| IR-007 | Medium | External AI context disclaimer review | ตรวจข้อความเตือนเรื่อง hallucination, local context และการใช้ผลลัพธ์เพื่อ reflection เท่านั้น | Not Started |
| IR-008 | Medium | Data retention and purge policy | กำหนด retention สำหรับ abandoned sessions และ completed sessions พร้อมตรวจผลกระทบต่อผู้ใช้ | Not Started |
| IR-009 | Low | Stale development process mitigation | ประเมินแนวทางป้องกัน stale Next server โดยไม่ kill process ของผู้ใช้อื่นหรือ production | Not Started |

**Review boundary:** ข้อเสนอเรื่อง rate limiting, PostgreSQL concurrency, Pearson edge case, retention และ stale process เป็น risk hypotheses ที่ต้องตรวจสอบด้วยหลักฐานก่อนเปลี่ยน architecture หรือ production behavior
