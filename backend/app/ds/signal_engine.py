"""PathAI Signal Aggregation Engine (v1.0)

Implements deterministic signal weighting, multi-select normalization,
soft negative reduction, feasibility penalties with province context,
confidence calculation with fluctuation adjustments, expanded tension detection,
and path classification for Lao youth career self-reflection.
"""

from typing import Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, Field

# 7 Canonical Clusters
CLUSTERS = {
    "C1": "ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ",
    "C2": "ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ",
    "C3": "ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ",
    "C4": "ສາຍສື່ສານ, ສັງຄົມ ແລະ ການພັດທະນາຄົນ",
    "C5": "ສາຍສຸຂະພາບ, ການແພດ ແລະ ການເບິ່ງແຍງ",
    "C6": "ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ",
    "C7": "ສາຍງານປະຕິບັດ, ງານຊ່າງ ແລະ ທຳມະຊາດ",
}

SECTION_WEIGHTS = {
    "skills": 0.25,
    "learning": 0.22,
    "interests": 0.20,
    "goals": 0.15,
    "values": 0.09,
    "work_style": 0.09,
}

SECTION_QUESTIONS = {
    "skills": ["Q5", "Q6", "Q7"],
    "learning": ["Q14", "Q16"],
    "interests": ["Q1", "Q2", "Q3", "Q4"],
    "goals": ["Q19", "Q20"],
    "values": ["Q8", "Q9"],
    "work_style": ["Q10", "Q11", "Q12", "Q13"],
}

NON_SCORING_QUESTIONS = ["Q17", "Q18", "Q21", "Q22", "Q23", "Q24", "Q25", "Q26", "Q27", "Q28"]

QUESTION_TYPE: Dict[str, str] = {
    "Q1": "multi", "Q2": "single", "Q3": "single", "Q4": "multi",
    "Q5": "single", "Q6": "multi", "Q7": "single",
    "Q8": "multi", "Q9": "single",
    "Q10": "single", "Q11": "single", "Q12": "single", "Q13": "multi",
    "Q14": "multi", "Q15": "multi", "Q16": "single", "Q17": "single", "Q18": "single",
    "Q19": "single", "Q20": "multi", "Q21": "single", "Q22": "multi", "Q23": "single",
    "Q24": "single", "Q25": "single", "Q26": "single", "Q27": "single", "Q28": "single",
}

UNCERTAIN_OPTION_CODES: Set[str] = {
    "Q1-O11", "Q2-O10", "Q3-O10", "Q4-O9", "Q4-O10",
    "Q5-O8", "Q5-O9", "Q6-O9", "Q6-O10", "Q7-O8",
    "Q8-O9", "Q9-O7", "Q10-O7", "Q11-O6", "Q12-O6", "Q13-O7",
    "Q14-O12", "Q14-O13", "Q15-O13", "Q16-O7", "Q17-O5", "Q18-O5",
    "Q19-O6", "Q20-O8", "Q21-O5", "Q22-O6", "Q23-O5",
}

PREFER_NOT_OPTION_CODES: Set[str] = {
    "Q22-O7", "Q23-O6",
}

NO_SIGNAL_CODES: Set[str] = {
    "Q4-O8",   # ຄວາມບັນເທີງທົ່ວໄປ
    "Q15-O12", # ບໍ່ມີ (ດ້ານທີ່ຍາກ)
    "Q22-O5",  # ບໍ່ມີຂໍ້ຈຳກັດ
}

