# PATHAI DS Specification: End-to-End Traceability Matrix

**Document Status:** `[DEFINED]` / `[PROPOSED]`  
**Target Assessment:** 28Q Pre-Cognitive (`v0.9.1` UX Lao)  
**Encoding Identifier:** `enc-0`  
**DS Engine Version:** `v0.1.0`

---

## 1. Overview & Traceability Principle

In PATHAI, **every derived element in the final reflection report must trace back to explicit, self-reported user inputs**. 

```
┌────────────────────────────────────────────────────────┐
│             User Responses (D1–D3, Q1–Q28)             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Validation Layer & DS Contract               │
│               (DSAssessmentPayload)                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   DS Engine (Pure)                     │
│  - Response Patterns   -> source_question_ids          │
│  - Possible Paths      -> source_question_ids          │
│  - Context Factors     -> source_question_ids          │
│  - Tensions Detected   -> source_question_ids          │
│  - Experiments         -> source_question_ids          │
└────────────────────────────────────────────────────────┘
```

No output is generated from ungrounded assumptions, statistical imputation, or black-box predictions.

---

## 2. Demographic & Context Traceability (D1–D3, Q22, Q23)

| Target DS Field | Source Question ID | Input Type | Extracted Evidence |
|---|:---:|---|---|
| `context_factors.age_band` | **D1** | Single-choice | `D1-O1` (15–17), `D1-O2` (18–20), `D1-O3` (21+) |
| `context_factors.education_level` | **D2** | Text field | Free-text self-reported current grade/status |
| `context_factors.province_code` | **D3** | Single-choice | `D3-O01` through `D3-O18` (18 administrative units) |
| `context_factors.has_constraints` | **Q22** | Multi-choice | `True` if `Q22-O1`..`Q22-O4` chosen; `False` if `Q22-O5` (no constraints) |
| `context_factors.constraints_detail`| **Q22** | Multi-choice | Descriptive strings for time, home/family, health, or distance |
| `context_factors.relocation_preference` | **Q23** | Single-choice | Willingness/capability to relocate (`Q23-O1`..`Q23-O6`) |

---

## 3. Response Pattern Traceability (`DSPattern`)

