# PATHAI DS Specification: Encoding & Codebook Specification

**Document Status:** `[PROPOSED]`  
**Encoding Identifier:** `enc-0`  
**Current Questionnaire Baseline:** `v0.9.1` (with compatibility for `v0.9.0`)

---

## 1. Overview & Purpose

The Encoding Specification provides the foundational structure for serializing user questionnaire responses into a standardized, deterministic payload (`DSAssessmentPayload`) consumed by the PATHAI DS Engine.

> **Status Notice:** `enc-0` is the initial baseline encoding identifier. It is marked as `[PROPOSED]` and serves to isolate data transformation from inference logic until a formal standardized codebook is finalized.

---

## 2. Identifier & Code Conventions

### 2.1 Question Identifiers
The 28Q assessment follows a structured two-tier ID convention:

| Range | Type | Purpose | Cardinality |
|---|---|---|---|
| **D1–D3** | Demographics | Self-reported baseline context (Age, Education, Province) | 3 items |
| **Q1–Q7** | Interests & Skills | Free-time activities, desired skills, flow, content, self-perceived strengths | 7 items |
| **Q8–Q13** | Values & Work Style | Core values, legacy, work configuration, problem-solving, decision style, workspace | 6 items |
| **Q14–Q18** | Learning & Academic | Subject curiosity, perceived difficulty, growth direction, resilience, learning style | 5 items |
| **Q19–Q23** | Future Goals & Real Context | 5-year outlook, social impact, relocation preference, constraints | 5 items |
| **Q24–Q28** | Journey & Decision Layer | Failure response, learning execution, effort tolerance, choice criteria, tool expectation | 5 items |

**Total:** 3 Demographic items + 28 Cognitive/Journey items = 31 items.

### 2.2 Option Code Structure
Option codes are deterministically constructed:
- Pattern: `{QuestionID}-O{OptionNumber}`
- Examples:
  - `D1-O1` (Age 15–17)
  - `D3-O01` to `D3-O18` (17 provinces + Vientiane Capital)
  - `Q1-O1` to `Q1-O11` (Q1 option 1 through 11)
  - `Q22-O1` to `Q22-O7` (Q22 real constraints)

---

## 3. Form Versions & Compatibility

| Form Version | Status | Description |
|---|---|---|
| **`v0.9.1`** | **Active Default** | 28Q Pre-Cognitive UX Lao compiled version (`test04.md` / `data/questions.json`). |
| **`v0.9.0`** | Supported (Legacy) | Initial frozen 28Q specification baseline. |

If a session provides a form version outside supported versions, the engine flags a `FORM_VERSION_MISMATCH` notice in the `unknowns` array rather than halting execution.

---

## 4. DS Assessment Payload Schema (`DSAssessmentPayload`)

The payload standardizes raw responses into a typed structure before DS Engine evaluation:

```json
{
  "session_id": "string (UUIDv4)",
  "form_version": "v0.9.1",
  "session_status": "in_progress | completed",
  "created_at": "ISO-8601 UTC Timestamp",
  "completed_at": "ISO-8601 UTC Timestamp | null",
  "demographics": {
    "age_band": "string | null",
    "age_band_code": "string | null (e.g. D1-O1)",
    "education_level": "string | null (free text from D2)",
    "province_code": "string | null (e.g. D3-O01)",
    "province_name": "string | null"
  },
  "responses": {
    "Q1": {
      "question_id": "Q1",
      "section": "interests",
      "question_type": "multi",
      "option_codes": ["Q1-O2", "Q1-O4"],
      "other_text": null,
      "extra_text": null,
      "text_value": null,
      "is_answered": true
    }
  },
  "total_answered": 31,
  "total_expected_questions": 28,
  "is_ready_for_evaluation": true,
  "missing_questions": []
}
```

---

## 5. Explicit Unsure & No-Evidence Encoding Map

Options representing explicit hesitation or lack of evidence are mapped as informative unknowns rather than missing data:

| Option Code | Label (Lao) | DS Interpretation |
|---|---|---|
| `Q4-O9` | ບໍ່ຄ່ອຍໄດ້ເບິ່ງຄລິບ/ເນື້ອຫາ | Explicit low media consumption baseline |
| `Q5-O8` | ຍັງບໍ່ເຄີຍມີໃຜຊົມເຊີຍເລື່ອງນີ້ | Absence of external social feedback |
| `Q6-O9` | ຍັງບໍ່ແນ່ໃຈວ່າຈຸດແຂງແມ່ນຫຍັງ | Unexplored self-efficacy |
| `Q7-O8` | ຍັງບໍ່ມີຜົນງານທີ່ນຶກອອກ | Early exploration stage |
| `Q8-O9` | ຍັງບໍ່ແນ່ໃຈສິ່ງທີ່ສຳຄັນໃນການເຮັດວຽກ | Uncrystallized career values |
| `Q14-O12` | ຍັງບໍ່ແນ່ໃຈດ້ານທີ່ຢາກຮຽນເພີ່ມ | Open academic curiosity |
| `Q15-O13` | ຍັງບໍ່ແນ່ໃຈດ້ານທີ່ຮູ້ສຶກຍາກ | Undetermined difficulty boundaries |
| `Q19-O6` | ຍັງບໍ່ແນ່ໃຈເປົ້າໝາຍ 5 ປີ (ຢາກສຳຫຼວດກ່ອນ) | Explicit exploratory mindset |
| `Q22-O6` | ຍັງບໍ່ແນ່ໃຈເລື່ອງຂໍ້ຈຳກັດ | Unknown constraint horizon |
| `Q22-O7` | ບໍ່ຢາກຕອບເລື່ອງຂໍ້ຈຳກັດ | Privacy boundary preserved |
| `Q23-O5` | ຍັງບໍ່ແນ່ໃຈເລື່ອງການຍ້າຍຕ່າງແຂວງ | Relocation uncertainty |
| `Q23-O6` | ບໍ່ຢາກຕອບເລື່ອງການຍ້າຍ | Privacy boundary preserved |
