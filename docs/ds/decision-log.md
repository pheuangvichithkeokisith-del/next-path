# PATHAI Architecture & DS Decision Log

**Document Version:** `v1.0.0`  
**Last Updated:** 2026-09-22  
**Purpose:** Formal log of locked, proposed, and open architectural & data science decisions for PATHAI.

---

## 1. Locked Decisions `[LOCKED]`

These decisions are finalized, implemented, and non-negotiable across the entire system.

| Decision ID | Area | Decision Summary | Rationale |
|---|---|---|---|
| **DEC-01** | Philosophy | **Zero Career Prediction & Zero Automated Life Decisions** | PATHAI provides self-reflection and exploration patterns. AI explains; the system never dictates career paths or ranks users. |
| **DEC-02** | Persistence | **4-Table Minimal Database Boundary** | Database strictly consists of `sessions`, `answers`, `reports`, `feedbacks`. No additional tables or relational complexity. |
| **DEC-03** | Engine | **Pure Deterministic Function Implementation** | DS Engine is pure (same input -> same output). Zero database queries, zero network calls, zero random seeds, zero AI/LLM inside engine. |
| **DEC-04** | Privacy | **Anonymous UUIDv4 Sessions without PII** | No names, emails, phone numbers, or passwords collected. Minimal demographic context only (Age band, Province, Grade). |
| **DEC-05** | Integrity | **Full Source Traceability (`source_question_ids`)** | Every pattern, path, tension, and experiment must maintain exact back-links to source question IDs. |
| **DEC-06** | UX / DS | **Uncertainty as Positive Signal (Unknowns)** | "Not sure" / "Prefer not to answer" are surfaced as valuable exploration opportunities, never as negative penalties or score deductions. |
| **DEC-07** | Security | **Export Sanitization & PII Stripping** | All text exports (Markdown and JSON) are sanitized to prevent injection and avoid sensitive data leakage. |

---

## 2. Proposed Decisions `[PROPOSED]`

These decisions are implemented in code as working baselines but await formal sign-off from system owners before being marked as `[LOCKED]`.

| Proposal ID | Area | Proposed Implementation | Current Code Location |
|---|---|---|---|
| **PROP-01** | Taxonomy | **C1–C7 Exploration Clusters** (7 thematic umbrellas: Data, Tech, Design, Social, Health, Business, Applied/Nature). | `backend/app/ds/dimensions.py` |
| **PROP-02** | Encoding | **`enc-0` Baseline Encoding Identifier** for raw survey transformation into `DSAssessmentPayload`. | `backend/app/ds/models.py`, `backend/app/validation/ds_contract.py` |
| **PROP-03** | Logic | **Deterministic Pattern & Tension Extraction Rules** (Q1–Q4, Q8–Q13, Q17–Q18, Q24–Q27). | `backend/app/ds/rules.py` |
| **PROP-04** | Experiments | **3 Experiential Discovery Archetypes** (Informational Interview, Micro-Project, Real Observation). | `backend/app/ds/experiments.py` |

---

## 3. Open Decisions `[OPEN]`

These items require discussion and consensus among system architects and domain leads.

| Open ID | Topic | Description & Trade-offs | Owner Decision Needed |
|---|---|---|---|
| **OPEN-01** | **Form Version Key Canonicalization** | Active questionnaire data is compiled as `v0.9.1 UX Lao` (`test04.md`), while older spec refers to `v0.9.0`. | Confirm whether to standardize all references to `v0.9.1` or alias to `v0.9`. |
| **OPEN-02** | **Formal Codebook Taxonomy** | Whether to retain lightweight `enc-0` or build a comprehensive semantic codebook specification. | Determine if advanced codebook metadata is needed for Phase 2. |
| **OPEN-03** | **Tension Multi-Select Nuance** | How to handle multi-layered conflict when a user selects 3+ opposing choices simultaneously in Q14/Q15. | Approve current pairwise evaluation or define multi-select prioritization. |

---

## 4. Future Changes Requiring Owner Approval

Any changes to the following areas **strictly require explicit written approval** from the system owner before any code is modified:
1. Adding, modifying, or renaming any exploration cluster in C1–C7.
2. Introducing any scoring formulas, match percentages, or ranking algorithms.
3. Modifying question stems, option wording, or option codes in `questions.json`.
4. Adding new database tables or altering SQLAlchemy models beyond the 4-table baseline.
5. Introducing AI / LLM reasoning layers into the core DS Engine.