POSITIVE_SIGNALS: Dict[str, Dict[str, Dict[str, int]]] = {
    "Q1": {
        "Q1-O1": {"C3": 3, "C7": 2},
        "Q1-O2": {"C2": 3},
        "Q1-O3": {"C1": 3, "C2": 2},
        "Q1-O4": {"C1": 2, "C4": 1},
        "Q1-O5": {"C4": 3, "C6": 1},
        "Q1-O6": {"C5": 3, "C4": 2},
        "Q1-O7": {"C7": 3},
        "Q1-O8": {"C7": 3},
        "Q1-O9": {"C3": 3},
        "Q1-O10": {"C6": 3},
        "Q1-O11": {},
    },
    "Q2": {
        "Q2-O1": {"C2": 3, "C1": 1},
        "Q2-O2": {"C1": 3},
        "Q2-O3": {"C4": 3},
        "Q2-O4": {"C3": 3},
        "Q2-O5": {"C6": 3},
        "Q2-O6": {"C4": 3, "C5": 2},
        "Q2-O7": {"C7": 3},
        "Q2-O8": {"C5": 3},
        "Q2-O9": {"C4": 3, "C1": 1},
        "Q2-O10": {},
    },
    "Q3": {
        "Q3-O1": {"C1": 3},
        "Q3-O2": {"C3": 3},
        "Q3-O3": {"C2": 3, "C7": 1},
        "Q3-O4": {"C1": 2, "C4": 1},
        "Q3-O5": {"C4": 3, "C3": 1},
        "Q3-O6": {"C4": 3, "C5": 1},
        "Q3-O7": {"C7": 3},
        "Q3-O8": {"C1": 3, "C2": 2},
        "Q3-O9": {"C6": 3},
        "Q3-O10": {},
    },
    "Q4": {
        "Q4-O1": {"C2": 3},
        "Q4-O2": {"C1": 3, "C2": 1},
        "Q4-O3": {"C6": 3},
        "Q4-O4": {"C3": 3},
        "Q4-O5": {"C4": 3, "C5": 1},
        "Q4-O6": {"C7": 3},
        "Q4-O7": {"C1": 1, "C4": 1},
        "Q4-O8": {},
        "Q4-O9": {},
        "Q4-O10": {},
    },
    "Q5": {
        "Q5-O1": {"C1": 3},
        "Q5-O2": {"C2": 3},
        "Q5-O3": {"C4": 3},
        "Q5-O4": {"C3": 3},
        "Q5-O5": {"C4": 2, "C5": 2},
        "Q5-O6": {"C6": 3},
        "Q5-O7": {"C7": 3},
        "Q5-O8": {},
        "Q5-O9": {},
    },
    "Q6": {
        "Q6-O1": {"C1": 3},
        "Q6-O2": {"C2": 3},
        "Q6-O3": {"C4": 3},
        "Q6-O4": {"C4": 3},
        "Q6-O5": {"C3": 3},
        "Q6-O6": {"C4": 2},
        "Q6-O7": {"C6": 3},
        "Q6-O8": {"C7": 3},
        "Q6-O9": {},
        "Q6-O10": {},
    },
    "Q7": {
        "Q7-O1": {"C1": 1},
        "Q7-O2": {"C3": 1},
        "Q7-O3": {"C6": 2, "C7": 1},
        "Q7-O4": {"C4": 3},
        "Q7-O5": {"C6": 2},
        "Q7-O6": {"C7": 2},
        "Q7-O7": {"C2": 3},
        "Q7-O8": {},
    },
    "Q8": {
        "Q8-O1": {"C1": 1, "C2": 1},
        "Q8-O2": {},
        "Q8-O3": {"C4": 2, "C5": 2},
        "Q8-O4": {"C3": 2, "C6": 1},
        "Q8-O5": {"C1": 1, "C2": 1},
        "Q8-O6": {"C6": 2, "C4": 1},
        "Q8-O7": {},
        "Q8-O8": {"C4": 2},
        "Q8-O9": {},
    },
    "Q9": {
        "Q9-O1": {"C1": 1, "C2": 1},
        "Q9-O2": {"C3": 2, "C2": 1},
        "Q9-O3": {"C4": 2, "C5": 2},
        "Q9-O4": {"C6": 2},
        "Q9-O5": {"C6": 2, "C4": 1},
        "Q9-O6": {},
        "Q9-O7": {},
    },
    "Q10": {
        "Q10-O1": {"C1": 1, "C3": 1},
        "Q10-O2": {"C4": 1},
        "Q10-O3": {"C4": 2, "C6": 1},
        "Q10-O4": {"C1": 3},
        "Q10-O5": {"C3": 3},
        "Q10-O6": {},
        "Q10-O7": {},
    },
    "Q11": {
        "Q11-O1": {"C1": 2},
        "Q11-O2": {"C1": 1, "C7": 1},
        "Q11-O3": {"C4": 1},
        "Q11-O4": {"C1": 2},
        "Q11-O5": {"C1": 1, "C2": 1, "C3": 1},
        "Q11-O6": {},
    },
    "Q12": {
        "Q12-O1": {"C1": 3},
        "Q12-O2": {"C4": 1},
        "Q12-O3": {"C1": 1, "C7": 1},
        "Q12-O4": {"C3": 1},
        "Q12-O5": {"C1": 1},
        "Q12-O6": {},
    },
    "Q13": {
        "Q13-O1": {"C1": 1},
        "Q13-O2": {"C3": 1, "C2": 1},
        "Q13-O3": {"C4": 2},
        "Q13-O4": {"C1": 1, "C2": 1},
        "Q13-O5": {"C2": 1, "C6": 1},
        "Q13-O6": {"C7": 3},
        "Q13-O7": {},
    },
    "Q14": {
        "Q14-O1": {"C1": 3, "C2": 1},
        "Q14-O2": {"C1": 2},
        "Q14-O3": {"C2": 3},
        "Q14-O4": {"C4": 3},
        "Q14-O5": {"C4": 2},
        "Q14-O6": {"C6": 3},
        "Q14-O7": {"C3": 3},
        "Q14-O8": {"C3": 3},
        "Q14-O9": {"C5": 3},
        "Q14-O10": {"C7": 2, "C5": 1},
        "Q14-O11": {"C7": 3},
        "Q14-O12": {},
        "Q14-O13": {},
    },
    "Q16": {
        "Q16-O1": {"C5": 2, "C1": 2},
        "Q16-O2": {"C2": 3},
        "Q16-O3": {"C6": 3},
        "Q16-O4": {"C4": 3},
        "Q16-O5": {"C3": 3},
        "Q16-O6": {"C7": 3},
        "Q16-O7": {},
    },
    "Q19": {
        "Q19-O1": {},
        "Q19-O2": {},
        "Q19-O3": {"C6": 3},
        "Q19-O4": {"C1": 1, "C2": 1},
        "Q19-O5": {"C4": 2, "C5": 1},
        "Q19-O6": {},
    },
    "Q20": {
        "Q20-O1": {"C4": 3},
        "Q20-O2": {"C7": 2},
        "Q20-O3": {"C5": 3},
        "Q20-O4": {"C4": 2},
        "Q20-O5": {"C2": 3, "C1": 1},
        "Q20-O6": {"C6": 3},
        "Q20-O7": {"C3": 3},
        "Q20-O8": {},
    },
}

