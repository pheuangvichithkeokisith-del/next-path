"""Report adapter for the PATHAI v4.0 questionnaire.

The production report endpoint historically used the v0.9.1 signal engine.
v4.0 has a different question map and scoring contract, so it needs a small
adapter instead of silently passing v4 answers through legacy option-code
rules.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
from typing import Any, Dict, List

from app.models.answer import AnswerModel
from app.models.session import SessionModel
from app.schemas.report import (
    ReportScoreDetails,
    ReportPath,
    ReportPattern,
    ReportVersions,
    V4ContextFactors,
)


# The Railway image uses ``backend/`` as its application root.  Keeping the
# v4 assets under ``backend/v4.0`` makes this path work both locally and in the
# production image.
ROOT = Path(__file__).resolve().parents[2]
V4_ROOT = ROOT / "v4.0"
CLUSTERS = ("C1", "C2", "C3", "C4", "C5", "C6", "C7")
SCORING_SECTIONS = ("interests", "skills", "values", "work_style", "academic", "goals")
CLUSTER_LABELS = {
    "C1": "ສາຍວິເຄາະຂໍ້ມູນ ແລະ ວິໄຈ",
    "C2": "ສາຍເທັກໂນໂລຊີ ແລະ ດິຈິຕອນ",
    "C3": "ສາຍອອກແບບ ແລະ ສື່ສານສ້າງສັນ",
    "C4": "ສາຍພັດທະນາຄົນ ແລະ ສັງຄົມ",
    "C5": "ສາຍສຸຂະພາບ ແລະ ການເບິ່ງແຍງ",
    "C6": "ສາຍທຸລະກິດ ແລະ ການຄຸ້ມຄອງ",
    "C7": "ສາຍງານປະຕິບັດ, ທຳມະຊາດ ແລະ ສິ່ງແວດລ້ອມ",
}

PATH_FEASIBILITY_SENSITIVITY = {
    # Higher values mean the path is more affected by a matching constraint.
    "C1": {"mobility": 0.35, "location": 0.30, "transport": 0.25, "health": 0.20, "time": 0.35},
    "C2": {"mobility": 0.15, "location": 0.10, "transport": 0.10, "health": 0.10, "time": 0.25},
    "C3": {"mobility": 0.20, "location": 0.15, "transport": 0.15, "health": 0.15, "time": 0.25},
    "C4": {"mobility": 0.25, "location": 0.20, "transport": 0.15, "health": 0.15, "time": 0.20},
    "C5": {"mobility": 0.40, "location": 0.30, "transport": 0.35, "health": 0.45, "time": 0.20},
    "C6": {"mobility": 0.30, "location": 0.25, "transport": 0.20, "health": 0.10, "time": 0.35},
    "C7": {"mobility": 0.50, "location": 0.35, "transport": 0.45, "health": 0.25, "time": 0.20},
}

PATH_CLASS_LABELS = {
    "strong_fit": "ສາຍຫຼັກທີ່ຄວນສຳຫຼວດຕໍ່",
    "good_to_explore": "ທາງເລືອກທີ່ໜ້າສຳຫຼວດ",
    "try_first": "ຄວນລອງກ່ອນ ແລະ ເກັບຫຼັກຖານເພີ່ມ",
}


ARCHETYPE_LABELS_LAO = {
    "Laser Focus": "ມີເປົ້າໝາຍຊັດເຈນສະເພາະດ້ານ (Laser Focus)",
    "Clear Direction": "ມີທິດທາງຫຼັກທີ່ເດັ່ນຊັດ (Clear Direction)",
    "Dual Interest": "ມີຄວາມສົນໃຈສອງດ້ານຄູ່ຂະໜານ (Dual Interest)",
    "Multi-Scattered": "ມີຄວາມສົນໃຈຫຼາກຫຼາຍດ້ານ (Multi-Interest Exploration)",
    "Total Uncertainty": "ກຳລັງເປີດກວ້າງຄົ້ນຫາຕົນເອງ (Open Exploration)",
}


def _load_v4_scoring() -> Any:
    module_path = V4_ROOT / "scoring.py"
    spec = importlib.util.spec_from_file_location("pathai_v4_scoring", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load PATHAI v4.0 scoring module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_v4_spec() -> Dict[str, Any]:
    return json.loads((V4_ROOT / "questions_full.json").read_text(encoding="utf-8"))


def _option_label(spec: Dict[str, Any], question_id: str, code: str) -> str:
    for item in [*spec.get("demographics", []), *spec.get("questions", [])]:
        if item.get("id") != question_id:
            continue
        for option in item.get("options", []):
            if option.get("code") == code:
                return str(option.get("text", code))
    return code


def _answer_map(answers: List[AnswerModel]) -> Dict[str, Dict[str, Any]]:
    return {
        answer.question_id: {
            "option_codes": list(answer.option_codes or []),
            "other_text": answer.other_text,
            "extra_text": answer.extra_text,
            "text_value": answer.text_value,
        }
        for answer in answers
    }


def validate_v4_answers(answers: List[AnswerModel]) -> Dict[str, Any]:
    """Validate persisted answers before a v4 session can be completed."""
    scoring = _load_v4_scoring()
    spec = _load_v4_spec()
    return scoring.validate_answers(_answer_map(answers), spec)


def _context_factors(
    spec: Dict[str, Any],
    answers: Dict[str, Dict[str, Any]],
) -> Dict[str, Any]:
    d1_answer = answers.get("D1", {})
    age_text = str(d1_answer.get("text_value") or "").strip()
    try:
        age_years = int(age_text) if age_text else None
    except ValueError:
        age_years = None
    d1 = d1_answer.get("option_codes", [])
    d3 = answers.get("D3", {}).get("option_codes", [])
    q23 = answers.get("Q23", {}).get("option_codes", [])
    has_constraints = bool(q23 and "Q23-O5" not in q23 and "Q23-O6" not in q23)
    return {
        "age_band": _option_label(spec, "D1", d1[0]) if d1 else (f"{age_years} ປີ" if age_years is not None else None),
        "age_years": age_years,
        "province_code": d3[0] if d3 else None,
        "has_constraints": has_constraints,
    }


def _unknowns(validation: Dict[str, Any]) -> List[str]:
    result: List[str] = []
    for error in validation.get("errors", []):
        result.append(f"v4.0 validation: {error}")
    for warning in validation.get("warnings", []):
        result.append(f"v4.0 warning: {warning}")
    return result


def _education_note(value: str | None) -> str:
    if not value:
        return "ຍັງບໍ່ມີຂໍ້ມູນລະດັບການຮຽນສຳລັບກຳນົດຂັ້ນຕອນຕໍ່ໄປ"
    return f"ຄວນເລືອກຂັ້ນການຮຽນ ຫຼື ການຝຶກທີ່ຕໍ່ຍອດຈາກລະດັບປັດຈຸບັນ ({value})"


def _build_path_evaluations(
    scores: Dict[str, float],
    answers: Dict[str, Dict[str, Any]],
    spec: Dict[str, Any],
    context: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Rank exploration paths without changing the v4 aptitude score formula."""
    constraints = set(context.get("constraints", []))
    mobility = set(context.get("mobility", []))
    education = str(answers.get("D2", {}).get("text_value") or "").strip()
    evaluations: List[Dict[str, Any]] = []

    for cluster in CLUSTERS:
        sensitivity = PATH_FEASIBILITY_SENSITIVITY[cluster]
        fit_score = round(max(0.0, min(1.0, float(scores.get(cluster, 0.0)))) * 100, 1)
        feasibility = 100.0
        reasons: List[str] = []
        conditions: List[str] = []
        evidence: List[str] = []

        for question in spec.get("questions", []):
            if question.get("section") not in SCORING_SECTIONS or question.get("is_negative_signal"):
                continue
            selected = answers.get(question["id"], {}).get("option_codes", [])
            if any(float(option.get("weights", {}).get(cluster, 0)) > 0 for option in question.get("options", []) if option.get("code") in selected):
                evidence.append(question["id"])

        if fit_score >= 60:
            reasons.append(f"ຄຳຕອບມີສັນຍານສອດຄ່ອງກັບ{CLUSTER_LABELS[cluster]}")
        elif fit_score >= 35:
            reasons.append(f"ພົບສັນຍານບາງສ່ວນສຳລັບ{CLUSTER_LABELS[cluster]}")
        else:
            reasons.append("ສັນຍານຍັງບໍ່ຫຼາຍ ຄວນລອງກິດຈະກຳຈິງກ່ອນ")

        if "time_constraint" in constraints:
            feasibility -= 12 * sensitivity["time"]
            conditions.append("ຈັດເວລາທົດລອງໃຫ້ສັ້ນ ແລະ ຍືດຫຍຸ່ນ")
        if "location_constraint" in constraints:
            feasibility -= 12 * sensitivity["location"]
            conditions.append("ຄົ້ນຫາຮູບແບບຮຽນ/ເຮັດວຽກໃກ້ບ້ານ ຫຼື ອອນລາຍ")
        if "transport_constraint" in constraints:
            feasibility -= 15 * sensitivity["transport"]
            conditions.append("ກວດເບິ່ງຄ່າເດີນທາງ ແລະ ແຫຼ່ງຮຽນທີ່ເຂົ້າເຖິງໄດ້")
        if "health_constraint" in constraints:
            feasibility -= 12 * sensitivity["health"]
            conditions.append("ກວດເບິ່ງສະພາບວຽກ ແລະ ການປັບສະພາບໃຫ້ປອດໄພ")

        if "no_mobility" in mobility:
            feasibility -= 25 * sensitivity["mobility"]
            conditions.append("ເລີ່ມຈາກທາງເລືອກໃນພື້ນທີ່ປັດຈຸບັນ")
        elif "low_mobility" in mobility:
            feasibility -= 12 * sensitivity["mobility"]
            conditions.append("ຄວນມີທາງເລືອກໃກ້ບ້ານເປັນຈຸດເລີ່ມຕົ້ນ")
        elif "medium_mobility" in mobility:
            feasibility -= 5 * sensitivity["mobility"]
            conditions.append("ຍ້າຍໄດ້ຖ້າມີແຜນ ແລະ ເງື່ອນໄຂຮອງຮັບ")

        risk = context.get("risk_willingness")
        if risk is not None and float(risk) < 2:
            feasibility -= 7
            conditions.append("ຄວນລອງແບບຂະໜາດນ້ອຍກ່ອນຕັດສິນໃຈໃຫຍ່")
        safety = context.get("safety_readiness")
        if safety is not None and int(safety) < 2:
            feasibility -= 5
            conditions.append("ກຽມແຜນສຳຮອງ ແລະ ຄົນທີ່ໄວ້ໃຈໃຫ້ຄຳປຶກສາ")

        if education:
            conditions.append(_education_note(education))
            evidence.append("D2")
        if answers.get("D3", {}).get("option_codes"):
            evidence.append("D3")
        for question_id in ("Q23", "Q24", "Q25", "Q26", "Q27", "Q28"):
            if answers.get(question_id, {}).get("option_codes"):
                evidence.append(question_id)

        feasibility = round(max(0.0, min(100.0, feasibility)), 1)
        compatibility = round((fit_score * 0.7) + (feasibility * 0.3), 1)
        if fit_score >= 60 and feasibility >= 70:
            classification = "strong_fit"
        elif compatibility >= 45:
            classification = "good_to_explore"
        else:
            classification = "try_first"

        evaluations.append({
            "group_id": cluster,
            "label_lao": f"{CLUSTER_LABELS[cluster]} ({PATH_CLASS_LABELS[classification]})",
            "is_sample": False,
            "classification": classification,
            "fit_score": fit_score,
            "feasibility_score": feasibility,
            "compatibility_score": compatibility,
            "evidence_question_ids": list(dict.fromkeys(evidence)),
            "reasons_lao": reasons,
            "conditions_lao": list(dict.fromkeys(conditions)),
        })

    return sorted(
        evaluations,
        key=lambda path: (-float(path["compatibility_score"]), -float(path["fit_score"]), path["group_id"]),
    )


