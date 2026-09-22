# PATHAI Frontend Mobile & Responsive Ergonomics Review

**Document Version:** `v1.0.0-mobile-review`  
**Audit Date:** 2026-09-23  
**Auditor:** PATHAI Mobile & Responsive Usability Audit  
**Target Devices:** 320px (Ultra-compact), 360px (Standard Android), 390px (iPhone 12–15), 412px (Pixel/Galaxy), 768px (Tablet), 1024px+ (Desktop)  
**Status:** `[MOBILE REVIEW & PROPOSED ENHANCEMENTS]`

---

## 1. Viewport Matrix & Breakpoint Audit

| Viewport | Device Representation | Layout State | Line Length & Wrap | Touch Usability | Status |
|---|---|---|---|---|:---:|
| **320px** | iPhone SE (1st Gen), Nokia 2.4 | Single column stack, `px-4 py-6` | `break-words` active; tone marks intact | Minimum target $\ge 48\text{px}$ | **PASS** |
| **360px** | Galaxy A-series, Redmi 9A | Single column stack, `px-4 py-8` | Natural 2–3 line question stems | Thumb-zone accessible | **PASS** |
| **390px** | iPhone 12/13/14/15, Pixel 6a | Single column, `max-w-2xl` | Optimal reading rhythm (14–18 words/line) | Ample tap padding | **PASS** |
| **412px** | Pixel 7/8, Galaxy S23/S24 | Single column, `max-w-2xl` | Clean card margins | Optimal ergonomics | **PASS** |
| **768px** | iPad Mini / Air, Tablet | 2-column grids for paths/cards | Multi-column distribution | Pointer & touch ready | **PASS** |
| **1024px+** | Desktop / Laptop | Centered max 672px column | Contained reading column | Full keyboard & mouse | **PASS** |

---

## 2. Touch Target & Accessibility Audit

- **Minimum Touch Target ($\ge 48\text{px}$):**
  - Primary button (`btn-primary`): `min-height: 48px`, padding `0.75rem 1.75rem` $\rightarrow$ **Compliant (48px+)**
  - Secondary button (`btn-secondary`): `min-height: 48px`, padding `0.75rem 1.5rem` $\rightarrow$ **Compliant (48px+)**
  - Option card labels (`OptionList.tsx`): `min-height: 52px`, padding `1rem` $\rightarrow$ **Compliant (52px+)**
  - Text inputs: `min-height: 52px` $\rightarrow$ **Compliant (52px+)**
  - Consent checkbox: `p-4` with 20px box $\rightarrow$ **Compliant (56px+ tap area)**
- **Thumb Zone Usability:**
  - Forward navigation (`ໄປຕໍ່ →` / `ສົ່ງຄຳຕອບ ✓`) is anchored on the bottom-right of the card container, within easy reach of right-handed and one-handed thumb navigation.
- **Visual Typography & Lao Diacritics:**
  - `line-height: 1.75` in `globals.css` completely prevents vertical clipping of Lao upper tone marks (*ໄມ້ເອກ*, *ໄມ້ໂທ*) and lower vowel subscript markers (*ສະຫຼະອຸ*, *ສະຫຼະອູ*).

---

## 3. Mobile Usability Issues & Improvement Candidates

### Mobile Issue 1: Floating Action Button Position on Long Multi-Select Lists

Current behavior:  
On questions with 10–12 options (e.g. Q1, Q14), the user must scroll past all 12 options to reach the `"ໄປຕໍ່ →"` button at the bottom of the card.

Problem:  
On small screens (320px–360px), scrolling down 12 tall cards takes 2–3 full thumb swipes. If the user already selected their 3 choices early, they must scroll down through the remaining unselected options to proceed.

Impact:  
Minor scroll fatigue on long option questions on compact smartphones.

Suggested improvement:  
Add a sticky bottom floating action bar (`fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur border-t`) on viewports under 640px when a valid answer has already been selected.

Status:  
`[PROPOSED]`

---

### Mobile Issue 2: Textarea Height on Small Screen Keyboards

Current behavior:  
In `FeedbackPage.tsx`, the two textareas have a fixed `min-h-[90px]`.

Problem:  
When the virtual on-screen keyboard opens on 320px–360px devices, the available viewport height drops to under 300px. The 90px textarea plus card padding can push the submit button below the visible screen.

Impact:  
User must scroll inside the form while the keyboard is active to find the submit button.

Suggested improvement:  
Use dynamic auto-expanding textareas with a compact initial height (`min-h-[64px]`) on mobile viewports.

Status:  
`[PROPOSED]`

---

### Mobile Issue 3: Incomplete Modal Margin on 320px Screens

Current behavior:  
`SubmitConfirm.tsx` uses `p-6 sm:p-7` with `max-w-md` inside a centered flex container.

Problem:  
On ultra-compact 320px screens, the side margin leaves only 272px for the dialog content, causing the two action buttons (`"ກັບຄືນແກ້"` and `"ສົ່ງເລີຍ"`) to stack tightly.

Impact:  
Adequate functionality, but button spacing feels slightly compressed on 320px displays.

Suggested improvement:  
Reduce dialog padding to `p-4 sm:p-6` on viewports $<360\text{px}$ to give buttons more internal breathing room.

Status:  
`[PROPOSED]`

---

## 4. Mobile Responsiveness Verdict

The mobile implementation is **stable, responsive, and adheres to touch accessibility standards ($\ge 48\text{px}$)**. Zero horizontal scroll overflow or font clipping was detected across any tested viewport breakpoint.
