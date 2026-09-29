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
from app.schemas.report import V4ContextFactors, ReportPath, ReportPattern, ReportVersions


ROOT = Path(__file__).resolve().parents[3]
V4_ROOT = ROOT / "v4.0"
CLUSTERS = ("C1", "C2", "C3", "C4", "C5", "C6", "C7")
CLUSTER_LABELS = {
    "C1": "ສາຍວິເຄາະຂໍ້ມູນ ແລະ ວິໄຈ",
    "C2": "ສາຍເທັກໂນໂລຊີ ແລະ ດິຈິຕອນ",
    "C3": "ສາຍອອກແບບ ແລະ ສື່ສານສ້າງສັນ",
    "C4": "ສາຍພັດທະນາຄົນ ແລະ ສັງຄົມ",
    "C5": "ສາຍສຸຂະພາບ ແລະ ການເບິ່ງແຍງ",
    "C6": "ສາຍທຸລະກິດ ແລະ ການຄຸ້ມຄອງ",
    "C7": "ສາຍງານປະຕິບັດ, ທຳມະຊາດ ແລະ ສິ່ງແວດລ້ອມ",
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
    d1 = answers.get("D1", {}).get("option_codes", [])
    d3 = answers.get("D3", {}).get("option_codes", [])
    q23 = answers.get("Q23", {}).get("option_codes", [])
    has_constraints = bool(q23 and "Q23-O5" not in q23 and "Q23-O6" not in q23)
    return {
        "age_band": _option_label(spec, "D1", d1[0]) if d1 else None,
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
            "ບົດສະທ້ອນຍັງບໍ່ສົມບູນ ເນື່ອງຈາກຄຳຕອບບາງຂໍ້ຍັງບໍ່ຄົບຖ້ວນ. "
            "ກະລຸນາກວດເບິ່ງລາຍການທີ່ຍັງຂາດ ແລະ ໃຊ້ຜົນນີ້ເປັນຮ່າງສຳຫຼວດເບື້ອງຕົ້ນ."
        )
        return {
            "response_pattern": [],
            "possible_paths": [],
            "context_factors": context_payload,
            "unknowns": unknowns,
            "versions": {"ds": "v4-profile-correlation-0.1", "enc": "enc-0", "form": session.form_version},
            "summary_text": summary,
            "template_id": "reflection-v4-incomplete",
            "ai_version": "deterministic-v4.0.0",
        }

    scores = result["scores"]
    ordered = sorted(CLUSTERS, key=lambda cluster: (-float(scores[cluster]), cluster))
    top_cluster = result.get("top_cluster")
    archetype = result.get("archetype", "Multi-Scattered")
    archetype_lao = ARCHETYPE_LABELS_LAO.get(archetype, archetype)
    top_cluster_name = CLUSTER_LABELS.get(top_cluster or "", "ຫຼາຍສາຍປະກອບກັນ")

    patterns: List[Dict[str, Any]] = [
        ReportPattern(
            section="ຮູບແບບຄວາມຄິດ",
            pattern_id=archetype.lower().replace(" ", "-"),
            label_lao=f"{archetype_lao} — ຈຸດເດັ່ນ: {top_cluster_name}",
            is_sample=False,
        ).model_dump()
    ]

    possible_paths = []
    for idx, cluster in enumerate(ordered[:3]):
        tag = (
            "ສາຍຫຼັກທີ່ສອດຄ່ອງເດັ່ນຊັດ"
            if idx == 0 and archetype in ("Laser Focus", "Clear Direction")
            else "ທາງເລືອກສຳຫຼວດເພີ່ມເຕີມ"
        )
        possible_paths.append(
            ReportPath(
                group_id=cluster,
                label_lao=f"{CLUSTER_LABELS[cluster]} ({tag})",
                is_sample=False,
            ).model_dump()
        )

    if top_cluster and top_cluster in CLUSTER_LABELS:
        summary = (
            f"ຈາກຄຳຕອບຂອງທ່ານ ສະທ້ອນໃຫ້ເຫັນຮູບແບບ \"{archetype_lao}\" "
            f"ໂດຍມີ \"{CLUSTER_LABELS[top_cluster]}\" ເປັນຈຸດເລີ່ມຕົ້ນທີ່ໜ້າສົນໃຈໃນການສຳຫຼວດຕໍ່. "
            "ບົດສະທ້ອນນີ້ແມ່ນແວ່ນແຍງຊ່ວຍຈັດລະບຽບຄວາມຄິດ ບໍ່ແມ່ນການຕັດສິນອາຊີບ."
        )
    else:
        summary = (
            f"ຈາກຄຳຕອບຂອງທ່ານ ສະທ້ອນໃຫ້ເຫັນຮູບແບບ \"{archetype_lao}\" "
            "ເຊິ່ງມີຫຼາຍດ້ານທີ່ໜ້າສົນໃຈພ້ອມໆກັນ. ທ່ານສາມາດເລີ່ມທົດລອງສິ່ງນ້ອຍໆໃນແຕ່ລະສາຍເພື່ອຄົ້ນຫາຕົນເອງຕໍ່ໄປ."
        )

    return {
        "response_pattern": patterns,
        "possible_paths": possible_paths,
        "context_factors": context_payload,
        "unknowns": [],
        "versions": {"ds": "v4-profile-correlation-0.1", "enc": "enc-0", "form": session.form_version},
        "summary_text": summary,
        "template_id": f"reflection-v4-{(top_cluster or 'open').lower()}",
        "ai_version": "deterministic-v4.0.0",
    }
