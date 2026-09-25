# PATHAI Documentation

## Start here

- [`../PROJECT_MEMORY.md`](../PROJECT_MEMORY.md) — current project state, decisions, and test results
- [`versions/README.md`](versions/README.md) — form and algorithm version policy
- [`ds/engine-boundary.md`](ds/engine-boundary.md) — boundary between deterministic engine and reflection UX
- [`frontend/frontend-inventory.md`](frontend/frontend-inventory.md) — frontend surface inventory

## Documentation areas

### `versions/`

Questionnaire and scoring contracts. Keep legacy and v4 documentation separate; every runtime change must identify its form version.

### `ds/`

Signal Engine rules, dimensions, tensions, experiments, snapshots, and audit decisions.

### `frontend/`

UX inventories, Lao language review, mobile review, and frontend audit notes.

## Source-of-truth rule

When documentation conflicts with executable code or tests, the current versioned source code and passing tests are authoritative. Update the relevant documentation in the same change so the conflict does not persist.
