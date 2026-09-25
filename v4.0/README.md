# PATHAI v4.0

This directory contains the versioned v4 questionnaire and scoring contract. It is intentionally separated from the legacy `v0.9.1` form so both versions can be validated and supported safely.

## Files

- `questions_full.json` — D1–D3 and Q1–Q28, including weights and validation metadata
- `templates.json` — C1–C7 profile templates
- `scoring.py` — validation, normalization, section scoring, Q17 penalty, Pearson correlation, and risk/safety context
- `report_template.md` — Lao report draft for review and documentation

## Runtime integration

The web assessment requests `form_version=v4.0.0`. The backend loads this file through `form_service.py`, validates answers against the v4 option codes, and routes completed v4 sessions through `v4_report_service.py`.

Legacy sessions continue to use the existing DS engine and legacy questionnaire.

## Locked scoring rules

- 31 items: D1–D3 plus Q1–Q28
- Scoring sections: `interests`, `skills`, `values`, `work_style`, `academic`, `goals`
- Equal section weights: `1/6`
- Each answered question is normalized to `0–1` using the legal maximum for its `max_select`
- Q17 is a normalized negative penalty subtracted from positive scores and clamped to `0–1`
- Q26/Q27 produce `risk_willingness`; Q28 produces separate `safety_readiness`
- `constraints` and family context inform recommendations but do not directly alter C1–C7 scores
- Profile archetypes use Pearson correlation against the seven templates

## Validation status

v4.0 is integrated as a versioned web flow and has passed frontend build/lint, v4 scoring smoke checks, report-adapter smoke checks, and the existing entropy regression suite. It remains an exploratory instrument, not a clinical or predictive tool, and still requires content review and pilot validation.

Run a standalone smoke check with:

```bash
python v4.0/scoring.py
```
