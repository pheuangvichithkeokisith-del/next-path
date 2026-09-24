# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** 2026-09-24 (Late Night Session) | Signal Engine v1.1.2 Production Ready (41/41 Pytest ✅ & 9/9 Next.js Build ✅) | Phase 2 Roadmap Integrated

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
backend/.venv/bin/pytest backend/tests -v          # Run ALL backend pytest tests (41/41 ✅)
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





