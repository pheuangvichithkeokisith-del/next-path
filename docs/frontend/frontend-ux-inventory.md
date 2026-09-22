# PATHAI Frontend UX/UI Inventory & Lao Language Extraction

**Audit Date:** 2026-09-23  
**Auditor:** PATHAI Frontend UX/UI & Linguistic Review  
**Target Application:** Next.js 16.3.5 App Router (Lao-First Client)  
**Specification Status:** `[LOCKED UX DIRECTION AUDIT]`  
**Scope:** Extraction and review only (Zero code modification, Zero redesign)

---

# 1. Frontend Page Inventory

| Page Name | Route / Path | Purpose | User Goal | Main Components | Current Status |
|---|---|---|---|---|:---:|
| **Landing** | `/` | Introduce PATHAI ethos, reassure user, and initiate journey | Understand platform purpose and start without account friction | Hero Header, Reassurance Banner, 3-Step Flow Cards, CTA Button | `[IMPLEMENTED]` |
| **Introduction** | `/introduction` | Disclose data transparency, anonymous session creation, and obtain consent | Review what data is/isn't collected and grant explicit consent | Data Transparency Cards, Consent Checkbox, Primary Action Button | `[IMPLEMENTED]` |
| **Assessment** | `/assessment` | Administer 3 Demographics (D1–D3) and 28 Questions (Q1–Q28) sequentially | Reflect on self-reported interests, work style, values, learning, and constraints | ProgressTracker, Question, OptionList, SubmitConfirm Modal | `[IMPLEMENTED]` |
| **Processing** | `/processing` | Provide calm, non-intimidating transition while DS Engine evaluates session | Await result compilation without anxiety or sci-fi gimmicks | Breathing Animation Indicator, Calm Notice Box, Polling Hook | `[IMPLEMENTED]` |
| **Report** | `/report` | Present non-judgmental reflection report (Patterns, Paths, Context, Unknowns, Experiments) | Explore self-patterns, unranked paths, and export markdown/JSON for external AI or counselors | Summary Box, Pattern Cards, Unranked Path Cards, Unknowns List, Experiment Cards, Export Box | `[IMPLEMENTED]` |
| **Feedback** | `/feedback` | Collect 3-item qualitative user feedback on reflection resonance | Provide feedback on accuracy and state future interests | 3-Option Agreement Grid, Textareas (Discrepancy & Next Interest), Submit Action | `[IMPLEMENTED]` |

---

# 2. User Flow Mapping

```
┌────────────────────────────────────────────────────────┐
│ 1. Landing Page (/)                                   │
│    Trigger: User visits root URL                       │
│    Action: Clicks "ເລີ່ມຕົ້ນ →"                         │
│    Response: Navigates to /introduction                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Introduction & Consent (/introduction)              │
│    Trigger: Page load                                  │
│    Action: Checks consent checkbox & clicks "ຢືນຢັນ..."│
│    Response: Calls POST /sessions -> Navigates to      │
│              /assessment                               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Assessment (/assessment)                            │
│    Trigger: Step-by-step question display              │
│    Action: Answers D1–D3 and Q1–Q28; autosaves draft   │
│    Action: Clicks "ສົ່ງຄຳຕອບ ✓"                         │
│    Response: Calls POST /complete -> If missing items, │
│              renders SubmitConfirm modal -> Navigates  │
│              to /processing                            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. Processing (/processing)                            │
│    Trigger: Page load                                  │
│    Action: Passive waiting (no user action needed)     │
│    Response: Polls GET /status -> On "completed", auto-│
│              redirects to /report                      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 5. Reflection Report (/report)                         │
│    Trigger: Page load                                  │
│    Action: Reads patterns, paths, unknowns, experiments│
│    Action: Clicks "ຄັດລອກ Markdown" / "ດາວໂຫຼດ JSON"   │
│    Action: Clicks "ໃຫ້ຄວາມຄິດເຫັນຕໍ່ລະບົບ →"           │
│    Response: Copies sanitized text / downloads file /  │
│              navigates to /feedback                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 6. Feedback & Closure (/feedback)                      │
│    Trigger: Page load                                  │
│    Action: Selects agreement & optional notes; submits │
│    Response: Calls POST /feedback -> Displays thank    │
│              you card -> Action "ກັບສູ່ໜ້າຫຼັກ"         │
└────────────────────────────────────────────────────────┘
```

---

# 3. Component Inventory

