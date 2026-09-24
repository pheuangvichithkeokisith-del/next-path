# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** 2026-09-24 (Thursday Session) | Production Build v0.9.3 | Transparent AI Prompt & 5 Fluctuation Benchmark Verified

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

### 📊 Report Space & Transparent AI Prompt Export (`app/report/page.tsx`)
* Tabbed sections adhering to the 6-Part Reflection Architecture.
* **1-Click Master AI Prompt Export Button:** Generates structured Lao markdown containing raw user answers, Signal Engine statistics, and thought-provoking AI questions.
* **Calculation Proof Accordion:** Full transparency for users to inspect the exact answers and signals passed to the backend.
* Quick launch links to ChatGPT, Claude, and Gemini.

---

## 4. 🧠 Signal Aggregation Engine (v1.0 Refactored & Verified)

### 5 Fluctuation Archetypes — Shannon Entropy Benchmarks (Pytest 5/5 & Live Benchmark 100% ✅)

| # | Case | Profile | $E_r$ Target | Actual $E_r$ | Strategy | Core Paths | Confidence |
|---|------|---------|--------------|--------------|----------|------------|------------|
| 0 | 0% Laser Focus | ນ້ອງເຊັນ 19, ມ.ລ ປີ 2, ວຽງຈັນ | `< 0.15` | `0.08` | Straight Path | `C2 ONLY` | 85.0% |
| 1 | 25% Clear Direction | ນ້ອງນ້ຳ 18, ປ.ຕີ ປີ 1, ວຽງຈັນ | `0.15–0.39` | `0.35` | Core + Exploratory | `C2 (Expl: C1)` | 85.0% |
| 2 | 50% Dual Interest | ນ້ອງເມກ 17, ມ.6, ຫຼວງພະບາງ | `0.40–0.64` | `0.55` | Dual Secondary | `C3 + C6` | 63.0% |
| 3 | 75% Multi-Scattered | ນ້ອງມົນ 19, ປ.ຕີ ປີ 2, ສະຫວັນ | `0.65–0.84` | `0.83` | Exploratory | `C3 (Expl: C2, C6)` | 45.0% |
| 4 | 100% Total Uncertainty | ນ້ອງຟ້າ 16, ມ.5, ຊຽງຂວາງ | `≥ 0.85` | `1.00` | Need Support | `[ ]` | 30.0% |

---

## 5. Development & Testing Commands
```bash
# In /home/pheuang01/Projects/nextpath01/nextpath01
node scripts/test_3_rounds_lifecycle.mjs            # Run 3-Round Clean Lifecycle Test
backend/.venv/bin/python backend/benchmark_5_fluctuations.py # Run 5 Fluctuation Archetypes Benchmark
backend/.venv/bin/pytest backend/tests -v          # Run ALL backend pytest tests (30/30 ✅)
npm run build                                      # Production build verification (9/9 routes ✅)
```

---

## 6. 📅 Session Logs

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
- Committed to `main` branch with clean working tree.

**5. Servers Verified Running**
- Backend (FastAPI): `http://localhost:8000` — task-206 🟢 RUNNING
- Frontend (Next.js): `http://localhost:3000` — task-208 🟢 RUNNING

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

**⚠️ Known Issues / To Watch:**
- Health endpoint is at `GET /health` (root), **not** `GET /api/v1/health` (returns 404).
- Answer endpoint accepts **one question at a time** via `{question_id, option_codes[]}` — not bulk JSON.
- Frontend at `localhost:3000` returns `200 OK` but full user-journey E2E browser test not yet completed.

---

**🚀 Next Session Priorities:**
1. Complete E2E browser test: Submit full questionnaire via UI → verify report page renders all 6 tabs.
2. Verify report page shows correct: Fit scores, Feasibility %, Confidence, Tensions list, Entropy $E_r$, Micro-Experiments.
3. Test AI Prompt Export button — validate Lao-language markdown export is correct.
4. Optional: Add "ນ້ອງເຊັນ (Case 0)" E2E test path to test suite.