| Pattern Identifier | Section | Pattern Label (Lao) | Trigger Option Codes | Source QIDs |
|---|---|---|---|:---:|
| `PAT-INT-TECH` | `interests` | ຄວາມສົນໃຈດ້ານເທັກໂນໂລຊີ, ຄອມພິວເຕີ ແລະ ການສ້າງສັນຜົນງານດິຈິຕອນ | `Q1-O2`, `Q2-O1`, `Q3-O3`, `Q4-O1` | Q1, Q2, Q3, Q4 |
| `PAT-INT-ANALYSIS` | `interests` | ຄວາມສົນໃຈດ້ານການຄິດວິເຄາະ, ວິທະຍາສາດ ແລະ ການແກ້ໄຂບັນຫາ | `Q1-O3`, `Q2-O2`, `Q3-O1`, `Q4-O2` | Q1, Q2, Q3, Q4 |
| `PAT-INT-CREATIVE` | `interests` | ຄວາມສົນໃຈດ້ານສິລະປະ, ການອອກແບບ ແລະ ງານສ້າງສັນ | `Q1-O1`, `Q1-O9`, `Q2-O4`, `Q3-O2`, `Q4-O4` | Q1, Q2, Q3, Q4 |
| `PAT-INT-PEOPLE` | `interests` | ຄວາມສົນໃຈດ້ານການສື່ສານ, ການເຮັດວຽກກັບຄົນ ແລະ ການຊ່ວຍເຫຼືອສັງຄົມ | `Q1-O5`, `Q1-O6`, `Q2-O3`, `Q2-O6`, `Q2-O9`, `Q3-O5`, `Q3-O6`, `Q4-O5` | Q1, Q2, Q3, Q4 |
| `PAT-INT-BUSINESS` | `interests` | ຄວາມສົນໃຈດ້ານທຸລະກິດ, ການຈັດການ ແລະ ການວາງແຜນ | `Q1-O10`, `Q2-O5`, `Q3-O9`, `Q4-O3` | Q1, Q2, Q3, Q4 |
| `PAT-INT-PRACTICAL` | `interests` | ຄວາມສົນໃຈດ້ານງານປະຕິບັດຈິງ, ງານຊ່າງ ຫຼື ທຳມະຊາດ | `Q1-O7`, `Q1-O8`, `Q2-O7`, `Q3-O7`, `Q4-O6` | Q1, Q2, Q3, Q4 |
| `PAT-WS-INDEPENDENT` | `work_style` | ມັກການເຮັດວຽກແບບອິດສະຫຼະ ແລະ ມີຄວາມຄ່ອງຕົວ | `Q10-O1`, `Q13-O2` | Q10, Q13 |
| `PAT-WS-TEAM` | `work_style` | ມັກການເຮັດວຽກເປັນທີມ ແລະ ການປະສານງານຮ່ວມກັບຜູ້ອື່ນ | `Q10-O2`, `Q10-O3`, `Q13-O3` | Q10, Q13 |
| `PAT-WS-ANALYTICAL` | `work_style` | ແກ້ໄຂບັນຫາ ແລະ ຕັດສິນໃຈໂດຍອີງໃສ່ຂໍ້ມູນ ແລະ ການວິເຄາະ | `Q10-O4`, `Q11-O1`, `Q11-O4`, `Q12-O1` | Q10, Q11, Q12 |
| `PAT-WS-EXPERIMENTAL`| `work_style` | ມັກການທົດລອງຫາວິທີໃໝ່ ແລະ ຮຽນຮູ້ຈາກການລົງມືເຮັດຕົວຈິງ | `Q11-O2`, `Q11-O5`, `Q12-O3`, `Q13-O6` | Q11, Q12, Q13 |
| `PAT-VAL-MASTERY` | `values` | ໃຫ້ຄຸນຄ່າກັບຄວາມຊ່ຽວຊານ ແລະ ການພັດທະນາຕົນເອງຈົນເກັ່ງ | `Q8-O5`, `Q9-O1` | Q8, Q9 |
| `PAT-VAL-INNOVATION` | `values` | ໃຫ້ຄຸນຄ່າກັບການສ້າງສິ່ງໃໝ່ໆ ແລະ ຄວາມທ້າທາຍ | `Q8-O1`, `Q8-O4`, `Q9-O2` | Q8, Q9 |
| `PAT-VAL-IMPACT` | `values` | ໃຫ້ຄຸນຄ່າກັບການຊ່ວຍເຫຼືອຜູ້ອື່ນ ແລະ ສ້າງປະໂຫຍດໃຫ້ສັງຄົມ | `Q8-O3`, `Q9-O3` | Q8, Q9 |
| `PAT-VAL-STABILITY` | `values` | ໃຫ້ຄຸນຄ່າກັບຄວາມໝັ້ນຄົງ ແລະ ຄວາມສຳເລັດໃນໜ້າທີ່ການງານ | `Q8-O2`, `Q9-O4` | Q8, Q9 |
| `PAT-LRN-HANDSON` | `learning` | ຮຽນຮູ້ໄດ້ດີທີ່ສຸດເມື່ອໄດ້ລົງມືປະຕິບັດ ແລະ ຝຶກຝົນຕົວຈິງ | `Q18-O1` | Q18 |
| `PAT-LRN-THEORY` | `learning` | ຮຽນຮູ້ໄດ້ດີຈາກການອ່ານ, ຟັງ ແລະ ເຂົ້າໃຈຫຼັກການພື້ນຖານ | `Q18-O2` | Q18 |
| `PAT-LRN-EXAMPLES` | `learning` | ຮຽນຮູ້ໄດ້ດີຈາກການສັງເກດຕົວຢ່າງແລ້ວນຳມາປັບໃຊ້ | `Q18-O3` | Q18 |
| `PAT-LRN-GROUP` | `learning` | ຮຽນຮູ້ໄດ້ດີຈາກການສົນທະນາ ແລະ ແລກປ່ຽນກັບກຸ່ມ | `Q18-O4` | Q18 |
| `PAT-JRN-ADAPTIVE` | `journey` | ມີແນວທາງແບບທົດລອງ ແລະ ປັບປ່ຽນຕາມສະຖານະການ | `Q24-O2`, `Q26-O3`, `Q27-O4` | Q24, Q26, Q27 |

---

## 4. Exploration Path Traceability (`DSPath` - C1–C7)

| Path Group ID | Path Label (Lao) | Associated Question Domains | Target Trigger Option Codes |
|---|---|---|---|
| **C1** | ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ | Interests, Strengths, Growth | `Q1-O3`, `Q2-O2`, `Q3-O1`, `Q4-O2`, `Q5-O1`, `Q6-O1`, `Q14-O1`, `Q14-O2`, `Q16-O1` |
| **C2** | ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ | Interests, Strengths, Impact | `Q1-O2`, `Q2-O1`, `Q3-O3`, `Q4-O1`, `Q5-O2`, `Q6-O2`, `Q7-O7`, `Q14-O3`, `Q16-O2`, `Q20-O5` |
| **C3** | ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ | Interests, Strengths, Impact | `Q1-O1`, `Q1-O9`, `Q2-O4`, `Q3-O2`, `Q4-O4`, `Q5-O4`, `Q6-O5`, `Q7-O2`, `Q14-O7`, `Q14-O8`, `Q16-O5`, `Q20-O7` |
| **C4** | ສາຍສື່ສານ, ສັງຄົມ ແລະ ການພັດທະນາຄົນ | Interests, Strengths, Impact | `Q1-O5`, `Q1-O6`, `Q2-O3`, `Q2-O6`, `Q2-O9`, `Q3-O5`, `Q3-O6`, `Q4-O5`, `Q5-O3`, `Q5-O5`, `Q6-O3`, `Q6-O4`, `Q6-O6`, `Q7-O4`, `Q14-O4`, `Q14-O5`, `Q16-O4`, `Q20-O1`, `Q20-O4` |
| **C5** | ສາຍສຸຂະພາບ, ການແພດ ແລະ ການເບິ່ງແຍງ | Interests, Strengths, Impact | `Q1-O6`, `Q2-O8`, `Q4-O5`, `Q5-O5`, `Q14-O9`, `Q16-O1`, `Q20-O3` |
| **C6** | ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ | Interests, Strengths, 5-Year | `Q1-O10`, `Q2-O5`, `Q3-O9`, `Q4-O3`, `Q5-O6`, `Q6-O7`, `Q7-O3`, `Q7-O5`, `Q14-O6`, `Q16-O3`, `Q19-O3`, `Q20-O6` |
| **C7** | ສາຍງານປະຕິບັດ, ງານຊ່າງ ແລະ ທຳມະຊາດ | Interests, Strengths, Style | `Q1-O7`, `Q1-O8`, `Q2-O7`, `Q3-O7`, `Q4-O6`, `Q5-O7`, `Q6-O8`, `Q7-O3`, `Q14-O10`, `Q14-O11`, `Q16-O6`, `Q18-O1`, `Q20-O2` |

