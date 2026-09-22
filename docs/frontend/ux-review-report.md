# PATHAI Frontend UX & Interaction Review Report

**Document Version:** `v1.0.0-ux-review`  
**Audit Date:** 2026-09-23  
**Auditor:** PATHAI UX/UI Design & Interaction Review  
**Status:** `[REVIEW & PROPOSED ENHANCEMENTS]`

---

## 1. Executive UX Summary

The PATHAI frontend successfully achieves a **calm, non-evaluative, and human-centered user experience**. It cleanly diverges from traditional "career tests" or "exam rooms" by adopting a warm canvas palette, clear plain-language Lao phrasing, and transparent data disclosure.

### Core UX Strengths
- **Non-Judgmental Atmosphere:** Warm background (`#FAF9F5`), Stone typography, zero intimidating scorecards, and zero countdown timers.
- **Zero Account Friction:** Fully anonymous workflow requiring no registration, emails, or phone numbers.
- **Instant Autosave:** Every selection is immediately cached to `localStorage` and sent asynchronously to the backend.
- **Graceful Offline Fallback:** If the backend connection drops, the UI does not freeze; local drafts and client-side transitions ensure continuity.

---

## 2. In-Depth UX Issues & Improvement Candidates

### UX Issue 1: Missing Direct Navigation to Skipped Questions in Incomplete Modal

Current behavior:  
When a user clicks "ສົ່ງຄຳຕອບ" with missing questions, the `SubmitConfirm` modal alerts them of the missing count and offers two buttons: "ກັບຄືນແກ້" (Edit) and "ສົ່ງເລີຍ" (Submit anyway). Clicking "ກັບຄືນແກ້" merely dismisses the modal and leaves the user on the current question.

Problem:  
If a user skipped Question 4 and is currently on Question 28, clicking "ກັບຄືນແກ້" forces the user to click the "← ກັບຄືນ" button 24 consecutive times to locate Question 4.

Impact:  
High cognitive friction and navigation fatigue for users who intentionally or accidentally skipped earlier items.

Suggested improvement:  
Display clickable badge pills inside the `SubmitConfirm` modal listing the exact unanswered question IDs (e.g., `Q4`, `Q12`). Clicking a badge should jump the wizard directly to that question index.

Status:  
`[PROPOSED]`

---

### UX Issue 2: Option List Selection Constraint Clarity

Current behavior:  
In multi-choice questions with a `max_select` limit (e.g. Q1 max 3 choices, Q4 max 2 choices), once the user reaches the maximum, other unselected options become dimmed (`opacity-45`) with `cursor-not-allowed`.

Problem:  
Users occasionally attempt to tap a new option expecting it to replace their oldest selection, but nothing happens because the limit is strictly locked until an existing option is manually deselected.

Impact:  
Mild confusion or perceived UI unresponsiveness among mobile users unfamiliar with strict multi-select ceilings.

Suggested improvement:  
Add a subtle transient helper tooltip or pulse animation on the selected items when an unselected option is tapped at maximum capacity, with text such as `"ແຕະຍົກເລີກຂໍ້ເກົ່າກ່ອນເລືອກຂໍ້ໃໝ່"`.

Status:  
`[PROPOSED]`

---

### UX Issue 3: Copy Markdown Feedback Persistence

Current behavior:  
Clicking "ຄັດລອກ Markdown" in the export handoff section switches the button text to `"✓ ຄັດລອກແລ້ວ!"` and reverts back to `"ຄັດລອກ Markdown"` after 2500ms.

Problem:  
If the user switches tabs or glances away during the 2.5-second window, they may be unsure whether the clipboard write succeeded and may re-click redundantly.

Impact:  
Minor uncertainty regarding export action confirmation.

Suggested improvement:  
Persist a subtle green status chip `"ຄັດລອກລ່າສຸດແລ້ວ"` next to the button that remains visible until the user navigates away.

Status:  
`[PROPOSED]`

---

### UX Issue 4: Visual Distinction Between Demographics and Assessment Questions

Current behavior:  
Demographic items (D1–D3) and assessment questions (Q1–Q28) share the identical card layout (`card-calm`), with only a small badge in the `ProgressTracker` indicating `"ຂໍ້ມູນພື້ນຖານ"` vs `"ຄຳຖາມ X/28"`.

Problem:  
Some users do not realize they have transitioned from background context (Age, Education, Province) into the core self-exploration section.

Impact:  
Minor context ambiguity during the first 3 steps of the wizard.

Suggested improvement:  
Provide a brief, encouraging section interstitial or a distinct category pill when transitioning from D3 to Q1 (e.g., `"ເລີ່ມຕົ້ນໝວດ: ຄວາມສົນໃຈ ແລະ ກິດຈະກຳ"`).

Status:  
`[PROPOSED]`

---

### UX Issue 5: Standalone Single-Choice Option Hover & Focus State

Current behavior:  
Radio circles inside single-choice options use a subtle border accent (`border-stone-300`).

Problem:  
On low-contrast or low-brightness mobile screens in outdoor settings, the distinction between unselected radio circles and card borders can be subtle.

Impact:  
Reduced visual accessibility for visually impaired users or users in bright daylight environments.

Suggested improvement:  
Increase the border contrast of unselected radio indicators to `#78716c` (Stone-500) and enhance the active ring highlight on `:focus-visible`.

Status:  
`[PROPOSED]`

---

## 3. UX Compliance Checklist Summary

| UX Principle | Implementation Status | Audit Result |
|---|---|:---:|
| **Zero Exam Atmosphere** | Calm cards, natural Lao phrasing, no time pressure | **PASS** |
| **No Automated Verdicts** | Report presents unranked paths as exploration directions | **PASS** |
| **Clear Data Transparency** | `/introduction` clearly states what is and isn't collected | **PASS** |
| **Constructive Unknowns** | Unanswered and unsure choices framed as valuable opportunities | **PASS** |
| **Export Freedom** | One-click Markdown copy and JSON download for external AI | **PASS** |
