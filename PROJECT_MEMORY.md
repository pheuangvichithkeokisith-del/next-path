# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** September 2026 | Production Build v0.9.1 Pre-Cognitive | Signal Aggregation Engine v1.0 Verified

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

### C. 4 Fluctuation Archetypes (Verified Passing Pytest 100%)
* **Case 1: 100% Fluctuation (Need Support — ນ້ອງຟ້າ 16, ມ.5, ຊຽງຂວາງ)**
  * *Result:* Core: `[]`, Secondary: `[]`, Confidence: `20.0` (Target: 20–30), Unknowns: 20, Feasibility: 100%.
* **Case 2: 75% Fluctuation (Multi-Scattered Interest — ນ້ອງມົນ 19, ປີ 2, ສະຫວັນນະເຂດ)**
  * *Result:* Core: `[]`, Sec/Exp: `C3 (62%), C2 (32%), C6 (32%)`, Confidence: `45.0` (Target: 35–45), Tensions: `T1, T6`, Feas: 76%.
* **Case 3: 50% Fluctuation (Dual Interest — ນ້ອງເມກ 17, ມ.6, ຫຼວງພະບາງ)**
  * *Result:* Core: `[]`, Dual Secondary: `C3 (76%), C6 (51%)`, Confidence: `60.0` (Target: 55–65), Tension: `T6`, Feas: 83%.
* **Case 4: 25% Fluctuation (Clear Direction — ນ້ອງນ້ຳ 18, ປີ 1, ວຽງຈັນ)**
  * *Result:* Core: `C2 (80%)`, Secondary: `C1 (40%)`, Confidence: `85.0` (Target: 75–85), Tensions: `[]`, Feas: 100%.

---

## 5. Development & Testing Commands
```bash
# In /home/pheuang01/Projects/nextpath01/nextpath01/backend
.venv/bin/pytest tests/test_4_fluctuation_cases.py -v   # Run 4 Fluctuation Unit Tests
.venv/bin/pytest tests/test_signal_engine.py -v         # Run Signal Engine Tests

# Frontend in root directory
npm run dev     # Start Next.js development server
npm run build   # Production build verification
```
