# PATHAI v4.0 (standalone proposal)

ຊຸດນີ້ແມ່ນ version ແຍກສຳລັບທົດລອງຄຳຖາມ ແລະ algorithm ໃໝ່. ບໍ່ໄດ້ຖືກ import ເຂົ້າ production runtime.

## Files

- `questions_full.json` — D1–D3 ແລະ Q1–Q28 ຂອງ v4.0
- `templates.json` — Template Profile C1–C7
- `scoring.py` — validation, normalization, section scoring, Q17 penalty, correlation, risk/safety context
- `report_template.md` — ຮ່າງລາຍງານພາສາລາວ

## Locked rules

- ລວມ 31 ລາຍການ: D1–D3 + Q1–Q28
- Scoring sections: interests, skills, values, work_style, academic, goals
- Section weights: `1/6` ເທົ່າກັນ
- constraints/flexibility ເປັນ context, ບໍ່ປັບ C1–C7 ໂດຍກົງ
- Q17 ເປັນ negative signal; penalty ຖືກ normalize ແຍກ ແລະນຳໄປຫັກຈາກ positive score
- Q26/Q27 ໃຫ້ `risk_willingness`; Q28 ໃຫ້ `safety_readiness`
- ຄະແນນ variance ຕ່ຳ → `Multi-Scattered` ແລະບໍ່ເລືອກ top cluster

## Run a smoke check

```bash
python v4.0/scoring.py
```

The module can also be imported by a separate v4.0 test suite. Do not add it to
the current API router or replace `data/questions.json` until professor review,
pilot validation, and a versioned migration are complete.

## Validation status

This is a standalone draft. It is not professor-reviewed, not a clinical tool,
and not a production replacement for the v0.9.1 questionnaire or the existing
DS engine.
