from typing import List

from app.ds.models import DSExperiment, DSPath


def get_default_experiments(paths: List[DSPath]) -> List[DSExperiment]:
    """Provide structured 'Try Before Decide' low-stakes experiential discovery actions.
    
    Adheres strictly to standard experiment archetypes defined in the project:
    1. Informational Interview (ສົນທະນາ)
    2. Micro-Project / Online Course (ທົດລອງນ້ອຍໆ)
    3. Real Observation / Community Event (ສັງເກດຕົວຈິງ)
    """
    path_group_ids = [p.group_id for p in paths]
    all_source_qids = sorted(list({qid for p in paths for qid in p.source_question_ids}))

    return [
        DSExperiment(
            experiment_id="EXP-01-INTERVIEW",
            type="interview",
            title_lao="ສົນທະນາກັບຜູ້ມີປະສົບການ (Informational Interview)",
            description_lao="ລອງປຶກສາ ຫຼື ລົມກັບຜູ້ທີ່ກຳລັງເຮັດວຽກໃນສາຍທີ່ທ່ານສົນໃຈ ຖາມກ່ຽວກັບວຽກປະຈຳວັນ ແລະ ສິ່ງທີ່ຕ້ອງກຽມຕົວ",
            path_group_ids=path_group_ids,
            source_question_ids=all_source_qids,
        ),
        DSExperiment(
            experiment_id="EXP-02-MICROPROJECT",
            type="micro_project",
            title_lao="ທົດລອງເຮັດໂປຣເຈັກນ້ອຍໆ (Micro-Project / Short Course)",
            description_lao="ລົງມືເຮັດໂປຣເຈັກສັ້ນໆ 1–2 ອາທິດ ຫຼື ຮຽນຄອສຟຣີອອນລາຍ ເພື່ອທົດສອບຄວາມມັກ ແລະ ຄວາມຖະໜັດຕົວຈິງ",
            path_group_ids=path_group_ids,
            source_question_ids=all_source_qids,
        ),
        DSExperiment(
            experiment_id="EXP-03-OBSERVATION",
            type="observation",
            title_lao="ສັງເກດຕົວຈິງ ແລະ ເຂົ້າຮ່ວມກິດຈະກຳ (Real Observation)",
            description_lao="ເຂົ້າຮ່ວມກິດຈະກຳ, ເວທີສຳມະນາ, ງານຝຶກອົບຮົມ ຫຼື ງານອາສາສະໝັກ ເພື່ອສຳຜັດບັນຍາກາດການເຮັດວຽກຕົວຈິງ",
            path_group_ids=path_group_ids,
            source_question_ids=all_source_qids,
        ),
    ]
