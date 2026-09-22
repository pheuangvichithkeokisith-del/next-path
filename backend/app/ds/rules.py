from typing import Dict, List, Optional, Set

from app.ds.dimensions import (
    CANONICAL_CLUSTERS,
    QUESTION_DESCRIPTIONS_LAO,
    SUBJECT_DOMAINS,
)
from app.ds.models import (
    DSAssessmentPayload,
    DSContextFactors,
    DSPattern,
    DSTension,
)


def extract_context_factors(payload: DSAssessmentPayload) -> DSContextFactors:
    """Extract and isolate self-reported demographics and constraints deterministically."""
    responses = payload.responses
    source_qids: List[str] = []

    # Demographics D1-D3
    age_band = payload.demographics.age_band
    age_band_code = payload.demographics.age_band_code
    if age_band_code or age_band:
        source_qids.append("D1")

    education_level = payload.demographics.education_level
    if education_level:
        source_qids.append("D2")

    province_code = payload.demographics.province_code
    province_name = payload.demographics.province_name
    if province_code or province_name:
        source_qids.append("D3")

    # Q22 Constraints
    has_constraints = False
    constraints_detail: List[str] = []
    q22 = responses.get("Q22")
    if q22 and q22.is_answered:
        source_qids.append("Q22")
        # Constraint options: Q22-O1 (time), Q22-O2 (family/home), Q22-O3 (health), Q22-O4 (commute)
        constraint_map = {
            "Q22-O1": "ມີເວລາຈຳກັດ (ຊ່ວຍຄອບຄົວ/ເຮັດວຽກ)",
            "Q22-O2": "ຕ້ອງຢູ່ໃກ້ເຮືອນ ຫຼື ເບິ່ງແຍງຄອບຄົວ",
            "Q22-O3": "ມີຂໍ້ຈຳກັດດ້ານສຸຂະພາບ",
            "Q22-O4": "ມີຂໍ້ຈຳກັດດ້ານການເດີນທາງ ຫຼື ໄລຍະທາງ",
        }
        for code in q22.option_codes:
            if code in constraint_map:
                has_constraints = True
                constraints_detail.append(constraint_map[code])

    # Q23 Relocation Willingness
    relocation_preference: Optional[str] = None
    q23 = responses.get("Q23")
    if q23 and q23.is_answered:
        source_qids.append("Q23")
        relocation_map = {
            "Q23-O1": "ພ້ອມຍ້າຍຕ່າງແຂວງ",
            "Q23-O2": "ອາດຍ້າຍ ຖ້າມີເງື່ອນໄຂທີ່ເໝາະສົມ",
            "Q23-O3": "ຢາກຢູ່ໃນພື້ນທີ່ປັດຈຸບັນ",
            "Q23-O4": "ຕອນນີ້ຍ້າຍບໍ່ໄດ້",
            "Q23-O5": "ຍັງບໍ່ແນ່ໃຈເລື່ອງການຍ້າຍ",
            "Q23-O6": "ບໍ່ຢາກຕອບເລື່ອງການຍ້າຍ",
        }
        for code in q23.option_codes:
            if code in relocation_map:
                relocation_preference = relocation_map[code]
                break

    return DSContextFactors(
        age_band=age_band,
        age_band_code=age_band_code,
        education_level=education_level,
        province_code=province_code or province_name,
        province_name=province_name,
        has_constraints=has_constraints,
        constraints_detail=constraints_detail,
        relocation_preference=relocation_preference,
        source_question_ids=source_qids,
    )


