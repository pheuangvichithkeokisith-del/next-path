# PATHAI

PATHAI is a Lao-first self-reflection and career-exploration app for youth. It helps users understand their interests, skills, values, work style, constraints, and possible directions without making automated career decisions for them.

## Current runtime

- Frontend: Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Backend: FastAPI, SQLAlchemy async, SQLite for local development
- Active web questionnaire: `v4.0.0` (`D1–D3 + Q1–Q28`)
- Legacy compatibility: `v0.9.1` remains available as the default fallback API form
- v4 scoring: normalized section scores, Q17 negative penalty, Pearson profile correlation, risk/safety context
- Legacy entropy benchmarks: retained for regression testing of the legacy Signal Engine

## Repository map

```text
app/                 Next.js pages and routes
components/          Reusable UI components
api/                 Frontend API clients
types/               Frontend contract types
hooks/               Session and polling hooks
utils/               Browser draft persistence helpers
content/              Shared Lao UI copy

backend/app/         FastAPI application
backend/tests/       Backend and regression tests
v4.0/                Versioned v4 form, templates, scoring, and report draft
data/                 Legacy frontend questionnaire source
backend/app/data/     Legacy backend questionnaire source
docs/                 Architecture, version, UX, and DS documentation
scripts/              Snapshot and matrix-audit tooling
snapshots/            Versioned regression snapshots
PROJECT_MEMORY.md     Working project memory and session decisions
```

## Local development

Install frontend dependencies:

```bash
npm install
```

Start the backend in one terminal:

```bash
PYTHONPATH=backend backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open <http://localhost:3000>.

For a production-style local run:

```bash
npm run build
npm start
```

`npm start` serves the last successful Next.js build. It does not start the FastAPI backend.

## Verification

```bash
npm run lint
npm run build

PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_4_fluctuation_cases.py -q
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_ds_engine.py backend/tests/test_signal_engine.py backend/tests/test_ds_audit.py -q
```

The five fluctuation regression cases cover entropy targets of 0%, 25%, 50%, 75%, and 100%. They belong to the legacy Signal Engine; v4.0 uses Pearson profile correlation instead.

## Documentation entry points

- [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) — current architecture and session decisions
- [`docs/README.md`](./docs/README.md) — documentation index
- [`docs/versions/README.md`](./docs/versions/README.md) — questionnaire and algorithm versions
- [`v4.0/README.md`](./v4.0/README.md) — v4 form and scoring contract
- [`backend/README.md`](./backend/README.md) — backend setup and API overview

## Product boundary

PATHAI provides reflection patterns and exploration opportunities. It does not diagnose users, predict a guaranteed career outcome, or replace a qualified teacher, counselor, or professional adviser.
