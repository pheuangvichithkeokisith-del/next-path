# Sector 3 — Database

## Scope

Supabase PostgreSQL schema, migrations, keys, constraints, and the first-party
dataset used by future analysis.

## Data rules

- `answers` is the raw response source of truth.
- `sessions.age_years` and `sessions.province_code` are typed analytic copies.
- `reports` is a presentation snapshot, not the main analytics table.
- `report_paths` is the relational ranked-result table for future dashboards.
- JSON is used for multi-select values and snapshot fields where the shape is
  intentionally flexible.
- Schema changes are additive Alembic migrations only.

## Trace one response

```text
sessions.id
  ├── answers.session_id
  ├── reports.session_id
  │     └── report_paths.report_id
  └── feedbacks.session_id
```

## Key and code rules

- Internal identity: UUID `sessions.id`.
- Human-readable identity: unique `sessions.response_code`.
- Province identity: `province_catalog.province_code` (for example `VTE`).
- Form question identity: `D1`–`D3`, `Q1`–`Q28`.
- Ranked path identity: `C1`–`C7` plus the stored scoring version.
- Sequence identity: `(year, province_code)` in `response_counters`.

## Debug checklist

1. Check `alembic_version` before changing a table.
2. Check the session row and status.
3. Check answer count and unique `(session_id, question_id)`.
4. Check `province_code` and `age_years` after completion.
5. Check one report and its `report_paths` rows.
6. Preserve raw records; repair derived snapshots through a versioned process.

