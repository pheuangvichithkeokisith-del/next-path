# PATHAI DS Specification: Experiment Framework ("Try Before Decide")

**Document Status:** `[PROPOSED]`  
**Implementation Model:** `DSExperiment` (`backend/app/ds/models.py`)  
**Generator:** `backend/app/ds/experiments.py`

---

## 1. Purpose & Philosophy

The **Try Before Decide** framework provides actionable, low-stakes experiential discovery methods for users to test their real-world interest before committing major life resources (time, money, relocation) to an educational or career path.

### Core Non-Negotiables
- **Exploration Tools, NOT Recommendations:** Experiments are structured learning actions, not personalized prescriptions or career advice.
- **Low Stakes & High Learning:** Actions are designed to be accessible, rapid (1 hour to 2 weeks), and informative.
- **User Agency:** The user chooses if, when, and how to conduct any experiment.

---

## 2. Standard Experiment Archetypes

The PATHAI DS Engine provides three foundational experiment archetypes:

```
                            ┌────────────────────────┐
                            │    Try Before Decide   │
                            │  Experiential Discovery│
                            └───────────┬────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│     1. Interview     │     │   2. Micro-Project   │     │    3. Observation    │
│  (Informational Chat)│     │    (Short Course)    │     │  (Field Experience)  │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### Archetype 1: Informational Interview (`EXP-01-INTERVIEW`)
- **Type:** `interview`
- **Title (Lao):** ສົນທະນາກັບຜູ້ມີປະສົບການ (Informational Interview)
- **Description (Lao):** ລອງປຶກສາ ຫຼື ລົມກັບຜູ້ທີ່ກຳລັງເຮັດວຽກໃນສາຍທີ່ທ່ານສົນໃຈ ຖາມກ່ຽວກັບວຽກປະຈຳວັນ ແລະ ສິ່ງທີ່ຕ້ອງກຽມຕົວ.
- **Objective:** Gather qualitative reality checks regarding daily tasks, culture, challenges, and actual requirements directly from practitioners.

### Archetype 2: Micro-Project / Short Course (`EXP-02-MICROPROJECT`)
- **Type:** `micro_project`
- **Title (Lao):** ທົດລອງເຮັດໂປຣເຈັກນ້ອຍໆ (Micro-Project / Short Course)
- **Description (Lao):** ລົງມືເຮັດໂປຣເຈັກສັ້ນໆ 1–2 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍ ເພື່ອທົດສອບຄວາມມັກ ແລະ ຄວາມຖະໜັດຕົວຈິງ.
- **Objective:** Test cognitive engagement, learning curve, and direct satisfaction through tangible creation.

### Archetype 3: Real Observation / Community Event (`EXP-03-OBSERVATION`)
- **Type:** `observation`
- **Title (Lao):** ສັງເກດຕົວຈິງ ແລະ ເຂົ້າຮ່ວມກິດຈະກຳ (Real Observation)
- **Description (Lao):** ເຂົ້າຮ່ວມກິດຈະກຳ, ເວທີສຳມະນາ, ງານຝຶກອົບຮົມ ຫຼື ງານອາສາສະໝັກ ເພື່ອສຳຜັດບັນຍາກາດການເຮັດວຽກຕົວຈິງ.
- **Objective:** Experience the physical and social atmosphere of the professional domain first-hand.

---

## 3. Linkage to Exploration Paths

1. Every experiment links to the identified exploration path IDs (`path_group_ids`).
2. Every experiment aggregates the exact `source_question_ids` that justified the exploration directions.
3. Experiments do not rank or prioritize paths; they offer experiential testing ground for all paths identified from the user's responses.