---

## 5. Tension Detection Traceability (`DSTension`)

| Tension ID | Title (Lao) | Primary Trigger Questions | Conflict Condition |
|---|---|:---:|---|
| `TENSION-INTEREST-DIFFICULTY-*` | ຄວາມສົນໃຈ ແລະ ຄວາມຮູ້ສຶກຍາກໃນດ້ານ... | **Q14**, **Q15** | Selected curiosity in subject domain $X$ in Q14 AND reported difficulty in domain $X$ in Q15 |
| `TENSION-WORKSTYLE-SOLO-VS-TEAM-ENV` | ຮູບແບບການເຮັດວຽກຄົນດຽວ ທຽບກັບ ສະພາບແວດລ້ອມການຮ່ວມມືເປັນທີມ | **Q10**, **Q13** | Solo work mode (`Q10-O1`) AND team collaborative environment (`Q13-O3`) |
| `TENSION-WORKSTYLE-TEAM-VS-QUIET-ENV` | ຮູບແບບການເຮັດວຽກເປັນທີມ ທຽບກັບ ສະພາບແວດລ້ອມທີ່ງຽບສະຫງົບ | **Q10**, **Q13** | Team work mode (`Q10-O2`) AND quiet focus environment (`Q13-O4`) |
| `TENSION-GOAL-MASTERY-VS-SHORTTERM` | ເປົ້າໝາຍຄວາມຊ່ຽວຊານໄລຍະຍາວ ທຽບກັບ ຄວາມຕ້ອງການເຫັນຜົນໃນໄລຍະສັ້ນ | **Q8/Q9/Q19**, **Q26** | Long-term mastery ambition (`Q8-O5`/`Q9-O1`/`Q19-O4`) AND rapid short-term return need (`Q26-O2`) |
| `TENSION-LOCATION-AMBITION-VS-CONSTRAINT` | ຄວາມຕ້ອງການດ້ານສະຖານທີ່ ທຽບກັບ ຂໍ້ຈຳກັດການຍ້າຍຕົວຈິງ | **Q21**, **Q22/Q23** | Mobility aspiration (`Q21-O1`/`Q21-O3`) AND real relocation restriction (`Q22-O2`/`Q23-O4`) |

---

## 6. Experiment Traceability (`DSExperiment`)

All three standard experiment archetypes inherit `source_question_ids` from the identified exploration paths:

| Experiment ID | Archetype | Title (Lao) | Linked Path Groups | Source QIDs Traceability |
|---|---|---|---|---|
| `EXP-01-INTERVIEW` | Informational Interview | ສົນທະນາກັບຜູ້ມີປະສົບການ | `path_group_ids` from matched `DSPath`s | Inherits all QIDs from triggered paths |
| `EXP-02-MICROPROJECT` | Micro-Project / Short Course | ທົດລອງເຮັດໂປຣເຈັກນ້ອຍໆ | `path_group_ids` from matched `DSPath`s | Inherits all QIDs from triggered paths |
| `EXP-03-OBSERVATION` | Real Observation | ສັງເກດຕົວຈິງ ແລະ ເຂົ້າຮ່ວມກິດຈະກຳ | `path_group_ids` from matched `DSPath`s | Inherits all QIDs from triggered paths |

---

## 7. DS Output Fields -> Input Evidence Summary

```
DSEngineResult
├── response_patterns       <── Direct boolean match from Q1–Q4, Q8–Q13, Q17–Q18, Q24–Q27
├── possible_paths          <── Mapped from interest/skill/learning codes across Q1–Q7, Q14, Q16, Q18, Q20
├── context_factors         <── Extracted directly from D1, D2, D3, Q22, Q23
├── unknowns                <── Unanswered QIDs + explicit unsure options (e.g. Q6-O9, Q8-O9, Q22-O6)
├── tensions                <── Cross-question divergence rules (Q14 vs Q15, Q10 vs Q13, Q8/Q9/Q19 vs Q26, Q21 vs Q22/Q23)
├── experiments             <── Experiential testing templates parameterized by matched path groups
├── summary_text            <── Deterministic template string compiled strictly from observed patterns
└── versions                <── Runtime form_version, enc-0, and ds version metadata
```
