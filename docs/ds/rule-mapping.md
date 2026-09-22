# PATHAI DS Specification: Deterministic Rule Mapping

**Document Status:** `[PROPOSED]`  
**Engine Implementation:** `backend/app/ds/rules.py`  
**Execution Type:** Deterministic / Pure Function (Zero ML / Zero Randomness)

---

## 1. Overview & Principle

The Rule Mapping Specification defines the exact logical mappings from self-reported question options to:
1. **Descriptive Response Patterns (`DSPattern`)**
2. **Preserved Cognitive Tensions (`DSTension`)**

All rules are deterministic, fully traceable to `source_question_ids`, and strictly avoid scoring, ranking, probability assignments, or predictive assertions.

> **Status Notice:** All rules in this document are currently marked as `[PROPOSED]` baseline rules awaiting domain validation.

---

## 2. Pattern Extraction Mappings

### 2.1 Section: Interests (Q1–Q4)

| Pattern ID | Pattern Label (Lao) | Trigger Option Codes | Source Questions |
|---|---|---|---|
| `PAT-INT-TECH` | ຄວາມສົນໃຈດ້ານເທັກໂນໂລຊີ, ຄອມພິວເຕີ ແລະ ການສ້າງສັນຜົນງານດິຈິຕອນ | `Q1-O2`, `Q2-O1`, `Q3-O3`, `Q4-O1` | Any from Q1, Q2, Q3, Q4 |
| `PAT-INT-ANALYSIS` | ຄວາມສົນໃຈດ້ານການຄິດວິເຄາະ, ວິທະຍາສາດ ແລະ ການແກ້ໄຂບັນຫາ | `Q1-O3`, `Q2-O2`, `Q3-O1`, `Q4-O2` | Any from Q1, Q2, Q3, Q4 |
| `PAT-INT-CREATIVE` | ຄວາມສົນໃຈດ້ານສິລະປະ, ການອອກແບບ ແລະ ງານສ້າງສັນ | `Q1-O1`, `Q1-O9`, `Q2-O4`, `Q3-O2`, `Q4-O4` | Any from Q1, Q2, Q3, Q4 |
| `PAT-INT-PEOPLE` | ຄວາມສົນໃຈດ້ານການສື່ສານ, ການເຮັດວຽກກັບຄົນ ແລະ ການຊ່ວຍເຫຼືອສັງຄົມ | `Q1-O5`, `Q1-O6`, `Q2-O3`, `Q2-O6`, `Q2-O9`, `Q3-O5`, `Q3-O6`, `Q4-O5` | Any from Q1, Q2, Q3, Q4 |
| `PAT-INT-BUSINESS` | ຄວາມສົນໃຈດ້ານທຸລະກິດ, ການຈັດການ ແລະ ການວາງແຜນ | `Q1-O10`, `Q2-O5`, `Q3-O9`, `Q4-O3` | Any from Q1, Q2, Q3, Q4 |
| `PAT-INT-PRACTICAL` | ຄວາມສົນໃຈດ້ານງານປະຕິບັດຈິງ, ງານຊ່າງ ຫຼື ທຳມະຊາດ | `Q1-O7`, `Q1-O8`, `Q2-O7`, `Q3-O7`, `Q4-O6` | Any from Q1, Q2, Q3, Q4 |

---

### 2.2 Section: Values (Q8–Q9)

| Pattern ID | Pattern Label (Lao) | Trigger Option Codes | Source Questions |
|---|---|---|---|
| `PAT-VAL-MASTERY` | ໃຫ້ຄຸນຄ່າກັບຄວາມຊ່ຽວຊານ ແລະ ການພັດທະນາຕົນເອງຈົນເກັ່ງ | `Q8-O5`, `Q9-O1` | Q8, Q9 |
| `PAT-VAL-INNOVATION` | ໃຫ້ຄຸນຄ່າກັບການສ້າງສິ່ງໃໝ່ໆ ແລະ ຄວາມທ້າທາຍ | `Q8-O1`, `Q8-O4`, `Q9-O2` | Q8, Q9 |
| `PAT-VAL-IMPACT` | ໃຫ້ຄຸນຄ່າກັບການຊ່ວຍເຫຼືອຜູ້ອື່ນ ແລະ ສ້າງປະໂຫຍດໃຫ້ສັງຄົມ | `Q8-O3`, `Q9-O3` | Q8, Q9 |
| `PAT-VAL-STABILITY` | ໃຫ້ຄຸນຄ່າກັບຄວາມໝັ້ນຄົງ ແລະ ຄວາມສຳເລັດໃນໜ້າທີ່ການງານ | `Q8-O2`, `Q9-O4` | Q8, Q9 |

---

### 2.3 Section: Work Style (Q10–Q13)

