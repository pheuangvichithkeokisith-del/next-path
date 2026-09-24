# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** 2026-09-24 (Thursday Session) | Production Build v0.9.2 | Signal Aggregation Engine v1.0 — Fully Verified & Stable

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
* 3 Grounded Truths cards (100% Privacy, No Timer, Not an Exam).
* 8 Dimensions / Modules architecture grid.

### 📝 Assessment Studio (`app/assessment/page.tsx`)
* **Google Forms Continuous Scroll Style**: All questions rendered on one page with smooth vertical scrolling.
* Grouped by 8 modules:
  - ຂໍ້ມູນເບື້ອງຕົ້ນ (Demographics: D1–D3)
  - ໝວດ 1 — ຄວາມສົນໃຈ (Interests: Q1–Q4)
  - ໝວດ 2 — ທັກສະ & ປະສົບການ (Skills / Evidence: Q5–Q7)
  - ໝວດ 3 — ຄ່ານິຍົມ (Values: Q8–Q9)
  - ໝວດ 4 — ຮູບແບບການເຮັດວຽກ (Work Style: Q10–Q13)
  - ໝວດ 5 — ການຮຽນ ແລະ ການຮຽນຮູ້ (Learning: Q14–Q18)
  - ໝວດ 6 — ເປົ້າໝາຍ (Goals: Q19–Q21)
  - ໝວດ 7 — ຄວາມເປັນໄປໄດ້ຕົວຈິງ (Feasibility: Q22–Q23)
  - ໝວດ 8 — ເສັ້ນທາງການເດີນຕໍ່ (Journey: Q24–Q28)
* Tactile choice cards (`OptionList.tsx`), autosave debouncing, draft caching.

### 📊 Report Space & AI Prompt Export (`app/report/page.tsx`)
* Tabbed sections adhering to the 6-Part Reflection Architecture:
  1. กะจกสะท้อนตัวตน (Patterns & Values)
  2. หลักฐานจากประสบการณ์จริง (Self-Reported Evidence)
  3. เส้นทางที่น่าสำรวจในลาว (Core & Exploratory Paths)
  4. จุดที่ยังเปิดกว้าง (Embracing Unknowns & Tensions)
  5. การทดลองสัปดาห์นี้ (Lao-Context Micro-Experiments)
  6. ข้อมูลสำหรับคุยกับ AI / พ่อแม่ (AI Prompt Export & Conversation Starters)

---

## 4. 🧠 Signal Aggregation Engine (v1.0 Refactored & Verified)

### A. 7 Canonical Career Clusters (ບໍລິບົດລາວ)
1. **C1:** ວິເຄາະຂໍ້ມູນ / ແກ້ໄຂບັນຫາ — `ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ` (Data/Analysis)
2. **C2:** ເທັກໂນໂລຊີ / ຊັອບແວ — `ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ` (Tech/Software)
3. **C3:** ອອກແບບ / ສ້າງສັນ — `ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ` (Design/Creative)
4. **C4:** ສື່ສານ / ສັງຄົມ — `ສາຍສື່ສານ, ສັງຄົມ ແລະ ການພັດທະນາຄົນ` (Social/Communication)
5. **C5:** ສຸຂະພາບ / ການແພດ — `ສາຍສຸຂະພາບ, ການແພດ ແລະ ການເບິ່ງແຍງ` (Health/Care)
6. **C6:** ທຸລະກິດ / ຈັດການ — `ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ` (Business/Management)
7. **C7:** ງານປະຕິບັດ / ຊ່າງ — `ສາຍງານປະຕິບັດ, ງານຊ່າງ ແລະ ທຳມະຊາດ` (Practical/Craft/Nature)

### B. Mathematical Rules & Engine Architecture
1. **Multi-Select Normalization:**
   - ປ້ອງກັນການບວກສະສົມຄະແນນເກີນຈິງ ໂດຍຄິດໄລ່: $\text{norm\_q} = \min(1.0, \frac{\text{raw\_pts}}{3.0})$
   - ຄະແນນໝວດ (Section Score) ຄິດໄລ່ຈາກຄ່າສະເລ່ຍຂອງຄຳຖາມໃນໝວດນັ້ນໆ.
2. **Section Weights:**
   - Skills (Q5–Q7): `0.25`
   - Learning (Q14, Q16): `0.22`
   - Interests (Q1–Q4): `0.20`
   - Goals (Q19–Q20): `0.15`
   - Values (Q8–Q9): `0.09`
   - Work Style (Q10–Q13): `0.09`
3. **Soft Negative Reduction (Q15):**
   - $\text{negative\_factor}(C) = \min(0.45, \frac{\sum \text{negative}}{18.0})$
   - $\text{adjusted\_fit} = \text{raw\_fit} \times (1.0 - \text{negative\_factor})$