def extract_unknowns(payload: DSAssessmentPayload) -> List[str]:
    """Identify missing answers and explicit 'not sure' / 'prefer not to answer' states."""
    unknowns: List[str] = []
    responses = payload.responses

    # 1. Check unanswered / missing questions
    unanswered_qids = set(payload.missing_questions)
    for qid, resp in responses.items():
        if not resp.is_answered:
            unanswered_qids.add(qid)

    # Sort numerically by question ID (e.g. Q1, Q2, ..., Q28)
    def q_sort_key(q: str):
        if q.startswith("Q") and q[1:].isdigit():
            return (1, int(q[1:]))
        if q.startswith("D") and q[1:].isdigit():
            return (0, int(q[1:]))
        return (2, q)

    for qid in sorted(list(unanswered_qids), key=q_sort_key):
        desc = QUESTION_DESCRIPTIONS_LAO.get(qid, "ຄຳຖາມ")
        unknowns.append(f"{qid} ({desc} - ຍັງບໍ່ໄດ້ຕອບ)")

    # 2. Check explicit unsure / no evidence codes
    unsure_codes_map: Dict[str, str] = {
        "Q4-O9": "ບໍ່ຄ່ອຍໄດ້ເບິ່ງຄລິບ/ເນື້ອຫາ",
        "Q5-O8": "ຍັງບໍ່ເຄີຍມີໃຜຊົມເຊີຍເລື່ອງນີ້",
        "Q6-O9": "ຍັງບໍ່ແນ່ໃຈວ່າຈຸດແຂງແມ່ນຫຍັງ",
        "Q7-O8": "ຍັງບໍ່ມີຜົນງານທີ່ນຶກອອກ",
        "Q8-O9": "ຍັງບໍ່ແນ່ໃຈສິ່ງທີ່ສຳຄັນໃນການເຮັດວຽກ",
        "Q9-O7": "ຍັງບໍ່ແນ່ໃຈຮູບແບບທີ່ຢາກໃຫ້ຈື່ຈຳ",
        "Q10-O7": "ຍັງບໍ່ແນ່ໃຈຮູບແບບການເຮັດວຽກທີ່ເໝາະສົມ",
        "Q11-O6": "ຍັງບໍ່ແນ່ໃຈວິທີຮັບມືກັບບັນຫາໃໝ່",
        "Q12-O6": "ຍັງບໍ່ແນ່ໃຈວິທີຕັດສິນໃຈ",
        "Q13-O7": "ຍັງບໍ່ແນ່ໃຈສະພາບແວດລ້ອມທີ່ດີທີ່ສຸດ",
        "Q14-O12": "ຍັງບໍ່ແນ່ໃຈດ້ານທີ່ຢາກຮຽນເພີ່ມ",
        "Q15-O13": "ຍັງບໍ່ແນ່ໃຈດ້ານທີ່ຮູ້ສຶກຍາກ",
        "Q16-O7": "ຍັງບໍ່ແນ່ໃຈທິດທາງການຮຽນ/ພັດທະນາຕົນເອງ",
        "Q17-O5": "ຍັງບໍ່ແນ່ໃຈວິທີຮັບມືເມື່ອເຈີສິ່ງຍາກ",
        "Q18-O5": "ຍັງບໍ່ແນ່ໃຈວິທີຮຽນຮູ້ທີ່ເຂົ້າໃຈດີ",
        "Q19-O6": "ຍັງບໍ່ແນ່ໃຈເປົ້າໝາຍ 5 ປີ (ຢາກສຳຫຼວດກ່ອນ)",
        "Q20-O8": "ຍັງບໍ່ແນ່ໃຈດ້ານທີ່ຢາກສ້າງຜົນດີໃຫ້ສັງຄົມ",
        "Q21-O5": "ຍັງບໍ່ແນ່ໃຈຮູບແບບສະຖານທີ່ເຮັດວຽກ",
        "Q22-O6": "ຍັງບໍ່ແນ່ໃຈເລື່ອງຂໍ້ຈຳກັດ",
        "Q22-O7": "ບໍ່ຢາກຕອບເລື່ອງຂໍ້ຈຳກັດ",
        "Q23-O5": "ຍັງບໍ່ແນ່ໃຈເລື່ອງການຍ້າຍຕ່າງແຂວງ",
        "Q23-O6": "ບໍ່ຢາກຕອບເລື່ອງການຍ້າຍ",
    }

    for qid, resp in responses.items():
        if resp.is_answered:
            for code in resp.option_codes:
                if code in unsure_codes_map:
                    desc = QUESTION_DESCRIPTIONS_LAO.get(qid, "ຄຳຖາມ")
                    detail = unsure_codes_map[code]
                    unknown_entry = f"{qid} ({desc} — {detail})"
                    if unknown_entry not in unknowns:
                        unknowns.append(unknown_entry)

    return unknowns