| Component Name | File Location | Responsibility | Props / State | Reusability |
|---|---|---|---|:---:|
| **`ConsentCheckbox`** | `components/ConsentCheckbox.tsx` | Renders styled accessible checkbox for consent acceptance | `checked: boolean`, `onChange: (val: boolean) => void` | High (Reusable in any consent flow) |
| **`ErrorBanner`** | `components/ErrorBanner.tsx` | Displays calm, non-aggressive error state with retry action | `onRetry?: () => void` | High (Global error presentation) |
| **`Loading`** | `components/Loading.tsx` | Provides neutral pulsing skeleton placeholder | `className?: string` | High (Any skeleton container) |
| **`OptionList`** | `components/OptionList.tsx` | Manages single/multi-choice selections, exclusive choice mutual exclusivity, and 'other' text expansion | `item: FormItem`, `selectedCodes: string[]`, `otherText: string \| null`, `onCodesChange`, `onOtherTextChange` | High (Core questionnaire input engine) |
| **`ProgressTracker`** | `components/ProgressTracker.tsx` | Renders percentage line and question counter badge | `current: number`, `total: number`, `sectionTitle?: string`, `isDemographics?: boolean` | High (Assessment header tracker) |
| **`Question`** | `components/Question.tsx` | Wraps question stem, section badge, note, input field, and extra free-text | `item: FormItem`, `answer: DraftAnswer`, `onChange: (changes) => void` | High (Standard question renderer) |
| **`SubmitConfirm`** | `components/SubmitConfirm.tsx` | Accessible modal warning about unanswered questions with dual choice | `missing: number`, `onEdit: () => void`, `onSubmit: () => void` | High (Incomplete submission guard) |

---

# 4. UX Behavior Analysis

- **Loading States:**
  - Form loading: Clean skeleton card (`Loading.tsx`) centered on warm canvas.
  - Submitting state: Primary button switches to disabled with text `"ກຳລັງສົ່ງ..."`.
  - Processing state: Gentle geometric breathing circle animation (`animate-breathe`, 3.5s cycle).
- **Error States:**
  - Offline / Network Failure: Renders `ErrorBanner.tsx` with `"ເກີດຂໍ້ຜິດພາດບາງຢ່າງ — ຂໍ້ມູນຂອງທ່ານຍັງຢູ່ຄົບ ລອງໃໝ່ອີກເທື່ອ"` and `"ລອງໃໝ່"` button.
  - Fallback Resiliency: In standalone/offline mode, session creation and evaluation degrade gracefully to client mock/fallback without blocking user progression.
- **Empty States:**
  - No patterns: `"ຍັງບໍ່ມີຮູບແບບສຳລັບສະທ້ອນ"`
  - No paths: `"ຍັງບໍ່ມີເສັ້ນທາງສຳລັບສຳຫຼວດ"`
  - No unknowns: `"ບໍ່ມີຂໍ້ທີ່ລະບຸວ່າຍັງບໍ່ຊັດເຈນ"`
- **Validation Messages:**
  - Multi-select constraints: Shows counter `(ເລືອກແລ້ວ X/Y ຂໍ້)` in `OptionList.tsx`.
  - Incomplete submission: Modal dialog stating `"ທ່ານຍັງບໍ່ໄດ້ຕອບ X ຂໍ້ — ຈະສົ່ງແບບນັ້ນບໍ?"`.
- **Button Behavior:**
  - Primary button (`btn-primary`): 48px minimum touch target, subtle translateY(-1px) hover effect, disabled opacity 0.45 with `cursor-not-allowed`.
  - Secondary button (`btn-secondary`): Clean white surface with neutral stone border.
  - Ghost button (`btn-ghost`): Transparent background for low-prominence back navigation.
- **Navigation Behavior:**
  - Smooth scroll to top on next/previous transition (`window.scrollTo({ top: 0, behavior: "smooth" })`).
  - Browser back navigation supported seamlessly via Next.js router.
- **Mobile Behavior:**
  - Sticky header (`h-14`, backdrop-blur) keeps context visible without taking screen real estate.
  - Minimum touch targets ($\ge 48\text{px}$) across all clickable options.

---

# 5. Responsive Review

| Viewport Width | Device Category | Layout Behavior | Overflow & Text Wrapping | Touch Usability |
|---|---|---|---|---|
| **320px** (iPhone SE 1st gen) | Ultra-compact Mobile | Single-column stack, tight padding (`px-4 py-6`) | `break-words` prevents text clipping; buttons stack vertically | Touch target $\ge 48\text{px}$; no horizontal scroll |
| **360px** (Galaxy S8 / standard Android) | Small Mobile | Single-column stack, comfortable line spacing | Clean wrapping of Lao multi-line stems | Full-width button taps |
| **390px** (iPhone 12/13/14/15) | Standard Modern Mobile | Single-column with card padding `p-4 sm:p-5` | Ample whitespace, comfortable reading rhythm | Excellent ergonomics |
| **412px** (Pixel 7 / Galaxy S20+) | Large Modern Mobile | Single-column, optimal card breathing room | High legibility with Noto Sans Lao font | Excellent thumb reach |
| **768px** (Tablet / iPad) | Tablet | Multi-column grids activate (2 columns for paths/data cards, 3 columns for steps) | Balanced 2-column distribution | Touch and pointer optimized |
| **1024px+** (Laptop / Desktop) | Desktop | Centered container (`max-w-2xl` / 672px max width) | Contained reading column (avoids overly long line lengths for readability) | Clean click interactions |

---

# 6. Content Extraction (User-Facing Text)

