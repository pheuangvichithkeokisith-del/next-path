# PATHAI Frontend Lao Language & Terminology Review

**Document Version:** `v1.0.0-lao-review`  
**Audit Date:** 2026-09-23  
**Auditor:** PATHAI Lao Linguistic & Pedagogical Review  
**Target Audience:** Lao Youth (Aged 15–20+) & Guidance Mentors  
**Status:** `[LINGUISTIC REVIEW & PROPOSED ENHANCEMENTS]`

---

## 1. Linguistic Philosophy & Tone Analysis

The PATHAI Lao user interface adopts a **contemporary, respectful, and natural spoken Lao** tone (*ພາສາປາກທີ່ສຸພາບ ແລະ ເຂົ້າໃຈງ່າຍ*).

### Core Linguistic Guidelines
- **Youth-Centric Comprehensibility:** Phrasing avoids dense academic jargon, archaic Thai loan-structures, and bureaucratic vocabulary.
- **Supportive & Non-Evaluative:** Uses supportive phrasing (`"ພື້ນທີ່ສະທ້ອນຄວາມຄິດ"`, `"ລອງກ່ອນຕັດສິນໃຈ"`) rather than testing vocabulary (`"ການປະເມີນຜົນ"`, `"ການທົດສອບ"`).
- **Preservation of Autonomy:** Every summary uses descriptive stems (`"ຄຳຕອບຂອງທ່ານສະທ້ອນ..."`) instead of diagnostic claims (`"ທ່ານເປັນຄົນ..."`).

---

## 2. Terminology Consistency Matrix

| English Product Concept | Implemented Lao Term | Occurrence Locations | Semantic Consistency |
|---|---|---|:---:|
| **Self-Reflection Space** | ພື້ນທີ່ສະທ້ອນຄວາມຄິດ | Header, Landing, Processing, Report | **100% Consistent** |
| **Exploration Directions** | ເສັ້ນທາງທີ່ສາມາດສຳຫຼວດ / ທິດທາງ | Landing, Report Section 2 | **100% Consistent** |
| **Response Patterns** | ຮູບແບບທີ່ພົບຈາກຄຳຕອບ | Report Section 1, Processing | **100% Consistent** |
| **Unknowns (Fertile Gaps)** | ສິ່ງທີ່ຍັງບໍ່ຊັດເຈນ / ຍັງເປີດໄວ້ສຳຫຼວດ | Report Section 4 | **100% Consistent** |
| **Try Before Decide** | ລອງກ່ອນຕັດສິນໃຈ | Report Section 5 | **100% Consistent** |
| **Autosave** | ຄຳຕອບຖືກບັນທຶກອັດຕະໂນມັດ | Assessment Header | **100% Consistent** |
| **Next / Back Actions** | ໄປຕໍ່ / ກັບຄືນ | Wizard Navigation | **100% Consistent** |

---

## 3. Terminology Safety Audit (Forbidden Phrasing Check)

The codebase was audited for evaluative, deterministic, or high-pressure terminology:

| Evaluative Concept | Audit Scan in Lao UI | Status |
|---|---|:---:|
| "You are suitable for..." (`ທ່ານເໝາະສົມກັບ...`) | Checked across all components & copy | **NONE (PASS)** |
| "Your future career is..." (`ອາຊີບໃນອະນາຄົດຂອງທ່ານແມ່ນ...`) | Checked across all components & copy | **NONE (PASS)** |
| "You must choose..." (`ທ່ານຕ້ອງເລືອກ...`) | Checked across all components & copy | **NONE (PASS)** |
| "Best career / Top match" (`ອາຊີບທີ່ດີທີ່ສຸດ / ອັນດັບ 1`) | Checked across all components & copy | **NONE (PASS)** |
| "High chance of success" (`ມີໂອກາດສຳເລັດສູງ`) | Checked across all components & copy | **NONE (PASS)** |

---

## 4. Linguistic Issues & Improvement Candidates

### Language Issue 1: Refinement of "Submit Anyway" Confirmation Button

Current behavior:  
In `SubmitConfirm.tsx`, the primary button for submitting an incomplete form is labeled `"ສົ່ງເລີຍ"` (Submit anyway), paired with `"ກັບຄືນແກ້"` (Return to edit).

Problem:  
`"ສົ່ງເລີຍ"` can sound slightly colloquial or abrupt in a thoughtful self-reflection tool.

Impact:  
Mild dissonance with the otherwise warm and deliberate tone of the interface.

Suggested improvement:  
Adjust the button label to `"ຢືນຢັນສົ່ງຕາມນີ້"` or `"ສົ່ງຄຳຕອບເທົ່າທີ່ມີ"` to emphasize user agency and conscious decision-making.

Status:  
`[PROPOSED]`

---

### Language Issue 2: Clarification of Context Factors Heading in Report

Current behavior:  
Report Section 3 is titled `"ປັດໃຈບໍລິບົດ (Context Factors)"` and displays Age, Province, and Constraints.

Problem:  
The word `"ບໍລິບົດ"` (Context) is borrowed from academic/formal Thai-Lao linguistics and is less frequently used by 15–17-year-old secondary school students in rural provinces.

Impact:  
Slight comprehension barrier for younger students who may not immediately grasp what "ບໍລິບົດ" means.

Suggested improvement:  
Add a natural Lao subtitle: `"ຂໍ້ມູນສະພາບແວດລ້ອມ ແລະ ເງື່ອນໄຂຕົວຈິງຂອງທ່ານ"` or adjust title to `"ປັດໃຈແວດລ້ອມຕົວຈິງ (Context Factors)"`.

Status:  
`[PROPOSED]`

---

### Language Issue 3: Micro-Project Card Subtext Lao Phrasing

Current behavior:  
In Report Section 5 (Try Before Decide), Card 2 states: `"ລົງມືເຮັດໂປຣເຈັກສັ້ນໆ 1–2 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍ"`.

Problem:  
The word `"ໂປຣເຈັກ"` (Project) and `"ຄອສ"` (Course) are English loanwords that work well for urban students but might benefit from clearer Lao descriptors.

Impact:  
Minor cognitive gap for non-tech-oriented students exploring craftsmanship or agriculture.

Suggested improvement:  
Expand description to: `"ລົງມືເຮັດໂຄງການນ້ອຍໆ 1–2 ອາທິດ ຫຼື ຮຽນຫຼັກສູດສັ້ນອອນລາຍ (Micro-Project / Short Course)"`.

Status:  
`[PROPOSED]`

---

### Language Issue 4: Empty Unknowns State Wording

Current behavior:  
When all questions are answered without explicit "not sure" selections, the Unknowns section displays: `"ບໍ່ມີຂໍ້ທີ່ລະບຸວ່າຍັງບໍ່ຊັດເຈນ"`.

Problem:  
Negative grammatical construction (`"ບໍ່ມີ..."`) can feel slightly clinical or abrupt.

Impact:  
Missed opportunity to celebrate clarity and completeness.

Suggested improvement:  
Rephrase constructively: `"ຄຳຕອບຂອງທ່ານໃນມື້ນີ້ມີຄວາມຊັດເຈນຄົບຖ້ວນທຸກດ້ານ ພ້ອມສຳລັບການທົດລອງຕົວຈິງ"`.

Status:  
`[PROPOSED]`

---

## 5. Summary Verdict

The Lao copy is **highly compliant with PATHAI's non-judgmental principles**. The proposed adjustments above represent minor pedagogical polish rather than critical defects.