def extract_response_patterns(payload: DSAssessmentPayload) -> List[DSPattern]:
    """Derive descriptive, traceable response patterns strictly based on user choices."""
    patterns: List[DSPattern] = []
    responses = payload.responses

    # Helper to fetch codes for a question
    def get_codes(qid: str) -> Set[str]:
        resp = responses.get(qid)
        return set(resp.option_codes) if resp and resp.is_answered else set()

    # --- Section: Interests ---
    int_q1 = get_codes("Q1")
    int_q2 = get_codes("Q2")
    int_q3 = get_codes("Q3")
    int_q4 = get_codes("Q4")

    # Tech & Computing Interest
    tech_int_sources = [
        qid for qid, codes in [("Q1", int_q1), ("Q2", int_q2), ("Q3", int_q3), ("Q4", int_q4)]
        if any(c in {"Q1-O2", "Q2-O1", "Q3-O3", "Q4-O1"} for c in codes)
    ]
    if tech_int_sources:
        patterns.append(
            DSPattern(
                pattern_id="PAT-INT-TECH",
                section="interests",
                label_lao="ຄວາມສົນໃຈດ້ານເທັກໂນໂລຊີ, ຄອມພິວເຕີ ແລະ ການສ້າງສັນຜົນງານດິຈິຕອນ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມສົນໃຈຕໍ່ເຄື່ອງມືເທັກໂນໂລຊີ, ໂປຣແກຣມ ຫຼື ອຸປະກອນດິຈິຕອນ",
                source_question_ids=tech_int_sources,
            )
        )

    # Analytical & Problem Solving Interest
    ana_int_sources = [
        qid for qid, codes in [("Q1", int_q1), ("Q2", int_q2), ("Q3", int_q3), ("Q4", int_q4)]
        if any(c in {"Q1-O3", "Q2-O2", "Q3-O1", "Q4-O2"} for c in codes)
    ]
    if ana_int_sources:
        patterns.append(
            DSPattern(
                pattern_id="PAT-INT-ANALYSIS",
                section="interests",
                label_lao="ຄວາມສົນໃຈດ້ານການຄິດວິເຄາະ, ວິທະຍາສາດ ແລະ ການແກ້ໄຂບັນຫາ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການສືບຄົ້ນສາເຫດ, ທົດລອງຫາຄຳຕອບ ແລະ ວິເຄາະຂໍ້ມູນ",
                source_question_ids=ana_int_sources,
            )
        )

    # Creative, Art & Design Interest
    cre_int_sources = [
        qid for qid, codes in [("Q1", int_q1), ("Q2", int_q2), ("Q3", int_q3), ("Q4", int_q4)]
        if any(c in {"Q1-O1", "Q1-O9", "Q2-O4", "Q3-O2", "Q4-O4"} for c in codes)
    ]
    if cre_int_sources:
        patterns.append(
            DSPattern(
                pattern_id="PAT-INT-CREATIVE",
                section="interests",
                label_lao="ຄວາມສົນໃຈດ້ານສິລະປະ, ການອອກແບບ ແລະ ງານສ້າງສັນ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການສ້າງສິ່ງໃໝ່, ການສະແດງອອກທາງຄວາມຄິດ ແລະ ການອອກແບບ",
                source_question_ids=cre_int_sources,
            )
        )

    # People, Communication & Helping Interest
    soc_int_sources = [
        qid for qid, codes in [("Q1", int_q1), ("Q2", int_q2), ("Q3", int_q3), ("Q4", int_q4)]
        if any(c in {"Q1-O5", "Q1-O6", "Q2-O3", "Q2-O6", "Q2-O9", "Q3-O5", "Q3-O6", "Q4-O5"} for c in codes)
    ]
    if soc_int_sources:
        patterns.append(
            DSPattern(
                pattern_id="PAT-INT-PEOPLE",
                section="interests",
                label_lao="ຄວາມສົນໃຈດ້ານການສື່ສານ, ການເຮັດວຽກກັບຄົນ ແລະ ການຊ່ວຍເຫຼືອສັງຄົມ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການສົນທະນາ, ແບ່ງປັນ, ເບິ່ງແຍງ ຫຼື ຮ່ວມມືກັບຜູ້ອື່ນ",
                source_question_ids=soc_int_sources,
            )
        )

    # Business, Trading & Management Interest
    biz_int_sources = [
        qid for qid, codes in [("Q1", int_q1), ("Q2", int_q2), ("Q3", int_q3), ("Q4", int_q4)]
        if any(c in {"Q1-O10", "Q2-O5", "Q3-O9", "Q4-O3"} for c in codes)
    ]
    if biz_int_sources:
        patterns.append(
            DSPattern(
                pattern_id="PAT-INT-BUSINESS",
                section="interests",
                label_lao="ຄວາມສົນໃຈດ້ານທຸລະກິດ, ການຈັດການ ແລະ ການວາງແຜນ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການຈັດການ, ການຊື້ຂາຍ, ການເງິນ ແລະ ການພັດທະນາໂຄງການ",
                source_question_ids=biz_int_sources,
            )
        )

    # Practical, Craft & Nature Interest
    pra_int_sources = [
        qid for qid, codes in [("Q1", int_q1), ("Q2", int_q2), ("Q3", int_q3), ("Q4", int_q4)]
        if any(c in {"Q1-O7", "Q1-O8", "Q2-O7", "Q3-O7", "Q4-O6"} for c in codes)
    ]
    if pra_int_sources:
        patterns.append(
            DSPattern(
                pattern_id="PAT-INT-PRACTICAL",
                section="interests",
                label_lao="ຄວາມສົນໃຈດ້ານງານປະຕິບັດຈິງ, ງານຊ່າງ ຫຼື ທຳມະຊາດ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການລົງມືເຮັດຕົວຈິງ, ກິດຈະກຳກາງແຈ້ງ ຫຼື ການເຮັດວຽກກັບວັດຖຸ/ທຳມະຊາດ",
                source_question_ids=pra_int_sources,
            )
        )

    # --- Section: Work Style ---
    ws_q10 = get_codes("Q10")
    ws_q11 = get_codes("Q11")
    ws_q12 = get_codes("Q12")
    ws_q13 = get_codes("Q13")

    # Independent / Autonomy orientation
    if "Q10-O1" in ws_q10 or "Q13-O2" in ws_q13:
        sources = [q for q, c in [("Q10", ws_q10), ("Q13", ws_q13)] if "Q10-O1" in c or "Q13-O2" in c]
        patterns.append(
            DSPattern(
                pattern_id="PAT-WS-INDEPENDENT",
                section="work_style",
                label_lao="ມັກການເຮັດວຽກແບບອິດສະຫຼະ ແລະ ມີຄວາມຄ່ອງຕົວ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການຮັບຜິດຊອບວຽກດ້ວຍຕົນເອງ ແລະ ມີອິດສະຫຼະໃນວິທີເຮັດວຽກ",
                source_question_ids=sources,
            )
        )

    # Team & Collaborative orientation
    if any(c in {"Q10-O2", "Q10-O3"} for c in ws_q10) or "Q13-O3" in ws_q13:
        sources = [q for q, c in [("Q10", ws_q10), ("Q13", ws_q13)] if any(x in {"Q10-O2", "Q10-O3", "Q13-O3"} for x in c)]
        patterns.append(
            DSPattern(
                pattern_id="PAT-WS-TEAM",
                section="work_style",
                label_lao="ມັກການເຮັດວຽກເປັນທີມ ແລະ ການປະສານງານຮ່ວມກັບຜູ້ອື່ນ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການແລກປ່ຽນຄວາມຄິດເຫັນ ແລະ ຮ່ວມມືກັນພາຍໃນທີມ",
                source_question_ids=sources,
            )
        )

    # Analytical / Systematic Problem Solving
    if any(c in {"Q11-O1", "Q11-O4"} for c in ws_q11) or "Q12-O1" in ws_q12 or "Q10-O4" in ws_q10:
        sources = [q for q, c in [("Q10", ws_q10), ("Q11", ws_q11), ("Q12", ws_q12)] if any(x in {"Q10-O4", "Q11-O1", "Q11-O4", "Q12-O1"} for x in c)]
        patterns.append(
            DSPattern(
                pattern_id="PAT-WS-ANALYTICAL",
                section="work_style",
                label_lao="ແກ້ໄຂບັນຫາ ແລະ ຕັດສິນໃຈໂດຍອີງໃສ່ຂໍ້ມູນ ແລະ ການວິເຄາະ",
                description_lao="ຄຳຕອບສະທ້ອນການຄົ້ນຫາຂໍ້ມູນ, ແຍກແຍະໂຄງສ້າງບັນຫາ ແລະ ຕັດສິນໃຈຢ່າງມີເຫດຜົນ",
                source_question_ids=sources,
            )
        )

    # Experimental / Action-oriented Problem Solving
    if any(c in {"Q11-O2", "Q11-O5"} for c in ws_q11) or "Q12-O3" in ws_q12 or "Q13-O6" in ws_q13:
        sources = [q for q, c in [("Q11", ws_q11), ("Q12", ws_q12), ("Q13", ws_q13)] if any(x in {"Q11-O2", "Q11-O5", "Q12-O3", "Q13-O6"} for x in c)]
        patterns.append(
            DSPattern(
                pattern_id="PAT-WS-EXPERIMENTAL",
                section="work_style",
                label_lao="ມັກການທົດລອງຫາວິທີໃໝ່ ແລະ ຮຽນຮູ້ຈາກການລົງມືເຮັດຕົວຈິງ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມມັກໃນການທົດສອບວິທີຕ່າງໆ ແລະ ຕັດສິນໃຈຈາກຜົນຕົວຈິງ",
                source_question_ids=sources,
            )
        )

    # --- Section: Values ---
    val_q8 = get_codes("Q8")
    val_q9 = get_codes("Q9")

    # Mastery & Expertise
    if "Q8-O5" in val_q8 or "Q9-O1" in val_q9:
        sources = [q for q, c in [("Q8", val_q8), ("Q9", val_q9)] if "Q8-O5" in c or "Q9-O1" in c]
        patterns.append(
            DSPattern(
                pattern_id="PAT-VAL-MASTERY",
                section="values",
                label_lao="ໃຫ້ຄຸນຄ່າກັບຄວາມຊ່ຽວຊານ ແລະ ການພັດທະນາຕົນເອງຈົນເກັ່ງ",
                description_lao="ຄຳຕອບສະທ້ອນເປົ້າໝາຍໃນການຮຽນຮູ້ຢ່າງເລິກເຊິ່ງ ແລະ ການເປັນຜູ້ຊ່ຽວຊານໃນສາຂາວິຊາ",
                source_question_ids=sources,
            )
        )

    # Innovation & Creation
    if any(c in {"Q8-O1", "Q8-O4"} for c in val_q8) or "Q9-O2" in val_q9:
        sources = [q for q, c in [("Q8", val_q8), ("Q9", val_q9)] if any(x in {"Q8-O1", "Q8-O4", "Q9-O2"} for x in c)]
        patterns.append(
            DSPattern(
                pattern_id="PAT-VAL-INNOVATION",
                section="values",
                label_lao="ໃຫ້ຄຸນຄ່າກັບການສ້າງສິ່ງໃໝ່ໆ ແລະ ຄວາມທ້າທາຍ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມຕ້ອງການສ້າງຜົນງານດ້ວຍຄວາມຄິດຂອງຕົນເອງ ແລະ ພົບໂຈດທີ່ແປກໃໝ່",
                source_question_ids=sources,
            )
        )

    # Social Contribution
    if "Q8-O3" in val_q8 or "Q9-O3" in val_q9:
        sources = [q for q, c in [("Q8", val_q8), ("Q9", val_q9)] if "Q8-O3" in c or "Q9-O3" in c]
        patterns.append(
            DSPattern(
                pattern_id="PAT-VAL-IMPACT",
                section="values",
                label_lao="ໃຫ້ຄຸນຄ່າກັບການຊ່ວຍເຫຼືອຜູ້ອື່ນ ແລະ ສ້າງປະໂຫຍດໃຫ້ສັງຄົມ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມປາດຖະໜາທີ່ຈະສ້າງຜົນດີຕໍ່ຊຸມຊົນ ແລະ ຜູ້ຄົນອ້ອມຂ້າງ",
                source_question_ids=sources,
            )
        )

    # Stability & Success
    if "Q8-O2" in val_q8 or "Q9-O4" in val_q9:
        sources = [q for q, c in [("Q8", val_q8), ("Q9", val_q9)] if "Q8-O2" in c or "Q9-O4" in c]
        patterns.append(
            DSPattern(
                pattern_id="PAT-VAL-STABILITY",
                section="values",
                label_lao="ໃຫ້ຄຸນຄ່າກັບຄວາມໝັ້ນຄົງ ແລະ ຄວາມສຳເລັດໃນໜ້າທີ່ການງານ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມຕ້ອງການເສັ້ນທາງທີ່ໝັ້ນຄົງ ແລະ ຜົນສຳເລັດທີ່ແນ່ນອນ",
                source_question_ids=sources,
            )
        )

    # --- Section: Learning Style ---
    lrn_q18 = get_codes("Q18")
    lrn_q17 = get_codes("Q17")

    if "Q18-O1" in lrn_q18:
        patterns.append(
            DSPattern(
                pattern_id="PAT-LRN-HANDSON",
                section="learning",
                label_lao="ຮຽນຮູ້ໄດ້ດີທີ່ສຸດເມື່ອໄດ້ລົງມືປະຕິບັດ ແລະ ຝຶກຝົນຕົວຈິງ",
                description_lao="ຄຳຕອບສະທ້ອນການຮຽນຮູ້ຜ່ານປະສົບການກົງ ແລະ ການທົດລອງເຮັດ",
                source_question_ids=["Q18"],
            )
        )
    elif "Q18-O2" in lrn_q18:
        patterns.append(
            DSPattern(
                pattern_id="PAT-LRN-THEORY",
                section="learning",
                label_lao="ຮຽນຮູ້ໄດ້ດີຈາກການອ່ານ, ຟັງ ແລະ ເຂົ້າໃຈຫຼັກການພື້ນຖານ",
                description_lao="ຄຳຕອບສະທ້ອນການຮຽນຮູ້ຜ່ານໂຄງສ້າງທິດສະດີ ແລະ ຄວາມເຂົ້າໃຈລະບົບ",
                source_question_ids=["Q18"],
            )
        )
    elif "Q18-O3" in lrn_q18:
        patterns.append(
            DSPattern(
                pattern_id="PAT-LRN-EXAMPLES",
                section="learning",
                label_lao="ຮຽນຮູ້ໄດ້ດີຈາກການສັງເກດຕົວຢ່າງແລ້ວນຳມາປັບໃຊ້",
                description_lao="ຄຳຕອບສະທ້ອນການຮຽນຮູ້ຜ່ານການເບິ່ງຕົ້ນແບບ ແລະ ການເຮັດຕາມຕົວຢ່າງ",
                source_question_ids=["Q18"],
            )
        )
    elif "Q18-O4" in lrn_q18:
        patterns.append(
            DSPattern(
                pattern_id="PAT-LRN-GROUP",
                section="learning",
                label_lao="ຮຽນຮູ້ໄດ້ດີຈາກການສົນທະນາ ແລະ ແລກປ່ຽນກັບກຸ່ມ",
                description_lao="ຄຳຕອບສະທ້ອນການຮຽນຮູ້ຜ່ານການມີປະຕິສຳພັນ ແລະ ການປຶກສາຫາລື",
                source_question_ids=["Q18"],
            )
        )

    # --- Section: Journey Orientation ---
    jrn_q24 = get_codes("Q24")
    jrn_q26 = get_codes("Q26")
    jrn_q27 = get_codes("Q27")

    if "Q24-O2" in jrn_q24 or "Q26-O3" in jrn_q26 or "Q27-O4" in jrn_q27:
        sources = [q for q, c in [("Q24", jrn_q24), ("Q26", jrn_q26), ("Q27", jrn_q27)] if any(x in {"Q24-O2", "Q26-O3", "Q27-O4"} for x in c)]
        patterns.append(
            DSPattern(
                pattern_id="PAT-JRN-ADAPTIVE",
                section="journey",
                label_lao="ມີແນວທາງແບບທົດລອງ ແລະ ປັບປ່ຽນຕາມສະຖານະການ",
                description_lao="ຄຳຕອບສະທ້ອນຄວາມຢືດຢຸ່ນໃນການປັບວິທີ ແລະ ທົດລອງຂັ້ນຕອນນ້ອຍໆ",
                source_question_ids=sources,
            )
        )

    return patterns


