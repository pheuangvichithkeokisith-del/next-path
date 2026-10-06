# Sector 2 — Backend

## Scope

FastAPI routes, validation, session state transitions, scoring adapters, report
generation, exports, and feedback persistence.

## Main files

| Area | Files |
|---|---|
| App/config | `backend/app/main.py`, `backend/app/config.py` |
| Routes | `backend/app/routers/` |
| Services | `backend/app/services/` |
| Validation | `backend/app/validation/` |
| Scoring | `backend/app/ds/`, `backend/v4.0/` |
| Migrations | `backend/alembic/versions/`, `backend/entrypoint.sh` |

## State flow

`created` → `in_progress` → `completed`

Answers cannot be changed after completion. Completion validates v4 answers,
copies typed age/province fields, allocates `response_code`, and leaves report
generation deterministic and version-aware.

## Debug checklist

1. `GET /health` — service liveness.
2. `GET /api/v1/form?version=v4.0.0` — form asset and version.
3. Session status — confirm the state transition.
4. Answer response — inspect the rejected question or option code.
5. Railway logs — inspect migration, database, and traceback messages.
6. Report versions — confirm the form and scoring versions match.

## Deployment rule

`backend/entrypoint.sh` runs migration bootstrap and `alembic upgrade head`
before Uvicorn. Production application startup does not create schema tables.