| Pattern ID | Pattern Label (Lao) | Trigger Option Codes | Source Questions |
|---|---|---|---|
| `PAT-WS-INDEPENDENT` | ມັກການເຮັດວຽກແບບອິດສະຫຼະ ແລະ ມີຄວາມຄ່ອງຕົວ | `Q10-O1`, `Q13-O2` | Q10, Q13 |
| `PAT-WS-TEAM` | ມັກການເຮັດວຽກເປັນທີມ ແລະ ການປະສານງານຮ່ວມກັບຜູ້ອື່ນ | `Q10-O2`, `Q10-O3`, `Q13-O3` | Q10, Q13 |
| `PAT-WS-ANALYTICAL` | ແກ້ໄຂບັນຫາ ແລະ ຕັດສິນໃຈໂດຍອີງໃສ່ຂໍ້ມູນ ແລະ ການວິເຄາະ | `Q10-O4`, `Q11-O1`, `Q11-O4`, `Q12-O1` | Q10, Q11, Q12 |
| `PAT-WS-EXPERIMENTAL` | ມັກການທົດລອງຫາວິທີໃໝ່ ແລະ ຮຽນຮູ້ຈາກການລົງມືເຮັດຕົວຈິງ | `Q11-O2`, `Q11-O5`, `Q12-O3`, `Q13-O6` | Q11, Q12, Q13 |

---

### 2.4 Section: Learning Style (Q17–Q18)

| Pattern ID | Pattern Label (Lao) | Trigger Option Codes | Source Questions |
|---|---|---|---|
| `PAT-LRN-HANDSON` | ຮຽນຮູ້ໄດ້ດີທີ່ສຸດເມື່ອໄດ້ລົງມືປະຕິບັດ ແລະ ຝຶກຝົນຕົວຈິງ | `Q18-O1` | Q18 |
| `PAT-LRN-THEORY` | ຮຽນຮູ້ໄດ້ດີຈາກການອ່ານ, ຟັງ ແລະ ເຂົ້າໃຈຫຼັກການພື້ນຖານ | `Q18-O2` | Q18 |
| `PAT-LRN-EXAMPLES` | ຮຽນຮູ້ໄດ້ດີຈາກການສັງເກດຕົວຢ່າງແລ້ວນຳມາປັບໃຊ້ | `Q18-O3` | Q18 |
| `PAT-LRN-GROUP` | ຮຽນຮູ້ໄດ້ດີຈາກການສົນທະນາ ແລະ ແລກປ່ຽນກັບກຸ່ມ | `Q18-O4` | Q18 |

---

### 2.5 Section: Journey & Decision Signals (Q24–Q28)

| Pattern ID | Pattern Label (Lao) | Trigger Option Codes | Source Questions |
|---|---|---|---|
| `PAT-JRN-ADAPTIVE` | ມີແນວທາງແບບທົດລອງ ແລະ ປັບປ່ຽນຕາມສະຖານະການ | `Q24-O2`, `Q26-O3`, `Q27-O4` | Q24, Q26, Q27 |

---

## 3. Tension Detection Rules

Tensions identify meaningful contrasts between answers to support deeper self-reflection without penalizing or forcing resolution.

### Rule T1: Subject Curiosity vs Perceived Difficulty (Q14 vs Q15)
- **Logic:** Triggered if a user selects curiosity in subject domain $D$ in Q14 AND indicates difficulty in domain $D$ in Q15.
- **Domain Mapping Matrix:**
  - `math`: Q14-O1 vs Q15-O1 (ຄະນິດສາດ/ການຄຳນວນ)
  - `science`: Q14-O2 vs Q15-O2 (ວິທະຍາສາດ)
  - `tech`: Q14-O3 vs Q15-O3 (ເທັກໂນໂລຊີ/ຄອມພິວເຕີ)
  - `languages`: Q14-O4 vs Q15-O4 (ພາສາ/ການສື່ສານ)
  - `humanities`: Q14-O5 vs Q15-O5 (ສັງຄົມ/ມະນຸດສາດ)
  - `business`: Q14-O6 vs Q15-O6 (ທຸລະກິດ/ເສດຖະສາດ)
  - `art`: Q14-O7 vs Q15-O7 (ສິລະປະ/ການອອກແບບ)
  - `music`: Q14-O8 vs Q15-O8 (ດົນຕີ/ການສະແດງ)
  - `health`: Q14-O9 vs Q15-O9 (ສຸຂະພາບ/ການແພດ)
  - `sports`: Q14-O10 vs Q15-O10 (ກິລາ/ການອອກກຳລັງກາຍ)
  - `craft`: Q14-O11 vs Q15-O11 (ງານຊ່າງ/ວຽກລົງມືເຮັດ)
- **Source Questions:** `["Q14", "Q15"]`

### Rule T2: Work Style Preference vs Preferred Workspace Environment (Q10 vs Q13)
- **Case A (Solo Style vs Team Environment):** `Q10-O1` (solo work preference) AND `Q13-O3` (collaborative team environment).
- **Case B (Team Style vs Quiet Environment):** `Q10-O2` (team work preference) AND `Q13-O4` (quiet/high focus environment).
- **Source Questions:** `["Q10", "Q13"]`

### Rule T3: Long-term Mastery Ambition vs Short-term Return Preference (Q8/Q9/Q19 vs Q26)
- **Condition:** Long-term mastery goal (`Q8-O5`, `Q9-O1`, or `Q19-O4`) AND expectation of immediate short-term progress (`Q26-O2`).
- **Source Questions:** Matching subset of `Q8`, `Q9`, `Q19`, plus `Q26`.

### Rule T4: Mobility / Location Ambition vs Practical Relocation Constraints (Q21 vs Q22/Q23)
- **Condition:** Mobility aspiration (`Q21-O1` urban hub or `Q21-O3` abroad/other province) AND practical obstacle (`Q22-O2` family care constraint or `Q23-O4` unable to relocate).
- **Source Questions:** `Q21` plus matching items from `Q22`, `Q23`.