def detect_tensions(payload: DSAssessmentPayload) -> List[DSTension]:
    """Preserve meaningful conflicts between answers as explicit self-reflection points."""
    tensions: List[DSTension] = []
    responses = payload.responses

    def get_codes(qid: str) -> Set[str]:
        resp = responses.get(qid)
        return set(resp.option_codes) if resp and resp.is_answered else set()

    q10_codes = get_codes("Q10")
    q13_codes = get_codes("Q13")
    q14_codes = get_codes("Q14")
    q15_codes = get_codes("Q15")
    q8_codes = get_codes("Q8")
    q9_codes = get_codes("Q9")
    q19_codes = get_codes("Q19")
    q21_codes = get_codes("Q21")
    q22_codes = get_codes("Q22")
    q23_codes = get_codes("Q23")
    q26_codes = get_codes("Q26")

    # Tension 1: Interest vs Perceived Difficulty in same subject area
    for domain_key, domain_info in SUBJECT_DOMAINS.items():
        if domain_info["q14"] in q14_codes and domain_info["q15"] in q15_codes:
            label = domain_info["label"]
            tensions.append(
                DSTension(
                    tension_id=f"TENSION-INTEREST-DIFFICULTY-{domain_key.upper()}",
                    title_lao=f"ຄວາມສົນໃຈ ແລະ ຄວາມຮູ້ສຶກຍາກໃນດ້ານ '{label}'",
                    description_lao=(
                        f"ທ່ານໄດ້ລະບຸຄວາມສົນໃຈຢາກຮຽນຮູ້ດ້ານ '{label}' (Q14) "
                        f"ແຕ່ກໍລະບຸວ່າຍາກ ຫຼື ຍັງບໍ່ໝັ້ນໃຈໃນດ້ານດຽວກັນນີ້ (Q15). "
                        f"ນີ້ເປັນໂອກາດສຳຫຼວດວ່າຄວາມຍາກນັ້ນມາຈາກພື້ນຖານ, ວິທີການຮຽນ ຫຼື ປະສົບການທີ່ຜ່ານມາ."
                    ),
                    source_question_ids=["Q14", "Q15"],
                )
            )

    # Tension 2: Solo Work Style vs Collaborative Environment
    if "Q10-O1" in q10_codes and "Q13-O3" in q13_codes:
        tensions.append(
            DSTension(
                tension_id="TENSION-WORKSTYLE-SOLO-VS-TEAM-ENV",
                title_lao="ຮູບແບບການເຮັດວຽກຄົນດຽວ ທຽບກັບ ສະພາບແວດລ້ອມການຮ່ວມມືເປັນທີມ",
                description_lao=(
                    "ທ່ານລະບຸວ່າມັກເຮັດວຽກຄົນດຽວ (Q10) ແຕ່ກໍເລືອກວ່າເຮັດວຽກໄດ້ດີທີ່ສຸດໃນສະພາບແວດລ້ອມທີ່ໄດ້ຮ່ວມມືກັບຄົນອື່ນ (Q13). "
                    "ສະທ້ອນວ່າທ່ານອາດມັກການຮັບຜິດຊອບໜ້າວຽກສ່ວນຕົວຢ່າງອິດສະຫຼະ ພາຍໃຕ້ທີມທີ່ອົບອຸ່ນ."
                ),
                source_question_ids=["Q10", "Q13"],
            )
        )
    elif "Q10-O2" in q10_codes and "Q13-O4" in q13_codes:
        tensions.append(
            DSTension(
                tension_id="TENSION-WORKSTYLE-TEAM-VS-QUIET-ENV",
                title_lao="ຮູບແບບການເຮັດວຽກເປັນທີມ ທຽບກັບ ສະພາບແວດລ້ອມທີ່ງຽບສະຫງົບ",
                description_lao=(
                    "ທ່ານລະບຸວ່າມັກເຮັດວຽກເປັນທີມ (Q10) ແຕ່ກໍເລືອກສະພາບແວດລ້ອມທີ່ງຽບ ແລະ ມີສະມາທິສູງ (Q13)."
                ),
                source_question_ids=["Q10", "Q13"],
            )
        )

    # Tension 3: Long-term Mastery Goal vs Immediate Short-term Return
    has_mastery_goal = "Q8-O5" in q8_codes or "Q9-O1" in q9_codes or "Q19-O4" in q19_codes
    if has_mastery_goal and "Q26-O2" in q26_codes:
        sources = [q for q, c in [("Q8", q8_codes), ("Q9", q9_codes), ("Q19", q19_codes)] if any(x in {"Q8-O5", "Q9-O1", "Q19-O4"} for x in c)]
        sources.append("Q26")
        tensions.append(
            DSTension(
                tension_id="TENSION-GOAL-MASTERY-VS-SHORTTERM",
                title_lao="ເປົ້າໝາຍຄວາມຊ່ຽວຊານໄລຍະຍາວ ທຽບກັບ ຄວາມຕ້ອງການເຫັນຜົນໃນໄລຍະສັ້ນ",
                description_lao=(
                    "ທ່ານຕັ້ງເປົ້າໝາຍໃນການພັດທະນາຄວາມຊ່ຽວຊານລະດັບສູງ ແຕ່ກໍຕ້ອງການເຫັນຜົນຄືບໜ້າໃນໄລຍະສັ້ນ (Q26). "
                    "ການແບ່ງເປົ້າໝາຍໃຫຍ່ອອກເປັນບາດກ້າວນ້ອຍໆ (Milestones) ຈະຊ່ວຍຮັກສາພະລັງໃຈໄດ້ດີ."
                ),
                source_question_ids=sources,
            )
        )

    # Tension 4: Location/Mobility Ambition vs Relocation Constraints
    wants_mobility = "Q21-O1" in q21_codes or "Q21-O3" in q21_codes
    has_relocation_obstacle = "Q23-O4" in q23_codes or "Q22-O2" in q22_codes
    if wants_mobility and has_relocation_obstacle:
        sources = ["Q21"]
        if "Q22-O2" in q22_codes:
            sources.append("Q22")
        if "Q23-O4" in q23_codes:
            sources.append("Q23")
        tensions.append(
            DSTension(
                tension_id="TENSION-LOCATION-AMBITION-VS-CONSTRAINT",
                title_lao="ຄວາມຕ້ອງການດ້ານສະຖານທີ່ ທຽບກັບ ຂໍ້ຈຳກັດການຍ້າຍຕົວຈິງ",
                description_lao=(
                    "ທ່ານສົນໃຈໂອກາດໃນຕົວເມືອງໃຫຍ່ ຫຼື ຕ່າງແຂວງ (Q21) ແຕ່ໃນປັດຈຸບັນມີຂໍ້ຈຳກັດດ້ານການຍ້າຍ ຫຼື ການເບິ່ງແຍງຄອບຄົວ (Q22/Q23). "
                    "ການເລີ່ມຕົ້ນດ້ວຍການຮຽນ ຫຼື ເຮັດວຽກທາງໄກ (Remote) ອາດເປັນທາງເລືອກເຊື່ອມຕໍ່ທີ່ເໝາະສົມ."
                ),
                source_question_ids=sources,
            )
        )

    return tensions
