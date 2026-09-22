# PATHAI DS Specification: Dimensions & Exploration Clusters

**Document Status:** `[PROPOSED]`  
**Specification Version:** `v0.1.0-draft`  
**Target Form Version:** `v0.9.1` (Pre-Cognitive 28Q)  
**Encoding Version:** `enc-0`

---

## 1. Purpose & Core Principles

The PATHAI Data Science (DS) Dimensions Specification defines the current exploration clusters used by the deterministic DS Engine.

### Fundamental Non-Negotiables
- **Exploration Directions Only:** Clusters represent thematic umbrellas for self-reflection and exploratory inquiries.
- **No Career Prediction or Verdict:** The engine does not predict the user's future career or suitability.
- **No Ranking or "Best Fit":** Clusters are never scored, ranked against each other, or assigned percentage probabilities.
- **Strict Traceability:** Every cluster associated with a user's session must trace back directly to specific answered options in `source_question_ids`.

---

## 2. Canonical Exploration Clusters (C1–C7)

> **Important Notice:** The C1–C7 taxonomy is currently marked as `[PROPOSED]` baseline specification and awaits formal sign-off by the system architect and domain owners.

| Cluster ID | Cluster Name (Lao) | English Concept | Description (Lao) |
|---|---|---|---|
| **C1** | ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ | Data, Analysis & Systematic Problem Solving | ທິດທາງກ່ຽວກັບການຄິດວິເຄາະ, ການແກ້ໄຂບັນຫາຢ່າງມີລະບົບ ແລະ ວິທະຍາສາດຂໍ້ມູນ |
| **C2** | ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ | Technology & Software Development | ທິດທາງກ່ຽວກັບການພັດທະນາຊັອບແວ, ເທັກໂນໂລຊີດິຈິຕອນ ແລະ ລະບົບຄອມພິວເຕີ |
| **C3** | ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ | Design, Creative Arts & Innovation | ທິດທາງກ່ຽວກັບສິລະປະ, ການອອກແບບ, ສື່ສ້າງສັນ ແລະ ການສ້າງນະວັດຕະກຳໃໝ່ |
| **C4** | ສາຍສື່ສານ, ສັງຄົມ ແລະ ການພັດທະນາຄົນ | Communication, Social Sciences & Human Development | ທິດທາງກ່ຽວກັບການສື່ສານ, ການເຮັດວຽກກັບຄົນ, ການສຶກສາ ແລະ ວຽກງານຊຸມຊົນ |
| **C5** | ສາຍສຸຂະພາບ, ການແພດ ແລະ ການເບິ່ງແຍງ | Health Sciences, Medicine & Caregiving | ທິດທາງກ່ຽວກັບວິທະຍາສາດສຸຂະພາບ, ການແພດ, ການພະຍາບານ ແລະ ການດູແລ |
| **C6** | ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ | Management, Business & Tech Entrepreneurship | ທິດທາງກ່ຽວກັບການບໍລິຫານຈັດການ, ການວາງແຜນ, ການຕະຫຼາດ ແລະ ການສ້າງທຸລະກິດ |
| **C7** | ສາຍງານປະຕິບັດ, ງານຊ່າງ ແລະ ທຳມະຊາດ | Applied Technical, Craftsmanship & Nature | ທິດທາງກ່ຽວກັບງານຊ່າງເຕັກນິກ, ກະສິກຳ, ທຳມະຊາດ ແລະ ວຽກທີ່ລົງມືປະຕິບັດຈິງ |

---

## 3. Source Question IDs & Option Code Mappings

Clusters aggregate evidence across three distinct question signal layers:
1. **Interest Signals:** Q1 (Free day activities), Q2 (Skill to learn), Q3 (Flow state activity), Q4 (Content consumed).
2. **Skill / Strengths Signals:** Q5 (Compliments), Q6 (Self-rated skill), Q7 (Proud accomplishment).
3. **Learning / Future Signals:** Q14 (Subjects to learn), Q16 (Direction of interest), Q18 (Learning style), Q19 (5-year vision), Q20 (Social impact).

### Detailed Signal Mapping Matrix

```
C1 (Data & Analysis)
├── Interests: Q1-O3, Q2-O2, Q3-O1, Q4-O2
├── Skills:    Q5-O1, Q6-O1
└── Learning:  Q14-O1 (Math), Q14-O2 (Science), Q16-O1

C2 (Technology & Software)
├── Interests: Q1-O2, Q2-O1, Q3-O3, Q4-O1
├── Skills:    Q5-O2, Q6-O2, Q7-O7
└── Learning:  Q14-O3 (Tech), Q16-O2, Q20-O5 (Tech Impact)

C3 (Design & Innovation)
├── Interests: Q1-O1, Q1-O9, Q2-O4, Q3-O2, Q4-O4
├── Skills:    Q5-O4, Q6-O5, Q7-O2
└── Learning:  Q14-O7 (Art), Q14-O8 (Music), Q16-O5, Q20-O7 (Art Impact)

C4 (Communication & Society)
├── Interests: Q1-O5, Q1-O6, Q2-O3, Q2-O6, Q2-O9, Q3-O5, Q3-O6, Q4-O5
├── Skills:    Q5-O3, Q5-O5, Q6-O3, Q6-O4, Q6-O6, Q7-O4
└── Learning:  Q14-O4 (Lang), Q14-O5 (Humanities), Q16-O4, Q20-O1 (Community), Q20-O4 (Education)

C5 (Health & Caregiving)
├── Interests: Q1-O6, Q2-O8, Q4-O5
├── Skills:    Q5-O5
└── Learning:  Q14-O9 (Health), Q16-O1, Q20-O3 (Health Impact)

C6 (Management & Business)
├── Interests: Q1-O10, Q2-O5, Q3-O9, Q4-O3
├── Skills:    Q5-O6, Q6-O7, Q7-O3, Q7-O5
└── Learning:  Q14-O6 (Business), Q16-O3, Q19-O3, Q20-O6 (Economy Impact)

C7 (Applied Technical & Nature)
├── Interests: Q1-O7, Q1-O8, Q2-O7, Q3-O7, Q4-O6
├── Skills:    Q5-O7, Q6-O8, Q7-O3
└── Learning:  Q14-O10 (Sports), Q14-O11 (Craft), Q16-O6, Q18-O1 (Hands-on), Q20-O2 (Environment)
```

---

## 4. Deterministic Evaluation Semantics

When evaluating user responses:
1. An exploration path `DSPath` is included **if and only if** at least one selected option code matches the cluster's defined option codes.
2. The output order is strictly deterministic (sorted by cluster ID: C1, C2, ..., C7).
3. If no clusters are triggered, the engine emits an empty list of possible paths and defaults to open exploration reflection.
4. No threshold weighting, distance calculation, or scoring algorithm is applied.
