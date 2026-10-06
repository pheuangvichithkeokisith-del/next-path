# Phase 3 — Database Sector: First-party Next-path Data

This document defines the data structure for analysis of responses collected by the Next-path website. The dashboard will live in a separate repository, while Supabase remains the shared database source.

## Goals and scope

- Analyze national and province-level patterns from the website assessment.
- Support yearly and monthly trends.
- Support ranked paths generated for completed respondents.
- Preserve raw answers and store derived results separately.
- Exclude external websites and labor statistics from the first phase.
- Do not change the public assessment flow.

## Current tables

| Table | Purpose | Notes |
|---|---|---|
| `sessions` | Session, form version, status, and timestamps | `completed_at` is the submission time |
| `answers` | One raw answer row per question and session | Unique by `(session_id, question_id)` |
| `reports` | Generated report and display snapshot | JSON is for presentation, not aggregation |
| `feedbacks` | Feedback submitted after the report | Linked to the session |
| `province_catalog` | Province codes and labels | Stable mapping for analysis |
| `response_counters` | Sequence allocation | Used to create readable response codes |
| `report_paths` | Ranked report paths | One row per report rank |

These tables are part of the current Backend schema. Future changes must use migrations and preserve existing records.

## Answer storage rules

- Keep the original form version with every session.
- Store one answer row per question.
- Keep multi-select `option_codes` as a JSON array for now.
- Use separate `text_value`, `other_text`, and `extra_text` fields where the answer type needs them.
- Copy age from `D1` into `sessions.age_years` when a session is completed.
- Map province selection `D3` to `sessions.province_code`.
- Keep the original demographic answers in `answers` for audit and recomputation.
- Do not invent district values; the current form does not collect a district.

## Time and response identifiers

- Use `sessions.completed_at` as the submission timestamp.
- Derive year, month, and day in views instead of storing duplicate date columns.
- Keep UUIDs as internal primary keys.
- Assign a readable `response_code` after the session has the required demographics and is completed.
- Use a format such as `2026-VTE-000001`.
- Use `UNK` when a province is unavailable.
- Do not put an occupation, path, name, or email in the response code.

## Relational report paths

`reports.possible_paths` remains a presentation snapshot. The `report_paths` table is the queryable result structure:

- `id` — primary key
- `report_id` — foreign key to `reports.id`
- `rank` — usually 1, 2, or 3
- `path_code` — current scoring path code, such as `C1`–`C7`
- `label_lao` — label captured when the report was generated
- `classification`
- `fit_score`
- `feasibility_score`
- `compatibility_score`
- `scoring_version`
- unique constraint on `(report_id, rank)`

Taxonomies for occupations and skills should be introduced as separate catalogs later. Do not rewrite raw answers when a taxonomy changes.

## Read-only analytical views

The dashboard API should use views or equivalent read-only query models:

- `v_response_dataset` — one row per completed session with response code, completion date, form/scoring version, age, and province
- `v_response_answers` — normalized question-answer rows for analysis
- `v_path_outcomes` — one row per session and ranked path
- `v_national_path_trends` — national counts and proportions
- `v_province_path_trends` — province counts and proportions
- `v_yearly_path_trends` — yearly counts and proportions

Every proportion must include the respondent count used as its denominator and the covered date range. Small groups should be handled in the API or dashboard layer according to the approved privacy rule.

## Data workflow

```text
Create session
    ↓
Store raw answers
    ↓
Complete the questionnaire
    ↓
Store completion time and response code
    ↓
Generate reports and report_paths
    ↓
Expose website data through read-only views
    ↓
Serve summarized data to the separate dashboard API
```

## Schema-change requirements

1. Use additive Alembic migrations.
2. Keep existing sessions and raw answers readable.
3. Make migrations safe for existing databases and rerunnable where practical.
4. Add catalog rows only for data collected by the website.
5. Test unique constraints and foreign keys before production deployment.
6. Test migrations against a database with the current production shape.
7. Do not reset or delete production data to apply a schema change.

## Status

- Production session, answer, report, export, and feedback flow: operational
- Response code, typed age/province fields, province catalog, counters, and ranked paths: implemented in Backend migrations
- Analytical views: not implemented
- External data ingestion: out of scope
- Analytics API: Phase 3
- Dashboard frontend: separate repository
