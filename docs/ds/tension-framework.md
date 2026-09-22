# PATHAI DS Specification: Tension Framework

**Document Status:** `[PROPOSED]`  
**Implementation Model:** `DSTension` (`backend/app/ds/models.py`)  
**Detection Rules:** `backend/app/ds/rules.py`

---

## 1. Philosophy: Tensions as Reflection Opportunities

In traditional psychometric or career assessment systems, divergent answers are often treated as response noise, logical inconsistency, or measurement error to be smoothed out by statistical weighting.

In **PATHAI**, divergent answers are treated as **essential cognitive tensions** and **high-value self-reflection opportunities**.

```
                       ┌──────────────────────────────┐
                       │   Self-Reported Responses    │
                       └──────────────┬───────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     ▼                                 ▼
         ┌───────────────────────┐         ┌───────────────────────┐
         │  Consistent Patterns  │         │   Divergent Signals   │
         │     (DSPattern)       │         │      (DSTension)      │
         └───────────────────────┘         └───────────┬───────────┘
                                                       │
                                      ┌────────────────┴────────────────┐
                                      │  Preserved Explicitly for User  │
                                      │  - NOT an error                 │
                                      │  - NOT a negative score         │
                                      │  - NOT auto-resolved by system  │
                                      └─────────────────────────────────┘
```

---

## 2. Core Non-Negotiables

1. **Not an Error or Inconsistency:** A tension does not indicate that the user filled out the questionnaire incorrectly.
2. **Not a Negative Score or Penalty:** Tensions never subtract points, lower compatibility, or downgrade a path.
3. **Not Automatically Resolved by Algorithm:** The system never "fixes" or resolves the tension on behalf of the user. Only the user can explore and navigate their own priorities.
4. **Strict Traceability:** Every tension explicitly references the exact `source_question_ids` that generated it.

---

## 3. Tension Typology

| Tension ID | Category | Philosophical Purpose |
|---|---|---|
| `TENSION-INTEREST-DIFFICULTY-*` | Curiosity vs Self-Efficacy | Distinguishes between intrinsic interest in a field and past friction or lack of foundational learning. |
| `TENSION-WORKSTYLE-SOLO-VS-TEAM-ENV` | Autonomy vs Community | Explores nuance between independent task ownership and desired social atmosphere. |
| `TENSION-WORKSTYLE-TEAM-VS-QUIET-ENV` | Collaboration vs Focus | Explores balance between interactive teamwork and deep focus requirements. |
| `TENSION-GOAL-MASTERY-VS-SHORTTERM` | Horizon vs Momentum | Highlights the challenge of long-term expertise cultivation while needing short-term feedback loops. |
| `TENSION-LOCATION-AMBITION-VS-CONSTRAINT` | Aspiration vs Reality | Connects geographical ambitions with real-world family or local obligations to identify stepping-stone alternatives (e.g., remote learning). |

---

## 4. UI Representation Guidelines

When tensions are rendered on the reflection report:
- Display in neutral, constructive Lao language.
- Frame as **"ຈຸດທີ່ໜ້າສົນໃຈສຳລັບການທົບທວນຕົນເອງ"** (interesting points for self-reflection).
- Avoid words such as "ຂໍ້ຂັດແຍ່ງ", "ຜິດພາດ", "ຈຸດອ່ອນ", or "ບັນຫາ".
