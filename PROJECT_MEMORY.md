# 🧠 PATHAI — Project Memory & Architecture Context

**Single Source of Truth & Context Memory Document**  
**Updated:** September 2026 | Production Build v0.9.1 Pre-Cognitive

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

## 4. 🧠 Algorithm & Report Upgrade Specification (Q1–Q28 Engine)

### A. 7 Canonical Career Clusters (บริบทลาว)
1. **C1:** สถิติ/ข้อมูล — `ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ` (Data Analysis & Problem Solving)
2. **C2:** ไอที/ซอฟต์แวร์ — `ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ` (Tech & Software Development)
3. **C3:** ดีไซน์/สร้างสรรค์ — `ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ` (Design & Creative Innovation)
4. **C4:** สังคม/สื่อสาร — `ສາຍສື່ສານ, ສັງຄົມ ແລະ ການພັດທະນາຄົນ` (Social, Communication & People)
5. **C5:** แพทย์/สุขภาพ — `ສາຍສຸຂະພາບ, ການແພດ ແລະ ການເບິ່ງແຍງ` (Health, Medicine & Care)
6. **C6:** ธุรกิจ/บริหาร — `ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ` (Management & Tech Business)
7. **C7:** งานช่าง/ธรรมชาติ — `ສາຍງານປະຕິບັດ, ງານຊ່າງ ແລະ ທຳມະຊາດ` (Practical, Craft & Nature)

### B. Core DS Rules & Locked Boundaries (ห้ามละเมิดเด็ดขาด)
1. **[BLOCKED] Q5–Q7 ห้ามแปลงเป็น Skill/Performance Score:**
   - Q5–Q7 คือ *"Self-reported Evidence / ประสบการณ์ที่เคยทำ"* เช่น `[Evidence: ເຄີຍຊ່ວຍວຽກຄອບຄົວ/ຊຸມຊົນ]` ไม่ใช่คะแนนความเก่ง ห้ามใส่ `w=1.5` วัดผล
2. **[REVISED LOGIC] การแยกประเภทสัญญาณ (Positive vs Negative vs Hard Constraint):**
   - **Positive Signal (Q1–Q4, Q14, Q16, Q20):** เพิ่ม Domain Alignment ใน Cluster นั้น
   - **Soft Negative Signal (Q15):** ลด Alignment ลงอย่างนุ่มนวล (Soft reduction) — **ห้ามใช้เป็น Hard Veto หรือตัดออกจากระบบ**
   - **Feasibility & Constraints (D3, Q21, Q22, Q23):** นำไปประกอบเป็นคำแนะนำเชิงบริบทพื้นที่ (Lao Feasibility Context) และ Tensions
3. **[STRUCTURE] การจัดกลุ่มผลลัพธ์ใน Report:**
   - **Core Paths (1–3 เส้นทาง):** คลัสเตอร์ที่ได้รับ Positive Signals สอดคล้องกันหลายมิติ
   - **Exploratory Paths (1–2 เส้นทาง):** คลัสเตอร์ที่มีสัญญาณรอง หรือมีศักยภาพที่น่าสำรวจเพิ่มเติม
   - **Tensions:** จุดขัดแย้งเชิงบวก (เช่น สนใจ Tech ใน Q14 แต่บอกว่ายากใน Q15) เพื่อชวนคิดทบทวน
   - **Micro-Experiments:** แผนการทดลองสัปดาห์นี้ที่ทำได้จริง ไม่เสียเงิน

### C. 6-Part Reflection Report Architecture
1. **ສ່ວນທີ 1: ກະຈົກສະທ້ອນຕົວຕົນ (Patterns & Values):** สะท้อนสิ่งที่ให้คุณค่าและสไตล์การทำงาน
2. **ສ່ວນທີ 2: ຫຼັກຖານຈາກປະສົບການຈິງ (Evidence Tags):** บันทึกสิ่งที่เคยทำจริงเพื่อเสริมความมั่นใจ
3. **ສ່ວນທີ 3: ເສັ້ນທາງທີ່ໜ້າສຳຫຼວດ (Core & Exploratory Paths):** ทิศทางในลาว พร้อมสาขาวิชาที่เกี่ยวข้อง
4. **ສ່ວນທີ 4: ຈຸດທີ່ຍັງເປີດກວ້າງ (Embracing Unknowns & Tensions):** สะท้อนเรื่องที่ยังไม่แน่ใจอย่างอบอุ่น
5. **ສ່ວນທີ 5: ການທົດລອງອາທິດນີ້ (Micro-Experiments):** Action plan ก้าวเล็กๆ ในลาว
6. **ສ່ວນທີ 6: ຂໍ້ມູນສຳລັບໄປລົມກັບ AI / ພໍ່ແມ່ (Conversation Starters & Prompt Export):** โครงสร้าง Prompt พร้อมคัดลอก

---

## 5. Development Commands & Verification
```bash
# In /home/pheuang01/Projects/nextpath01/nextpath01
npm run dev     # Start Next.js development server
npm run build   # Production build (Verified passing 0 errors)
npm start       # Start production server
```
