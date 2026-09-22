# PATHAI DS Specification: Version Control & Compatibility Matrix

**Document Version:** `v1.0.0`  
**Status:** `[DEFINED]` / `[LOCKED]`  
**Target Module:** Version Control across Questionnaire, Encoding, and DS Engine

---

## 1. Versioning Architecture

PATHAI enforces three independent, decoupled version dimensions:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Questionnaire Form Version (`form_version`)                        │
│    Tracks question stems, option wording, and UI layout                │
│    Current: `v0.9.1` (UX Lao) | Supported Legacy: `v0.9.0`             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Encoding Version (`enc_version`)                                   │
│    Tracks serialization, option code mappings, and data structures     │
│    Current: `enc-0` (Baseline Raw Preservation)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. DS Engine Version (`ds_version`)                                   │
│    Tracks deterministic rule logic, pattern definitions, and tensions │
│    Current: `v0.1.0` (Deterministic Engine Core)                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Version Specifications

### 2.1 Form Version (`form_version`)
- **Current Canonical Form:** `v0.9.1`
- **Source Reference:** `test04.md` (Compiled UX Lao Version with 28 Questions + 3 Demographics).
- **Storage:** Persisted in `SessionModel.form_version` and embedded in `ReportResponse.versions.form`.

### 2.2 Encoding Version (`enc_version`)
- **Current Canonical Encoding:** `enc-0`
- **Functionality:** Encapsulates raw option codes (`Q{n}-O{m}`) and text answers into `DSAssessmentPayload`.
- **Status:** `[PROPOSED]` baseline awaiting formal codebook standardization.

### 2.3 DS Engine Version (`ds_version`)
- **Current Engine Version:** `v0.1.0`
- **Functionality:** Deterministic pattern extraction, unranked C1–C7 path identification, pairwise tension detection, and Try-Before-Decide experiment generation.
- **Status:** `[PROPOSED]` engine release.

---

## 3. Compatibility & Downgrade Rules

| Form Version | DS Engine Version | Compatibility Status | Behavior |
|:---:|:---:|:---:|---|
| **`v0.9.1`** | **`v0.1.0`** | **Native Match** | Full deterministic evaluation across all 28 questions. |
| **`v0.9.0`** | **`v0.1.0`** | **Supported** | Full evaluation; compatible with initial frozen 28Q baseline. |
| **`< v0.9.0`** | **`v0.1.0`** | **Partial (Degraded)** | Evaluates known questions; flags `FORM_VERSION_MISMATCH` in `unknowns`. |
| **`v1.0.0+` (Future)** | **`v0.1.0`** | **Controlled Review** | Requires explicit review of newly added question IDs before deployment. |

---

## 4. Upgrading Guidelines

1. **Questionnaire Changes:** Modifying any question stem, option code, or removing questions requires incrementing `form_version` (e.g. to `v0.9.2` or `v1.0.0`).
2. **Rule Modifications:** Changing pattern extraction triggers or tension conditions requires incrementing `ds_version` (e.g. to `v0.2.0`).
3. **Immutability of Historical Reports:** Existing persisted reports in the `reports` table retain their exact generation versions (`versions` JSON column) and are never retroactively modified.