def build_v4_report(
    session: SessionModel,
    answers: List[AnswerModel],
) -> Dict[str, Any]:
    """Return report fields compatible with the existing report model/schema."""
    scoring = _load_v4_scoring()
    spec = _load_v4_spec()
    answer_map = _answer_map(answers)
    result = scoring.score_assessment(answer_map, spec)
    context = {
        **_context_factors(spec, answer_map),
        **scoring.calculate_context(answer_map, spec),
    }
    v4_context = V4ContextFactors(**context)
    context_payload = v4_context.model_dump(mode="json")

    if result.get("status") != "valid":
        validation = result.get("validation", {})
        unknowns = _unknowns(validation)
        summary = (
            "ພາບລວມຍັງບໍ່ສົມບູນ ເນື່ອງຈາກຄຳຕອບບາງຂໍ້ຍັງບໍ່ຄົບຖ້ວນ. "
            "ກະລຸນາກວດເບິ່ງລາຍການທີ່ຍັງຂາດ ແລະ ໃຊ້ຜົນນີ້ເປັນຮ່າງສຳຫຼວດເບື້ອງຕົ້ນ."
        )
        return {
            "response_pattern": [],
            "possible_paths": [],
            "context_factors": context_payload,
            "score_details": None,
            "unknowns": unknowns,
            "versions": {"ds": "v4-profile-correlation-0.1", "enc": "enc-0", "form": session.form_version},
            "summary_text": summary,
            "template_id": "reflection-v4-incomplete",
            "ai_version": "deterministic-v4.0.0",
        }

    scores = result["scores"]
    path_evaluations = _build_path_evaluations(scores, answer_map, spec, context)
    top_cluster = result.get("top_cluster")
    archetype = result.get("archetype", "Multi-Scattered")
    archetype_lao = ARCHETYPE_LABELS_LAO.get(archetype, archetype)
    lead_cluster = path_evaluations[0]["group_id"] if path_evaluations else top_cluster
    top_cluster_name = CLUSTER_LABELS.get(lead_cluster or "", "ຫຼາຍສາຍປະກອບກັນ")

    patterns: List[Dict[str, Any]] = [
        ReportPattern(
            section="ຮູບແບບຄວາມຄິດ",
            pattern_id=archetype.lower().replace(" ", "-"),
            label_lao=f"{archetype_lao} — ຈຸດເດັ່ນ: {top_cluster_name}",
            is_sample=False,
        ).model_dump()
    ]

    possible_paths = path_evaluations[:3]

    if lead_cluster and lead_cluster in CLUSTER_LABELS:
        summary = (
            f"ຈາກຄຳຕອບຂອງທ່ານ ສະແດງໃຫ້ເຫັນຮູບແບບ \"{archetype_lao}\" "
            f"ໂດຍມີ \"{CLUSTER_LABELS[lead_cluster]}\" ເປັນຈຸດເລີ່ມຕົ້ນທີ່ໜ້າສົນໃຈໃນການສຳຫຼວດຕໍ່. "
            "ພາບລວມນີ້ຊ່ວຍຈັດລະບຽບຄວາມຄິດ ບໍ່ແມ່ນການຕັດສິນອາຊີບ."
        )
    else:
        summary = (
            f"ຈາກຄຳຕອບຂອງທ່ານ ສະແດງໃຫ້ເຫັນຮູບແບບ \"{archetype_lao}\" "
            "ເຊິ່ງມີຫຼາຍດ້ານທີ່ໜ້າສົນໃຈພ້ອມໆກັນ. ທ່ານສາມາດເລີ່ມທົດລອງສິ່ງນ້ອຍໆໃນແຕ່ລະສາຍເພື່ອຄົ້ນຫາຕົນເອງຕໍ່ໄປ."
        )

    return {
        "response_pattern": patterns,
        "possible_paths": possible_paths,
        "context_factors": context_payload,
        "score_details": ReportScoreDetails(
            scores=result["scores"],
            positive_scores=result["positive_scores"],
            negative_penalty=result["negative_penalty"],
            section_scores=result["section_scores"],
            section_coverage=result["section_coverage"],
            correlations=result.get("correlations", {}),
            r_max=result.get("r_max"),
        ).model_dump(mode="json"),
        "unknowns": [],
        "versions": {"ds": "v4-profile-correlation-0.1", "enc": "enc-0", "form": session.form_version},
        "summary_text": summary,
        "template_id": f"reflection-v4-{(lead_cluster or 'open').lower()}",
        "ai_version": "deterministic-v4.0.0",
    }