NEGATIVE_SIGNALS: Dict[str, Dict[str, int]] = {
    "Q15-O1": {"C1": 3, "C2": 2},
    "Q15-O2": {"C1": 2, "C5": 1},
    "Q15-O3": {"C2": 3},
    "Q15-O4": {"C4": 3},
    "Q15-O5": {"C4": 2},
    "Q15-O6": {"C6": 3},
    "Q15-O7": {"C3": 3},
    "Q15-O8": {"C3": 2},
    "Q15-O9": {"C5": 3},
    "Q15-O10": {"C7": 2},
    "Q15-O11": {"C7": 3},
    "Q15-O12": {},
    "Q15-O13": {},
}

LOCATION_SENSITIVITY: Dict[str, str] = {
    "C1": "low", "C2": "medium", "C3": "medium", "C4": "low", "C5": "high", "C6": "low", "C7": "low"
}
TIME_SENSITIVITY: Dict[str, str] = {
    "C1": "medium", "C2": "medium", "C3": "low", "C4": "low", "C5": "high", "C6": "low", "C7": "low"
}
PHYSICAL_SENSITIVITY: Dict[str, str] = {
    "C1": "low", "C2": "low", "C3": "low", "C4": "low", "C5": "medium", "C6": "low", "C7": "high"
}

FEASIBILITY_PENALTIES: Dict[str, Dict[str, int]] = {
    "time": {"high": 10, "medium": 6, "low": 2},
    "near_home": {"high": 12, "medium": 8, "low": 3},
    "health": {"high": 12, "medium": 6, "low": 2},
    "travel": {"high": 10, "medium": 5, "low": 2},
    "maybe_move": {"high": 4, "medium": 2, "low": 0},
    "stay_current": {"high": 10, "medium": 5, "low": 2},
    "cannot_move": {"high": 18, "medium": 10, "low": 4},
}