All extracted verbatim from [`content/copy.ts`](file:///home/pheuang01/Projects/nextpath01/nextpath01/content/copy.ts), [`app/layout.tsx`](file:///home/pheuang01/Projects/nextpath01/nextpath01/app/layout.tsx), and page components:

### 6.1 Landing (`/`)
- **Title:** `PATHAI`
- **Subtitle:** `ພື້ນທີ່ຊ່ວຍໃຫ້ທ່ານເຂົ້າໃຈຕົນເອງ ແລະ ຄິດຫາເສັ້ນທາງການຮຽນ ຫຼື ການເຮັດວຽກ`
- **Reassurance:** `ບໍ່ແມ່ນການທຳນາຍ ບໍ່ມີຄະແນນ ບໍ່ຕັດສິນແທນທ່ານ`
- **Explaining Subtext:** `ລະບົບນີ້ຖືກອອກແບບມາເພື່ອຊ່ວຍສະທ້ອນຄວາມຄິດ ບໍ່ແມ່ນການຕັດສິນ ທ່ານເປັນຜູ້ເລືອກ ແລະ ຕັດສິນໃຈເສັ້ນທາງຂອງຕົນເອງສະເໝີ`
- **Step 1:** `① ຕອບຄຳຖາມ 28 ຂໍ້ (ປະມານ 15–20 ນາທີ)` — `ຕອບຕາມຄວາມຮູ້ສຶກຈິງ`
- **Step 2:** `② ລະບົບວິເຄາະຮູບແບບຈາກຄຳຕອບ` — `ລະບົບຊອກຫາຈຸດເຊື່ອມໂຍງ ຄວາມສົນໃຈ ແລະ ທັກສະ`
- **Step 3:** `③ ເຫັນຜົນສະທ້ອນ ແລະ ທາງເລືອກທີ່ສາມາດສຳຫຼວດ` — `ເຫັນທາງເລືອກ ແລະ ຂໍ້ແນະນຳໃນການລອງປະຕິບັດ`
- **CTA Button:** `ເລີ່ມຕົ້ນ →`
- **Footer Subtext:** `ບໍ່ຕ້ອງລົງທະບຽນ · ບໍ່ເກັບຂໍ້ມູນສ່ວນຕົວ`

### 6.2 Introduction & Consent (`/introduction`)
- **Heading:** `ກ່ອນເລີ່ມ — ຂໍ້ມູນຂອງທ່ານ`
- **Body Note:** `ກະລຸນາອ່ານລາຍລະອຽດການເກັບກຳຂໍ້ມູນກ່ອນເລີ່ມຕົ້ນ ເພື່ອຄວາມໂປ່ງໃສ ແລະ ຄວາມສະບາຍໃຈຂອງທ່ານ`
- **Collected:** `ຄຳຕອບຄຳຖາມ, ຊ່ວງອາຍຸ, ລະດັບການສຶກສາ, ແຂວງ`
- **Not Collected:** `ຊື່, ເບີໂທ, ອີເມວ — ບໍ່ຕ້ອງສ້າງບັນຊີ`
- **Purpose:** `ສ້າງຜົນສະທ້ອນສ່ວນບຸກຄົນ ແລະ ປັບປຸງລະບົບ`
- **Consent Checkbox:** `ຂ້ອຍເຂົ້າໃຈ ແລະ ຍິນຍອມໃຫ້ເກັບຂໍ້ມູນຕາມທີ່ລະບຸຂ້າງເທິງ`
- **Confirm Button:** `ຢືນຢັນ ແລະ ເລີ່ມຕອບ →`
- **Back Action:** `ກັບຄືນໜ້າຫຼັກ`

### 6.3 Assessment (`/assessment`)
- **Progress Counter:** `ຄຳຖາມ {current}/{total}`
- **Demographics Badge:** `ຂໍ້ມູນພື້ນຖານ`
- **Autosave Indicator:** `ຄຳຕອບຖືກບັນທຶກອັດຕະໂນມັດ`
- **Next Button:** `ໄປຕໍ່ →`
- **Back Button:** `← ກັບຄືນ`
- **Submit Button:** `ສົ່ງຄຳຕອບ ✓`
- **Submitting Text:** `ກຳລັງສົ່ງ...`
- **Multi-select helper:** `(ເລືອກໄດ້ຫຼາຍຂໍ້)`, `(ເລືອກແລ້ວ {count}/{max} ຂໍ້)`
- **Free-text placeholder:** `ພິມຄຳຕອບຂອງທ່ານ (ເຊັ່ນ: ມ.6, ປວສ., ມະຫາວິທະຍາໄລ)...`
- **Other text label:** `ກະລຸນາລະບຸເພີ່ມເຕີມ:` / `ພິມຄຳຕອບຂອງທ່ານທີ່ນີ້...`
- **Incomplete Modal Title:** `ທ່ານຍັງບໍ່ໄດ້ຕອບ {missing} ຂໍ້ — ຈະສົ່ງແບບນັ້ນບໍ?`
- **Incomplete Modal Body:** `ທ່ານສາມາດກັບໄປຕອບເພີ່ມເຕີມເພື່ອຄວາມຄົບຖ້ວນ ຫຼື ສົ່ງຄຳຕອບເທົ່າທີ່ມີເພື່ອໃຫ້ລະບົບປະເມີນຮູບແບບໄດ້`
- **Incomplete Modal Edit:** `ກັບຄືນແກ້`
- **Incomplete Modal Submit:** `ສົ່ງເລີຍ`

### 6.4 Processing (`/processing`)
- **Heading:** `ກຳລັງວິເຄາະຮູບແບບຈາກຄຳຕອບຂອງທ່ານ`
- **Body:** `ຂັ້ນຕອນນີ້ໃຊ້ເວລາບໍ່ດົນ`
- **Calm Notice Header:** `ສຳຫຼວດຮູບແບບຄຳຕອບ`
- **Calm Notice Body:** `ລະບົບກຳລັງຈັດລະບຽບຂໍ້ມູນ ແລະ ເຊື່ອມໂຍງຮູບແບບຄຳຕອບເພື່ອສ້າງພື້ນທີ່ສະທ້ອນຄວາມຄິດ...`

### 6.5 Report (`/report`)
- **Pill Tag:** `ພື້ນທີ່ສະທ້ອນຄວາມຄິດ`
- **Main Header:** `ຜົນສະທ້ອນ — ຈາກຄຳຕອບຂອງທ່ານໃນວັນນີ້`
- **Section 1:** `ຮູບແບບທີ່ພົບຈາກຄຳຕອບ (Response Patterns)`
- **Section 2:** `ເສັ້ນທາງທີ່ສາມາດສຳຫຼວດ (Possible Paths)`
- **Section 2 Subtext:** `ທິດທາງເຫຼົ່ານີ້ເປັນທາງເລືອກໃຫ້ທ່ານສຳຫຼວດຕໍ່ ບໍ່ມີການຈັດອັນດັບ ຫຼື ຄະແນນ`
- **Section 3:** `ປັດໃຈບໍລິບົດ (Context Factors)`
- **Section 4:** `ສິ່ງທີ່ຍັງບໍ່ຊັດເຈນ (Unknowns)`
- **Section 4 Description:** `ນີ້ແມ່ນຂໍ້ມູນທີ່ມີຄ່າ ບໍ່ແມ່ນຈຸດອ່ອນ — ຊ່ວຍໃຫ້ເຫັນສິ່ງທີ່ສາມາດຄົ້ນຫາຕໍ່ໄດ້`
- **Section 5:** `ລອງກ່ອນຕັດສິນໃຈ (Try Before Decide)`
- **Section 5 Description:** `ວິທີລອງປະສົບການຈິງໃນລະດັບນ້ອຍໆ ກ່ອນເລືອກເສັ້ນທາງໃຫຍ່`
- **Section 5 Card 1:** `1. ສົນທະນາ` — `ລອງປຶກສາ ຫຼື ລົມກັບຜູ້ທີ່ກຳລັງເຮັດວຽກໃນສາຍທີ່ທ່ານສົນໃຈ`
- **Section 5 Card 2:** `2. ທົດລອງນ້ອຍໆ` — `ລົງມືເຮັດໂປຣເຈັກສັ້ນໆ 1–2 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍ`
- **Section 5 Card 3:** `3. ສັງເກດຕົວຈິງ` — `ເຂົ້າຮ່ວມກິດຈະກຳ, ເວທີສຳມະນາ ຫຼື ງານອາສາສະໝັກ`
- **Disclaimer:** `ຜົນນີ້ມາຈາກລະບົບທົດລອງ ເປັນພຽງການສະທ້ອນ ບໍ່ແມ່ນຄຳແນະນຳສຸດທ້າຍ ການຕັດສິນໃຈແມ່ນຂອງທ່ານ`
- **Handoff Header:** `ສົ່ງອອກຂໍ້ມູນເພື່ອຖາມ AI ອື່ນ (ທາງເລືອກ)`
- **Handoff Body:** `ທ່ານສາມາດຄັດລອກບົດສະຫຼຸບນີ້ໄປສົນທະນາຕໍ່ກັບ AI ອື່ນ (ເຊັ່ນ ChatGPT, Claude, Gemini) ຫຼື ໃຊ້ປຶກສາກັບອາຈານ ແລະ ຄອບຄົວໄດ້ຢ່າງອິດສະຫຼະ`
- **Copy Markdown Button:** `ຄັດລອກ Markdown` / `✓ ຄັດລອກແລ້ວ!`
- **Download JSON Button:** `ດາວໂຫຼດ JSON` / `ກຳລັງດາວໂຫຼດ...`
- **Feedback Action Button:** `ໃຫ້ຄວາມຄິດເຫັນຕໍ່ລະບົບ →`

### 6.6 Feedback (`/feedback`)
- **Header:** `ສົ່ງຄວາມຄິດເຫັນ`
- **Subtext:** `ບອກຄວາມຮູ້ສຶກ ແລະ ຄວາມຄິດເຫັນຂອງທ່ານກ່ຽວກັບຜົນສະທ້ອນທີ່ໄດ້ຮັບ`
- **Q1 Prompt:** `1. ຜົນນີ້ເຂົ້າກັບທ່ານບໍ? *`
- **Q1 Options:** `ເຂົ້າ`, `ບໍ່ຄ່ອຍເຂົ້າ`, `ຍັງບໍ່ແນ່`
- **Q2 Prompt:** `2. ຈຸດໃດບໍ່ຕົງກັບຕົວຈິງ? (ຂຽນໄດ້ ບໍ່ບັງຄັນ)`
- **Q2 Placeholder:** `ຕົວຢ່າງ: ຮູ້ສຶກວ່າດ້ານຄວາມສົນໃຈບາງຢ່າງຍັງບໍ່ຄ່ອຍຕົງ...`
- **Q3 Prompt:** `3. ຢາກສຳຫຼວດເລື່ອງໃດຕໍ່? (ຂຽນໄດ້ ບໍ່ບັງຄັນ)`
- **Q3 Placeholder:** `ຕົວຢ່າງ: ຢາກຮູ້ວິທີຝຶກທັກສະເທັກໂນໂລຊີ ຫຼື ທຶນການສຶກສາ...`
- **Submit Action:** `ສົ່ງຄວາມຄິດເຫັນ`
- **Thanks Title:** `ຂອບໃຈ — ຄຳຄິດເຫັນຂອງທ່ານຊ່ວຍພັດທະນາລະບົບ`
- **Thanks Body:** `ທຸກຄຳຕອບ ແລະ ຂໍ້ສະເໜີແນະຂອງທ່ານມີຄຸນຄ່າໃນການປັບປຸງລະບົບ PATHAI ໃຫ້ດີຍິ່ງຂຶ້ນ`
- **Home Button:** `ກັບສູ່ໜ້າຫຼັກ`

---

# 7. Design System Extraction

| Design Token Category | Extracted Value / Class | Design System Status |
|---|---|:---:|
| **Canvas Background** | `#faf9f5` (`--bg-canvas`) — Warm organic paper tone | `[DEFINED]` |
| **Surface Background** | `#ffffff` (`--bg-surface`, `bg-white`) | `[DEFINED]` |
| **Primary Text Color** | `#1c1917` (`text-stone-900`, Stone-900) | `[DEFINED]` |
| **Secondary Text Color** | `#57534e` (`text-stone-700` / `text-stone-600`) | `[DEFINED]` |
| **Muted Text Color** | `#78716c` (`text-stone-500` / `text-stone-400`) | `[DEFINED]` |
| **Subtle Border Color** | `#e7e5e4` (`border-stone-200`) | `[DEFINED]` |
| **Active/Selected Border** | `#1c1917` (`border-stone-900`) | `[DEFINED]` |
| **Accent / Safe Color** | `#2d4a3e` (Deep Forest) / `#059669` (Emerald-600) | `[DEFINED]` |
| **Warning / Attention** | `#fef3c7` (`bg-amber-50`) / `#b45309` (`text-amber-800`) | `[DEFINED]` |
| **Typography Family** | `Noto Sans Lao`, sans-serif (`--font-lao`) | `[DEFINED]` |
| **Line Height** | `line-height: 1.75` (Optimized for Lao script vowels/tone marks) | `[DEFINED]` |
| **Letter Spacing** | `letter-spacing: 0.01em` | `[DEFINED]` |
| **Border Radius** | `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full` | `[DEFINED]` |
| **Shadows** | `shadow-xs` (`0 1px 2px rgba(0,0,0,0.05)`), `shadow-sm` | `[DEFINED]` |
| **Animations** | `animate-breathe` (3.5s gentle scale/opacity breathing cycle) | `[DEFINED]` |
| **Icons Library** | Minimal typographic symbols (`→`, `←`, `✓`, `✦`, `!`) — Zero heavy icon packs | `[DEFINED]` |
| **Dark Mode Tokens** | Not configured | `[NOT DEFINED]` |
| **Spacing Scale Variables** | Tailwind CSS default scale (Tailwind 4) | `[DEFINED]` |

---

# 8. UX Improvement Candidates (Non-Destructive Proposals)

> **Important:** These items are purely observational review candidates and are **NOT** to be implemented without explicit owner approval.

### Issue 1: Keyboard Navigation Shortcut on Question Options
- **Current behavior:** Options must be clicked with mouse or tapped on touch screen.
- **Impact:** Power users on desktop cannot press number keys (1–9) to select options quickly.
- **Possible improvement:** Add optional accessible numeric keyboard listeners for options 1–9.
- **Status:** `[PROPOSED]`

### Issue 2: Direct Jump to Unanswered Questions from Incomplete Modal
- **Current behavior:** SubmitConfirm modal returns the user to the current screen; user must manually navigate back.
- **Impact:** If user missed Q3 and is currently on Q28, navigating back requires 25 clicks.
- **Possible improvement:** Provide a list of missing question pills in the modal that jump directly to the target question index.
- **Status:** `[PROPOSED]`

### Issue 3: Copy Markdown Visual Feedback Persistence
- **Current behavior:** "✓ ຄັດລອກແລ້ວ!" reverts back after 2.5 seconds.
- **Impact:** If user looks away, they might re-click.
- **Possible improvement:** Retain a subtle green checkmark badge alongside the copy button.
- **Status:** `[PROPOSED]`

---

# 9. PATHAI UX Compliance Check

| Compliance Criterion | Required Behavior | Implemented Frontend State | Verification Result |
|---|---|---|:---:|
| **Human-First Principle** | Calm, organic, reassuring atmosphere; not cold corporate | Warm `#FAF9F5` canvas, Stone palette, Noto Sans Lao font | **PASS** |
| **User Decides Final Direction** | Platform explicitly states user is sole decision maker | Multiple disclaimers on Landing, Processing, and Report | **PASS** |
| **No Career Verdict** | No output states "You are a X" or assigns single career | Paths presented as unranked exploration directions | **PASS** |
| **No Ranking or Best Fit** | No sorting by percentage match or "Top 3 match" | Alphabetical / deterministic C1–C7 order; no percentages | **PASS** |
| **No Prediction Language** | No future prophecy or forecasting statements | Wording uses descriptive "ຄຳຕອບຂອງທ່ານສະທ້ອນ..." | **PASS** |
| **Exploration Mindset** | Unknowns framed as positive opportunities | Explicit badge: "ນີ້ແມ່ນຂໍ້ມູນທີ່ມີຄ່າ ບໍ່ແມ່ນຈຸດອ່ອນ" | **PASS** |

---

# 10. Lao Frontend Language & Terminology Extraction

## 10.1 User Interface Text Mapping

| Location | Component / Element | Current Implemented Lao Text | Usage Purpose |
|---|---|---|---|
| `/` | Pill Tag | `ເຄື່ອງມືສຳຫຼວດທິດທາງສ່ວນບຸກຄົນ` | Subtitle badge indicating personal exploration tool |
| `/` | Subtitle | `ພື້ນທີ່ຊ່ວຍໃຫ້ທ່ານເຂົ້າໃຈຕົນເອງ ແລະ ຄິດຫາເສັ້ນທາງການຮຽນ ຫຼື ການເຮັດວຽກ` | Core mission value proposition |
| `/` | Banner Header | `ບໍ່ແມ່ນການທຳນາຍ ບໍ່ມີຄະແນນ ບໍ່ຕັດສິນແທນທ່ານ` | Essential non-judgmental reassurance |
| `/` | Banner Body | `ລະບົບນີ້ຖືກອອກແບບມາເພື່ອຊ່ວຍສະທ້ອນຄວາມຄິດ ບໍ່ແມ່ນການຕັດສິນ ທ່ານເປັນຜູ້ເລືອກ ແລະ ຕັດສິນໃຈເສັ້ນທາງຂອງຕົນເອງສະເໝີ` | Reassurance of user autonomy |
| `/` | Step 1 | `① ຕອບຄຳຖາມ 28 ຂໍ້ (ປະມານ 15–20 ນາທີ)` | Step 1 expectation setting |
| `/` | Step 2 | `② ລະບົບວິເຄາະຮູບແບບຈາກຄຳຕອບ` | Step 2 pattern extraction explanation |
| `/` | Step 3 | `③ ເຫັນຜົນສະທ້ອນ ແລະ ທາງເລືອກທີ່ສາມາດສຳຫຼວດ` | Step 3 outcome expectation |
| `/` | CTA Button | `ເລີ່ມຕົ້ນ` | Main action entry |
| `/` | Privacy Tag | `ບໍ່ຕ້ອງລົງທະບຽນ · ບໍ່ເກັບຂໍ້ມູນສ່ວນຕົວ` | Anonymity reassurance |
| `/introduction` | Header | `ກ່ອນເລີ່ມ — ຂໍ້ມູນຂອງທ່ານ` | Transparency section title |
| `/introduction` | Notice | `ກະລຸນາອ່ານລາຍລະອຽດການເກັບກຳຂໍ້ມູນກ່ອນເລີ່ມຕົ້ນ ເພື່ອຄວາມໂປ່ງໃສ ແລະ ຄວາມສະບາຍໃຈຂອງທ່ານ` | Friendly transparency instruction |
| `/introduction` | Card 1 Header | `ສິ່ງທີ່ລະບົບເກັບກຳ` | Data collected header |
| `/introduction` | Card 1 Body | `ຄຳຕອບຄຳຖາມ, ຊ່ວງອາຍຸ, ລະດັບການສຶກສາ, ແຂວງ` | Data collected list |
| `/introduction` | Card 2 Header | `ສິ່ງທີ່ບໍ່ເກັບກຳ` | Data NOT collected header |
| `/introduction` | Card 2 Body | `ຊື່, ເບີໂທ, ອີເມວ — ບໍ່ຕ້ອງສ້າງບັນຊີ` | Anonymity guarantee |
| `/introduction` | Purpose Label | `ຈຸດປະສົງການນຳໃຊ້` | Purpose header |
| `/introduction` | Purpose Body | `ສ້າງຜົນສະທ້ອນສ່ວນບຸກຄົນ ແລະ ປັບປຸງລະບົບ` | Transparent statement of data use |
| `/introduction` | Checkbox | `ຂ້ອຍເຂົ້າໃຈ ແລະ ຍິນຍອມໃຫ້ເກັບຂໍ້ມູນຕາມທີ່ລະບຸຂ້າງເທິງ` | User consent statement |
| `/introduction` | Submit CTA | `ຢືນຢັນ ແລະ ເລີ່ມຕອບ` | Action button to begin assessment |
| `/assessment` | Progress Badge | `ຄຳຖາມ {current}/{total}` / `ຂໍ້ມູນພື້ນຖານ` | Section & question index indicator |
| `/assessment` | Autosave Tag | `ຄຳຕອບຖືກບັນທຶກອັດຕະໂນມັດ` | Reassuring save status indicator |
| `/assessment` | Navigation | `ໄປຕໍ່` / `ກັບຄືນ` / `ສົ່ງຄຳຕອບ` | Step progression controls |
| `/assessment` | Missing Modal | `ທ່ານຍັງບໍ່ໄດ້ຕອບ {missing} ຂໍ້ — ຈະສົ່ງແບບນັ້ນບໍ?` | Incomplete answer alert |
| `/assessment` | Missing Edit | `ກັບຄືນແກ້` / `ສົ່ງເລີຍ` | Confirmation modal actions |
| `/processing` | Header | `ກຳລັງວິເຄາະຮູບແບບຈາກຄຳຕອບຂອງທ່ານ` | Active calculation notice |
| `/processing` | Subtext | `ຂັ້ນຕອນນີ້ໃຊ້ເວລາບໍ່ດົນ` | Waiting duration expectation |
| `/processing` | Card Notice | `ລະບົບກຳລັງຈັດລະບຽບຂໍ້ມູນ ແລະ ເຊື່ອມໂຍງຮູບແບບຄຳຕອບເພື່ອສ້າງພື້ນທີ່ສະທ້ອນຄວາມຄິດ...` | Thoughtful contemplative waiting copy |
| `/report` | Title | `ຜົນສະທ້ອນ — ຈາກຄຳຕອບຂອງທ່ານໃນວັນນີ້` | Report header emphasizing present moment |
| `/report` | Section 1 | `ຮູບແບບທີ່ພົບຈາກຄຳຕອບ (Response Patterns)` | Pattern reflection section title |
| `/report` | Section 2 | `ເສັ້ນທາງທີ່ສາມາດສຳຫຼວດ (Possible Paths)` | Exploratory directions title |
| `/report` | Section 2 Sub | `ທິດທາງເຫຼົ່ານີ້ເປັນທາງເລືອກໃຫ້ທ່ານສຳຫຼວດຕໍ່ ບໍ່ມີການຈັດອັນດັບ ຫຼື ຄະແນນ` | Reassurance against ranking |
| `/report` | Section 3 | `ປັດໃຈບໍລິບົດ (Context Factors)` | Demographics & constraints header |
| `/report` | Section 4 | `ສິ່ງທີ່ຍັງບໍ່ຊັດເຈນ (Unknowns)` | Exploration opportunities title |
| `/report` | Section 4 Note | `ນີ້ແມ່ນຂໍ້ມູນທີ່ມີຄ່າ ບໍ່ແມ່ນຈຸດອ່ອນ — ຊ່ວຍໃຫ້ເຫັນສິ່ງທີ່ສາມາດຄົ້ນຫາຕໍ່ໄດ້` | Reframing unknowns as fertile ground |
| `/report` | Section 5 | `ລອງກ່ອນຕັດສິນໃຈ (Try Before Decide)` | Experiential discovery section title |
| `/report` | Disclaimer | `ຜົນນີ້ມາຈາກລະບົບທົດລອງ ເປັນພຽງການສະທ້ອນ ບໍ່ແມ່ນຄຳແນະນຳສຸດທ້າຍ ການຕັດສິນໃຈແມ່ນຂອງທ່ານ` | Critical non-verdict disclaimer |
| `/report` | Export Header | `ສົ່ງອອກຂໍ້ມູນເພື່ອຖາມ AI ອື່ນ (ທາງເລືອກ)` | Handoff to external conversational AI |
| `/report` | Copy Action | `ຄັດລອກ Markdown` / `ດາວໂຫຼດ JSON` | Export action buttons |
| `/report` | Feedback Action | `ໃຫ້ຄວາມຄິດເຫັນຕໍ່ລະບົບ` | Route to feedback page |
| `/feedback` | Header | `ສົ່ງຄວາມຄິດເຫັນ` | Feedback title |
| `/feedback` | Q1 Label | `1. ຜົນນີ້ເຂົ້າກັບທ່ານບໍ?` | Agreement question |
| `/feedback` | Q1 Options | `ເຂົ້າ` / `ບໍ່ຄ່ອຍເຂົ້າ` / `ຍັງບໍ່ແນ່` | 3-scale agreement options |
| `/feedback` | Q2 Label | `2. ຈຸດໃດບໍ່ຕົງກັບຕົວຈິງ? (ຂຽນໄດ້ ບໍ່ບັງຄັນ)` | Qualitative discrepancy inquiry |
| `/feedback` | Q3 Label | `3. ຢາກສຳຫຼວດເລື່ອງໃດຕໍ່? (ຂຽນໄດ້ ບໍ່ບັງຄັນ)` | Next interest inquiry |
| `/feedback` | Thanks Header | `ຂອບໃຈ — ຄຳຄິດເຫັນຂອງທ່ານຊ່ວຍພັດທະນາລະບົບ` | Submission confirmation |
| `/feedback` | Home Button | `ກັບສູ່ໜ້າຫຼັກ` | Return to root landing action |

---

## 10.2 PATHAI Terminology Inventory

| English Concept | Current Implemented Lao Term | Where Used | Context & Pedagogical Meaning | Review Needed? |
|---|---|---|---|:---:|
| **Exploration** | ການສຳຫຼວດ / ສຳຫຼວດ | Landing, Assessment, Report | Discovering possibilities without commitment pressure | `NO` (Clear & Natural) |
| **Signal** | ສັນຍານ / ຈຸດເຊື່ອມໂຍງ | Landing, DS specs | Input clues indicating interests/strengths | `NO` |
| **Reflection** | ການສະທ້ອນ / ຜົນສະທ້ອນ / ພື້ນທີ່ສະທ້ອນຄວາມຄິດ | Header, Landing, Report | Mirroring self-reported choices without judgment | `NO` (Core Concept) |
| **Unknowns** | ສິ່ງທີ່ຍັງບໍ່ຊັດເຈນ / ສິ່ງທີ່ຍັງເປີດໄວ້ສຳຫຼວດ | Report Section 4 | Areas not yet decided or skipped (fertile ground) | `NO` (Positive framing) |
| **Tension** | ຈຸດທີ່ໜ້າສົນໃຈສຳລັບການທົບທວນຕົນເອງ | Report / Rules | Meaningful divergences between answers | `NO` (Non-punitive) |
| **Experiment** | ລອງກ່ອນຕັດສິນໃຈ (Try Before Decide) | Report Section 5 | Low-stakes real-world discovery actions | `NO` (Action-oriented) |
| **Direction / Path** | ທິດທາງ / ເສັ້ນທາງທີ່ສາມາດສຳຫຼວດ | Report Section 2 | Unranked broad occupational areas | `NO` (No ranking) |
| **Profile** | ຮູບແບບຄຳຕອບ (Response Patterns) | Report Section 1 | Descriptive summary of choices | `NO` |
| **Evidence** | ຫຼັກຖານ / ຄຳຕອບຂອງທ່ານ | Report, Summary | Root source question answers | `NO` |
| **Journey** | ເສັ້ນທາງການຮຽນ-ການເຮັດວຽກ | Landing, Header, Copy | Multi-year exploratory process | `NO` |

---

## 10.3 User-Facing Tone Analysis

- **Natural Lao Flow:** The text uses standard colloquial-formal spoken Lao (*ພາສາປາກທີ່ສຸພາບ*), avoiding overly archaic Thai-loan words or mechanical machine-translation structures.
- **Appropriateness for Age 15+:** Stems and UI prompts avoid dense academic jargon (e.g. using `"ລອງກ່ອນຕັດສິນໃຈ"` instead of `"ມາດຕະການທົດສອບພຶດຕິກຳຕົວຈິງ"`).
- **Non-Exam Atmosphere:** Buttons use friendly verbs like `"ໄປຕໍ່ →"` and `"ກັບຄືນແກ້"` rather than authoritative test terms like `"ຢືນຢັນຄຳຕອບສຸດທ້າຍ"` or `"ກວດຄະແນນ"`.
- **Preservation of User Autonomy:** Every summary is introduced with `"ຄຳຕອບຂອງທ່ານສະທ້ອນ..."` (Your answers reflect...) rather than `"ທ່ານເປັນຄົນ..."` (You are a...).

---

## 10.4 Language Consistency Check

- **Navigation Consistency:** Standardized to `"ໄປຕໍ່"` (Next) and `"ກັບຄືນ"` (Back) across all wizard screens.
- **Tone Consistency:** Polite neutral particle level maintained without awkward shifts between overly formal and overly casual slang.
- **Technical Terms with Inline Context:** When technical terms are introduced (e.g. `Informational Interview`, `Micro-Project`), they are paired with natural Lao explanations (`"ສົນທະນາກັບຜູ້ມີປະສົບການ"`, `"ທົດລອງເຮັດໂປຣເຈັກນ້ອຍໆ"`).

---

## 10.5 Terminology Safety Check (Forbidden Wording Audit)

| Forbidden Evaluative Concept | Audit Scan in Lao UI Code | Scan Result |
|---|---|:---:|
| *"You are suitable for..."* (`ທ່ານເໝາະສົມກັບ...`) | Checked across all components & copy | **NONE FOUND (PASS)** |
| *"Your future career is..."* (`ອາຊີບໃນອະນາຄົດຂອງທ່ານແມ່ນ...`) | Checked across all components & copy | **NONE FOUND (PASS)** |
| *"You should choose..."* (`ທ່ານຄວນເລືອກ...`) | Checked across all components & copy | **NONE FOUND (PASS)** |
| *"Best career / Top match"* (`ອາຊີບທີ່ດີທີ່ສຸດ / ເໝາະສົມອັນດັບ 1`) | Checked across all components & copy | **NONE FOUND (PASS)** |
| *"High chance of success"* (`ມີໂອກາດປະສົບຜົນສຳເລັດສູງ`) | Checked across all components & copy | **NONE FOUND (PASS)** |

**Safety Audit Verdict:** **`PASS`** — The frontend contains zero predictive, deterministic career assignment or ranking language.
