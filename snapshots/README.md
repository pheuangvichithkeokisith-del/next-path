# 📸 PATHAI Regression Snapshots — Policy & Baseline Registry

> **Created:** 2026-09-25 | Part of Phase 2 / H4 Regression Snapshot Framework

## 1. Purpose

Snapshots are the **regression safety net** for the Signal Engine. Each file records
the deterministic output (`E_r`, archetype, confidence, core/secondary/exploratory/caution
paths) for **103 synthetic profiles** (5 fluctuation archetypes + pure-cluster profiles +
98 randomized profiles, seeded `random.seed(42)`).

## 2. How to Generate & Diff

```bash
# From project root — regenerate the current-engine snapshot:
PYTHONPATH=backend backend/.venv/bin/python scripts/snapshot.py snapshots/<version>.json

# Compare two snapshots (classification drift check):
backend/.venv/bin/python scripts/diff_snapshots.py snapshots/before.json snapshots/after.json
```

**Quality Gate:** Archetype shift must stay **≤ 20%** (target ≤ 15%) across all
103 profiles. Failures block engine releases.

## 3. Baseline Registry

| File | Engine | Status | Notes |
|---|---|---|---|
| `v1.1.2.json` | v1.1.2 (Continuous N_eff Hill number) | ✅ **ACTIVE BASELINE** | Fresh-run verified 0.0% shift on 2026-09-25 (md5 match) |

**Rule:** The newest **committed** snapshot matching the current `algorithm_version`
in `signal_engine.py` is the active baseline. Snapshots whose embedded
`algorithm_version` does not match any committed engine version are treated as
**orphans** and archived under `snapshots/experimental/`.

## 4. Archive — Orphaned Experiments

| File | Reason |
|---|---|
| `experimental/v1.2.0-orphaned-entropy-experiment.json` | Snapshot generated from an **uncommitted experimental engine build** (embedded `algorithm_version: "1.2.0"` with a modified entropy mapping, no longer present in the codebase). Diffing it against the live engine produced a misleading "31.1% archetype shift" on 2026-09-25. The live engine itself is deterministic and verified stable (fresh-run md5 == `v1.1.2.json`). |

> ⚠️ **Lesson learned:** always regenerate snapshots from the *current* engine before
> diffing — never diff two stale snapshot files against each other.