STUDY_PATH_MAPPING: Dict[str, List[str]] = {
    "C1": ["ວິທະຍາສາດ ແລະ ຄະນິດສາດ", "ສະຖິຕິ", "ວິທະຍາສາດຂໍ້ມູນ", "ຟີຊິກ", "ເຄມີ"],
    "C2": ["ເທັກໂນໂລຊີ ແລະ ຄອມພິວເຕີ", "ວິທະຍາການຄອມພິວເຕີ", "ເທັກໂນໂລຊີສາລະສົນເທດ", "ວິສະວະກຳຊອບແວ"],
    "C3": ["ສິລະປະ ແລະ ການອອກແບບ", "ວິຈິດສິນ", "ການອອກແບບກຣາຟິກ", "ມັນຕິມີເດຍ"],
    "C4": ["ພາສາ ແລະ ການສື່ສານ", "ນິເທດສາດ", "ພາສາສາດ", "ສັງຄົມ ແລະ ມະນຸດສາດ", "ຈິດຕະວິທະຍາ", "ສັງຄົມສົງເຄາະ"],
    "C5": ["ສຸຂະພາບ ແລະ ການແພດ", "ແພດສາດ", "ພະຍາບານ", "ສາທາລະນະສຸກ"],
    "C6": ["ທຸລະກິດ ແລະ ເສດຖະສາດ", "ບໍລິຫານທຸລະກິດ", "ການຕະຫຼາດ", "ເສດຖະສາດ", "ການຈັດການ"],
    "C7": ["ງານປະຕິບັດ ແລະ ງານຊ່າງ", "ວິສະວະກຳເຕັກນິກ", "ກະສິກຳ ແລະ ທຳມະຊາດ", "ວິທະຍາສາດການກິລາ"],
}


class ClusterEvaluation(BaseModel):
    cluster_id: str
    label_lao: str
    raw_fit: float
    negative_factor: float
    adjusted_fit: float
    feasibility_score: float
    strong_sections_count: int
    classification: str  # "core", "secondary", "exploratory", "caution", "low_fit"
    matched_qids: List[str]
    study_paths: List[str]
    detected_tensions: List[str] = Field(default_factory=list)


class EngineEvaluationResult(BaseModel):
    cluster_evaluations: Dict[str, ClusterEvaluation]
    confidence_score: float
    detected_tensions: List[Dict[str, str]]
    core_paths: List[ClusterEvaluation]
    secondary_paths: List[ClusterEvaluation]
    exploratory_paths: List[ClusterEvaluation]
    caution_paths: List[ClusterEvaluation]


