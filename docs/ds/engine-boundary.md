# PATHAI DS Specification: System Boundaries & Responsibilities

**Document Version:** `v1.0.0`  
**Status:** `[LOCKED]`  
**Target Module:** DS Engine Architecture Boundaries

---

## 1. Architectural Overview & Separation of Concerns

The PATHAI system enforces strict boundaries between four distinct layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. API & Transport Layer                        │
│             FastAPI Routers (/api/v1/form, /sessions, etc.)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  2. Validation & Data Contract Layer                   │
│         - Sanitization (sanitizer.py)                                  │
│         - Schema Validation (answer_validator.py)                      │
│         - Contract Transformation (ds_contract.py)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (DSAssessmentPayload)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  3. Core DS Engine Layer (Pure Core)                   │
│   - Pure deterministic functional logic (engine.py, rules.py)          │
│   - Zero DB access, Zero AI/LLM, Zero Network calls                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (DSEngineResult)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   4. Persistence & Export Layer                        │
│         - SQLAlchemy Async Engine (report_service.py)                  │
│         - 4-Table Schema (sessions, answers, reports, feedbacks)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DS Engine Responsibilities

The Core DS Engine (`backend/app/ds/`) is **exclusively responsible** for:
1. **Deterministic Feature Evaluation:** Extracting descriptive response patterns (`DSPattern`) based strictly on self-reported inputs.
2. **Exploration Direction Identification:** Mapping user domain selections to unranked exploration paths (`DSPath`).
3. **Cognitive Tension Detection:** Identifying meaningful divergences between questions (`DSTension`) and preserving them for reflection.
4. **Context Factor Isolation:** Isolating demographic and physical constraints (`DSContextFactors`) from exploratory interests.
5. **Unknowns & Uncertainty Aggregation:** Aggregating unanswered items and explicit hesitation into structured `unknowns`.
6. **Experiential Experiment Parameterization:** Binding Try-Before-Decide action archetypes (`DSExperiment`) to matched path groups.
7. **Traceability Preservation:** Ensuring 100% of outputs retain exact `source_question_ids`.

---

## 3. DS Engine Non-Responsibilities

The DS Engine is **strictly prohibited** from:
- Making career predictions, determining "best fit", or issuing vocational verdicts.
- Ranking paths or assigning statistical percentage match scores.
- Evaluating user intelligence, personality types, or cognitive capacity.
- Querying databases, reading environment variables, or triggering I/O operations.
- Interacting with network endpoints or external web services.
- Generating randomized or non-reproducible outputs.

---

## 4. AI & LLM Boundary

| Capability | Allowed in Core DS Engine | Allowed in AI Reflection Layer (Future/External) |
|---|:---:|:---:|
| **Deterministic Pattern Extraction** | **YES** | Optional enhancement |
| **Traceable Tension Identification** | **YES** | Optional discussion prompt |
| **Automated Career Selection** | **FORBIDDEN** | **FORBIDDEN** |
| **Conversational Clarification / Socratic AI** | **FORBIDDEN** | **YES** (External client export only) |
| **Probabilistic Predictions** | **FORBIDDEN** | **FORBIDDEN** |

> **Principle:** AI gives explanation and facilitates socratic exploration. The system never decides the user's future.

---

## 5. Database Boundary

- **Isolation:** The DS Engine has **zero imports** from `app.models.*` or `sqlalchemy.*`.
- **Payload Independence:** The DS Engine only receives `DSAssessmentPayload` (a pure Pydantic model) and returns `DSEngineResult`.
- **Persistence Handling:** Storing reports into the `reports` table is entirely handled by `app.services.report_service.py` outside the DS Engine.
- **Baseline Integrity:** The introduction of the DS Engine creates zero new database tables, keeping the 4-table baseline intact.

---

## 6. Validation Boundary

- **Pre-Engine Sanitization:** All user input is validated and sanitized by `backend/app/validation/` before reaching the DS Engine.
- **Constraint Enforcement:** Single-choice vs multi-choice constraints, `max_select` rules, and exclusive option exclusivity (e.g., "ຍັງບໍ່ແນ່ໃຈ") are enforced in `answer_validator.py`.
- **Clean Input Guarantee:** The DS Engine assumes input adheres to the `DSAssessmentPayload` contract and never raises raw HTTP exceptions.