4. **Feasibility Matrix & Province Context (D3, Q22, Q23):**
   - Base = 100, Min = 45 (ຫ້າມຕັດເສັ້ນທາງອອກ).
   - ຮອງຮັບຄວາມອ່ອນໄຫວຕາມສາຍ (`LOCATION_SENSITIVITY`, `TIME_SENSITIVITY`, `PHYSICAL_SENSITIVITY`).
   - ຫັກຄະແນນເພີ່ມເມື່ອຢູ່ຕ່າງແຂວງ (D3) ທີ່ບໍ່ພ້ອມຍ້າຍ (Q23) ຫຼື ມີ Multi-constraints ($\ge 2$).
5. **Confidence Score Calculation:**
   - Base 100.0, Clamped 20.0–85.0.
   - ຫັກ Unknowns ($-3.5$ ຕໍ່ຂໍ້), Tensions ($-5.0$ ຕໍ່ຈຸດ, ຫາກ $\ge 2$ ຫັກເພີ່ມ $-10$).
   - ຫັກ Multi-Interest Dispersion / Dual-Interest ($-12$ ຫາ $-20$).
   - Need Support Clamp: ຫາກ Unknowns $\ge 15$ ຫຼື Max Fit $< 35$, Confidence ຈະຖືກ Clamp $\le 30$.
6. **Fluctuation Gate & Path Classification:**
   - **Core Path:** `Fit >= 68`, `Strong Sections >= 2`, `Confidence >= 65`, `Negative < 0.25`, `Feasibility >= 60`, **ບໍ່ມີ Tension ແລະ ບໍ່ມີ Multi-Interest**.
   - **Caution Path:** `Fit >= 45` ຮ່ວມກັບ `Negative >= 0.25` ຫຼື `Feas < 65` ຫຼື `ມີ Tension`.
   - **Secondary Path:** `Fit >= 50` ຫຼື ມີສັນຍານຮອງເດັ່ນຊັດ.
   - **Exploratory Path:** `Fit >= 35` ຫຼື ຢູ່ໃນໄລຍະເລີ່ມຕົ້ນສຳຫຼວດ.
   - **Low Fit:** `Fit < 35`.

### C. 5 Fluctuation Archetypes — Shannon Entropy Benchmarks (Pytest 7/7 ✅ 100%)

> ⚠️ **ຈຸດວິກິດ (Critical Thresholds):** $E_r < 0.15$ = Laser Focus | $E_r \ge 0.85$ = Need Support

| # | Case | Profile | $E_r$ Target | Strategy | Core | Confidence |
|---|------|---------|--------------|----------|------|------------|
| 0 | 0% Laser Focus | ນ້ອງເຊັນ 19, ມ.ລ ປີ 2, ວຽງຈັນ | `< 0.15` | Straight Path | `C2 ONLY` | 85 |
| 1 | 25% Clear Direction | ນ້ອງນ້ຳ 18, ປ.ຕີ ປີ 1, ວຽງຈັນ | `0.15–0.39` | Core + Secondary | `C2 + C1` | 75–85 |
| 2 | 50% Dual Interest | ນ້ອງເມກ 17, ມ.6, ຫຼວງພະບາງ | `0.40–0.64` | Dual Secondary | `C3 + C6` | 55–65 |
| 3 | 75% Multi-Scattered | ນ້ອງມົນ 19, ປ.ຕີ ປີ 2, ສະຫວັນ | `0.65–0.84` | Exploratory | `C2, C3, C6` | 35–45 |
| 4 | 100% Total Uncertainty | ນ້ອງຟ້າ 16, ມ.5, ຊຽງຂວາງ | `≥ 0.85` | Need Support | `[ ]` | 20–30 |

**ສຳຄັນ:** $E_r$ ຄິດໄລ່ດ້ວຍ Shannon Entropy Ratio = $\frac{H(\mathbf{p})}{H_{\max}}$ ບ່ອນທີ່ $H_{\max} = \log_2(7)$

---

## 5. Development & Testing Commands
```bash
# In /home/pheuang01/Projects/nextpath01/nextpath01/backend
.venv/bin/pytest tests/test_4_fluctuation_cases.py -v   # Run Fluctuation Benchmark Tests
.venv/bin/pytest tests/test_signal_engine.py -v         # Run Signal Engine Unit Tests
.venv/bin/pytest tests -v                               # Run ALL tests (7/7 ✅)

# Frontend in root directory
npm run dev     # Start Next.js development server
npm run build   # Production build verification (9/9 routes ✅)
npm start       # Run production server at localhost:3000
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