def evaluate_signals(
    answers_by_qid: Dict[str, List[str]],
    demographics: Optional[Dict[str, str]] = None,
) -> EngineEvaluationResult:
    """Execute the refined PathAI Signal Aggregation Engine (v1.0)."""
    demographics = demographics or {}
    d3 = demographics.get("province_code") or demographics.get("D3", "")
    all_selected: Set[str] = set()
    for opts in answers_by_qid.values():
        all_selected.update(opts)

    # 1. Unknowns & Prefer Not count
    unknown_count = sum(
        1 for opts in answers_by_qid.values() for opt in opts if opt in UNCERTAIN_OPTION_CODES
    )
    prefer_not_count = sum(
        1 for opts in answers_by_qid.values() for opt in opts if opt in PREFER_NOT_OPTION_CODES
    )

    # 2. Section scoring with multi-select normalization
    section_scores: Dict[str, Dict[str, float]] = {
        s: {c: 0.0 for c in CLUSTERS} for s in SECTION_WEIGHTS
    }
    cluster_matched_qids: Dict[str, Set[str]] = {c: set() for c in CLUSTERS}
    section_strong_count: Dict[str, int] = {c: 0 for c in CLUSTERS}
    section_positive_count: Dict[str, int] = {c: 0 for c in CLUSTERS}

    for sec_name, qids in SECTION_QUESTIONS.items():
        for c in CLUSTERS:
            sec_q_scores: List[float] = []
            for qid in qids:
                selected_opts = answers_by_qid.get(qid, [])
                valid_opts = [
                    opt for opt in selected_opts
                    if opt not in UNCERTAIN_OPTION_CODES
                    and opt not in PREFER_NOT_OPTION_CODES
                    and opt not in NO_SIGNAL_CODES
                ]
                if not valid_opts:
                    sec_q_scores.append(0.0)
                    continue

                raw_pts = sum(
                    POSITIVE_SIGNALS.get(qid, {}).get(opt, {}).get(c, 0)
                    for opt in valid_opts
                )
                norm_q = min(1.0, float(raw_pts) / 3.0)

                if raw_pts > 0:
                    cluster_matched_qids[c].add(qid)
                sec_q_scores.append(norm_q)

            avg_sec_score = sum(sec_q_scores) / len(qids) if qids else 0.0
            section_scores[sec_name][c] = avg_sec_score
            if avg_sec_score >= 0.55:
                section_strong_count[c] += 1
            if avg_sec_score >= 0.25:
                section_positive_count[c] += 1

    # Raw Fit (0 - 100)
    cluster_fit: Dict[str, float] = {c: 0.0 for c in CLUSTERS}
    for c in CLUSTERS:
        total_fit = sum(section_scores[s][c] * SECTION_WEIGHTS[s] for s in SECTION_WEIGHTS)
        cluster_fit[c] = round(total_fit * 100.0, 1)

    # 3. Soft Negative Signals (Q15)
    negative_sums: Dict[str, float] = {c: 0.0 for c in CLUSTERS}
    q15_opts = answers_by_qid.get("Q15", [])
    for opt in q15_opts:
        neg_map = NEGATIVE_SIGNALS.get(opt, {})
        for c, weight in neg_map.items():
            negative_sums[c] += weight

    negative_factors: Dict[str, float] = {}
    adjusted_fits: Dict[str, float] = {}
    for c in CLUSTERS:
        n_fac = min(0.45, negative_sums[c] / 18.0)
        negative_factors[c] = n_fac
        adjusted_fits[c] = round(cluster_fit[c] * (1.0 - n_fac), 1)

    # 4. Tension Detection (T1-T7)
    detected_tensions: List[Dict[str, str]] = []
    cluster_tensions: Dict[str, List[str]] = {c: [] for c in CLUSTERS}

    # T1: Tech interest + Math/Science difficult
    tech_interest = any(code in all_selected for code in ["Q1-O2", "Q2-O1", "Q3-O3", "Q14-O3", "Q20-O5"])
    math_or_science_hard = any(code in q15_opts for code in ["Q15-O1", "Q15-O2", "Q15-O3"])
    if tech_interest and math_or_science_hard:
        t = {"id": "T1", "cluster": "C2", "message": "ສົນໃຈເທັກໂນໂລຊີ ແຕ່ຮູ້ສຶກວ່າຄະນິດ/ວິທະຍາສາດຍາກ"}
        detected_tensions.append(t)
        cluster_tensions["C2"].append(t["message"])

    # T2: Health interest + Health difficult
    health_interest = any(code in all_selected for code in ["Q1-O6", "Q2-O8", "Q14-O9", "Q20-O3"])
    if health_interest and "Q15-O9" in q15_opts:
        t = {"id": "T2", "cluster": "C5", "message": "ສົນໃຈສຸຂະພາບ ແຕ່ຮູ້ສຶກວ່າຍາກ"}
        detected_tensions.append(t)
        cluster_tensions["C5"].append(t["message"])

    # T3: High C1 + Q15-O1 (when not covered by T1)
    if adjusted_fits["C1"] >= 45 and "Q15-O1" in q15_opts and not tech_interest:
        t = {"id": "T3", "cluster": "C1", "message": "ສົນໃຈວິເຄາະ ແຕ່ຮູ້ສຶກວ່າຄະນິດຍາກ"}
        detected_tensions.append(t)
        cluster_tensions["C1"].append(t["message"])

    # T4: Business + Time constraint
    q22_opts = answers_by_qid.get("Q22", [])
    if adjusted_fits["C6"] >= 40 and "Q22-O1" in q22_opts:
        t = {"id": "T4", "cluster": "C6", "message": "ຢາກເຮັດທຸລະກິດ ແຕ່ເວລາບໍ່ພໍ"}
        detected_tensions.append(t)
        cluster_tensions["C6"].append(t["message"])

    # T5: C5/C2 + Cannot relocate
    q23_opts = answers_by_qid.get("Q23", [])
    if (adjusted_fits["C5"] >= 40 or adjusted_fits["C2"] >= 40) and "Q23-O4" in q23_opts:
        t = {"id": "T5", "cluster": "C5/C2", "message": "ສາຍທີ່ອາດຕ້ອງໄປຕ່າງແຂວງ ແຕ່ຕອນນີ້ຍ້າຍບໍ່ໄດ້"}
        detected_tensions.append(t)
        if adjusted_fits["C5"] >= 40: cluster_tensions["C5"].append(t["message"])
        if adjusted_fits["C2"] >= 40: cluster_tensions["C2"].append(t["message"])

    # T6: Freedom preference + Location/Time constraint
    freedom_pref = "Q13-O2" in answers_by_qid.get("Q13", [])
    q8_opts = answers_by_qid.get("Q8", [])
    loc_or_time_constraint = (
        any(c in q22_opts for c in ["Q22-O1", "Q22-O2"])
        or any(c in q23_opts for c in ["Q23-O3", "Q23-O4"])
        or "Q8-O2" in q8_opts
    )
    if freedom_pref and loc_or_time_constraint:
        t = {"id": "T6", "cluster": "ALL", "message": "ຕ້ອງການອິດສະຫຼະ ແຕ່ມີຂໍ້ຈຳກັດເລື່ອງເວລາ/ສະຖານທີ່"}
        detected_tensions.append(t)

    # T7: Family time + Business
    if "Q8-O7" in q8_opts and "Q19-O3" in answers_by_qid.get("Q19", []):
        t = {"id": "T7", "cluster": "C6", "message": "ຢາກເຮັດທຸລະກິດ ແຕ່ໃຫ້ຄຸນຄ່າເວລາຄອບຄົວ"}
        detected_tensions.append(t)
        cluster_tensions["C6"].append(t["message"])

    # 5. Feasibility Calculation
    feasibility_scores: Dict[str, float] = {}
    q22_constraints = [c for c in q22_opts if c in ["Q22-O1", "Q22-O2", "Q22-O3", "Q22-O4"]]
    for c in CLUSTERS:
        f_score = 100.0
        loc_sens = LOCATION_SENSITIVITY[c]
        time_sens = TIME_SENSITIVITY[c]
        phys_sens = PHYSICAL_SENSITIVITY[c]

        if "Q22-O1" in q22_opts: f_score -= FEASIBILITY_PENALTIES["time"][time_sens]
        if "Q22-O2" in q22_opts: f_score -= FEASIBILITY_PENALTIES["near_home"][loc_sens]
        if "Q22-O3" in q22_opts: f_score -= FEASIBILITY_PENALTIES["health"][phys_sens]
        if "Q22-O4" in q22_opts: f_score -= FEASIBILITY_PENALTIES["travel"][loc_sens]

        if "Q23-O2" in q23_opts: f_score -= FEASIBILITY_PENALTIES["maybe_move"][loc_sens]
        if "Q23-O3" in q23_opts: f_score -= FEASIBILITY_PENALTIES["stay_current"][loc_sens]
        if "Q23-O4" in q23_opts: f_score -= FEASIBILITY_PENALTIES["cannot_move"][loc_sens]

        # Province context
        if d3 and d3 not in ["D3-O01", "D3-O1", "VTE"] and loc_sens != "low":
            if any(c in q23_opts for c in ["Q23-O3", "Q23-O4"]):
                f_score -= 4

        # Multi-constraint penalty
        if len(q22_constraints) >= 2:
            f_score -= 5

        feasibility_scores[c] = max(45.0, f_score)

    # 6. Confidence Score Calculation
    sorted_scores = sorted(adjusted_fits.values(), reverse=True)
    top1 = sorted_scores[0] if len(sorted_scores) > 0 else 0.0
    top2 = sorted_scores[1] if len(sorted_scores) > 1 else 0.0
    top3 = sorted_scores[2] if len(sorted_scores) > 2 else 0.0

    dispersion_top3 = (top1 - top3) if len(sorted_scores) >= 3 else 999
    close_secondary = (top2 >= 45.0 and (top1 - top2) <= 15.0)
    has_tension_any = len(detected_tensions) > 0
    multi_interest = (
        (dispersion_top3 <= 15 and top3 >= 25)
        or close_secondary
        or (top2 >= 45.0 and has_tension_any)
        or (top1 < 68 and top2 >= 25)
    )

    conf = 100.0

    # 1. Unknowns penalty
    conf -= 3.5 * unknown_count
    conf -= 1.0 * prefer_not_count

    # 2. Tensions penalty
    conf -= 5.0 * len(detected_tensions)
    if len(detected_tensions) >= 2:
        conf -= 10.0

    # 3. Multi-interest dispersion / Dual-interest penalties
    if dispersion_top3 <= 15 and top3 >= 25:
        conf -= 20.0
    elif (top1 - top2) <= 10 and top2 >= 25:
        conf -= 12.0

    if top2 >= 45.0:
        conf -= 15.0
        if has_tension_any:
            conf -= 15.0
    elif top2 >= 25.0 and top3 >= 25.0:
        conf -= 15.0

    # 4. Location constraint penalty for non-Vientiane
    if d3 and d3 not in ["D3-O01", "D3-O1", "VTE"] and any(c in q22_opts for c in ["Q22-O1", "Q22-O2"]):
        conf -= 5.0

    # 4. Low signal penalty
    if top1 < 70:
        conf -= (70.0 - top1) * 0.5

    # 5. Need Support clamp
    if unknown_count >= 15 or top1 < 35:
        conf = min(conf, 30.0)

    # 6. Close second clamp
    if top2 > 0 and (top1 - top2) <= 10 and top1 < 70:
        conf = min(conf, 60.0)

    # 7. Multi-uncertainty clamp for multi-scattered cases (unknowns >= 3 + tensions >= 2)
    if unknown_count >= 3 and len(detected_tensions) >= 2 and top1 < 70:
        conf = min(conf, 45.0)

    conf = min(conf, 85.0)  # Self-report cap
    confidence_score = max(20.0, min(95.0, conf))

    # 7. Path Classification with Fluctuation Gate
    ranked_clusters = sorted(CLUSTERS.keys(), key=lambda c: adjusted_fits[c], reverse=True)
    evaluations: Dict[str, ClusterEvaluation] = {}
    core_paths: List[ClusterEvaluation] = []
    secondary_paths: List[ClusterEvaluation] = []
    exploratory_paths: List[ClusterEvaluation] = []
    caution_paths: List[ClusterEvaluation] = []

    for c in ranked_clusters:
        fit = round(cluster_fit[c], 1)
        adj_fit = adjusted_fits[c]
        neg_fac = negative_factors[c]
        feas = feasibility_scores[c]
        strong_secs = section_strong_count[c]
        pos_secs = section_positive_count[c]
        t_list = cluster_tensions[c]
        has_t = len(t_list) > 0

        can_be_core = (
            adj_fit >= 68.0
            and strong_secs >= 2
            and confidence_score >= 65.0
            and neg_fac < 0.25
            and feas >= 60.0
            and not multi_interest
            and not has_t
            and len(core_paths) < 3
        )

        is_caution = (
            adj_fit >= 45.0
            and (neg_fac >= 0.25 or feas < 65.0 or has_t)
        )

        classification = "low_fit"
        if can_be_core:
            classification = "core"
        elif is_caution:
            classification = "caution"
        elif adj_fit >= 50.0 and pos_secs >= 2:
            classification = "secondary"
        elif adj_fit >= 35.0:
            if adj_fit >= 45.0 or (c in ranked_clusters[:2] and adj_fit >= top1 - 25):
                classification = "secondary"
            else:
                classification = "exploratory"
        elif adj_fit >= 25.0 and (c in ranked_clusters[:3]):
            classification = "exploratory"
        else:
            classification = "low_fit"

        evaluation = ClusterEvaluation(
            cluster_id=c,
            label_lao=CLUSTERS[c],
            raw_fit=fit,
            negative_factor=round(neg_fac, 3),
            adjusted_fit=adj_fit,
            feasibility_score=feas,
            strong_sections_count=strong_secs,
            classification=classification,
            matched_qids=sorted(list(cluster_matched_qids[c])),
            study_paths=STUDY_PATH_MAPPING.get(c, []),
            detected_tensions=t_list,
        )

        evaluations[c] = evaluation

        if classification == "core":
            core_paths.append(evaluation)
        elif classification == "secondary":
            secondary_paths.append(evaluation)
        elif classification == "exploratory":
            exploratory_paths.append(evaluation)
        elif classification == "caution":
            caution_paths.append(evaluation)

    return EngineEvaluationResult(
        cluster_evaluations=evaluations,
        confidence_score=round(confidence_score, 1),
        detected_tensions=detected_tensions,
        core_paths=core_paths,
        secondary_paths=secondary_paths,
        exploratory_paths=exploratory_paths,
        caution_paths=caution_paths,
    )
