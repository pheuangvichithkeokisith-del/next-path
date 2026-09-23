# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** September 2026 | Production Build v0.9.1 Pre-Cognitive

---

## 1. Project Overview & Roles
* **Production App Directory:** `/home/pheuang01/Projects/nextpath01/nextpath01` (Next.js App Router + SQLite backend)
* **Design Reference Directory:** `/home/pheuang01/Projects/nextpath01/Next-path01` (Vite + React UI reference)
* **Questionnaire Master Truth:** `/home/pheuang01/Documents/test04.md` and `/home/pheuang01/Documents/test05.md`
* **Architecture & Dimensions Spec:** `/home/pheuang01/Projects/BACKUPS/PATHAI_BACKUP_2026-09-16_22-51/project-files/Projects/prototype project01.md`

---

## 2. Completed Architecture & UX/UI Implementation

### 🏠 Landing Page (`app/page.tsx`)
* Warm organic ivory/sand theme (`#F9F8F5`, `#2D4C3E`, `#8D5B28`, `#7A3E2D`, `#E5E1D8`).
* Youth-first space indicator (*“ພື້ນທີ່ສຳຫຼວດຕົນເອງ ສຳລັບໄວໜຸ່ມລາວ (ອາຍຸ 15+)”*).
* 3 Grounded Truths cards (100% Privacy, No Timer, Not an Exam).
* 8 Dimensions / Modules architecture grid (Interests, Skills, Values, Work Style, Learning, Goals, Feasibility, Journey).
* Comparative breakdown (*“What PATHAI Is”* vs *“What PATHAI Is Not”*).

### 📝 Assessment Studio (`app/assessment/page.tsx`)
* **Google Forms Continuous Scroll Style**: All questions rendered on one page with smooth vertical scrolling.
* Grouped by the 8 actual modules:
  - ຂໍ້ມູນເບື້ອງຕົ້ນ (Demographics: D1–D3)
  - ໝວດ 1 — ຄວາມສົນໃຈ (Interests: Q1–Q4)
  - ໝວດ 2 — ທັກສະ (Skills: Q5–Q7)
  - ໝວດ 3 — ຄ່ານິຍົມ (Values: Q8–Q9)
  - ໝວດ 4 — ຮູບແບບການເຮັດວຽກ (Work Style: Q10–Q13)
  - ໝວດ 5 — ການຮຽນ ແລະ ການຮຽນຮູ້ (Learning: Q14–Q18)
  - ໝວດ 6 — ເປົ້າໝາຍ (Goals: Q19–Q21)
  - ໝວດ 7 — ຄວາມເປັນໄປໄດ້ຕົວຈິງ (Feasibility: Q22–Q23)
  - ໝວດ 8 — ເສັ້ນທາງການເດີນຕໍ່ (Journey: Q24–Q28)
* Tactile choice cards (`OptionList.tsx`) with soft cream backgrounds, forest green borders, and checkmark circles.
* Sticky top progress indicator (`ຕອບແລ້ວ X/28 ຂໍ້`) and green auto-save badge (*“ບັນທຶກອັດຕະໂນມັດແລ້ວ”*).
* LocalStorage draft caching + backend `saveAnswer()` autosave debouncing.

### 🧠 Processing Screen (`app/processing/page.tsx`)
* 4-Quadrant Spatial Network canvas with 12 interconnected thought nodes.
* Dynamic animated dashed SVG lines visualizing pattern synthesis.
* Polling `getSessionStatus()` with auto/manual transition to `/report`.

### 📊 Report Space & AI Prompt Export (`app/report/page.tsx`)
* Filterable tabbed sections:
  1. Summary & Identified Patterns (ຮູບແບບຄວາມຄິດ ແລະ ທັກສະ)
  2. Suggested Possible Paths in Laos (ທິດທາງ ແລະ ໂອກາດສຳຫຼວດ)
  3. Unknowns & Open Questions (ສິ່ງທີ່ຍັງເປີດກວ້າງ)
  4. Low-Stakes Micro-Experiments (ການທົດລອງນ້ອຍໆສຳລັບອາທິດນີ້)
* **Supercharged AI Prompt Generator & Copy Utility**:
  - Automatically compiles user's selected answers, notes, patterns, paths, and unknowns into a structured markdown prompt.
  - Dedicated copy button ready to paste directly into ChatGPT, Claude, or Gemini for in-depth guidance.
  - JSON download export.

### 💬 Global Layout & Header (`app/layout.tsx`, `components/Header.tsx`)
* Sticky glass header with brand logo, direct navigation links, and session reset button.
* Grounded footer with privacy guarantee.

---

## 3. Development Commands
```bash
# In /home/pheuang01/Projects/nextpath01/nextpath01
npm run dev     # Start development server
npm run build   # Production build (Verified passing with 0 errors)
npm start       # Start production server
```
