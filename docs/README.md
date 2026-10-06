# Next-path Documentation

## Start here

- [`project-documentation.md`](project-documentation.md) — complete English project guide, architecture, contracts, operations, and upgrade rules
- [`system-architecture.md`](system-architecture.md) — three-sector architecture, database codebook, delivery risks, and incident triage
- [`sectors/`](sectors/) — frontend, backend, and database debugging boundaries
- [`deployment.md`](deployment.md) — current production services, environment variables, deployment flow, and rollback checks
- [`next-phase-plan.md`](next-phase-plan.md) — Phase 3 dashboard and analytics plan
- [`phase-3-dashboard-data-sector.md`](phase-3-dashboard-data-sector.md) — database contract for first-party analytics data
- [`../PROJECT_MEMORY.md`](../PROJECT_MEMORY.md) — working memory and historical decisions
- [`versions/README.md`](versions/README.md) — questionnaire and scoring version policy
- [`ds/engine-boundary.md`](ds/engine-boundary.md) — boundary between deterministic scoring and reflection UX
- [`frontend/frontend-inventory.md`](frontend/frontend-inventory.md) — frontend surface inventory

## Documentation areas

### `versions/`

Questionnaire and scoring contracts. Keep legacy v0.9.1 and active v4.0 documentation separate. Every runtime change must identify its form version.

### `ds/`

Signal Engine rules, dimensions, tensions, experiments, snapshots, traceability, and audit decisions.

### `frontend/`

UX inventories, Lao-language review, mobile review, and frontend audit notes.

## Documentation language

Project documentation is maintained in English so future contributors and service operators can use one shared reference. Lao text shown to end users remains in the frontend questionnaire and content files.

## Source-of-truth rule

When documentation conflicts with executable code, database migrations, or passing tests, the current versioned source code and passing tests are authoritative. Update the relevant documentation in the same change so the conflict does not persist.
