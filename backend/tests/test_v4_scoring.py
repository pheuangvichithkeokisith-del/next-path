import importlib.util
import json
from pathlib import Path
from typing import Any

from app.models.answer import AnswerModel
from app.models.session import SessionModel
from app.schemas.report import (
    ContextFactors,
    ReportAnswer,
    ReportResponse,
    ReportVersions,
    V4ContextFactors,
)
from app.services.v4_report_service import build_v4_report


ROOT = Path(__file__).resolve().parents[2]
SCORING_PATH = ROOT / "v4.0" / "scoring.py"
QUESTIONS_PATH = ROOT / "v4.0" / "questions_full.json"


def _load_scoring() -> Any:
    module_spec = importlib.util.spec_from_file_location("pathai_v4_test_scoring", SCORING_PATH)
    assert module_spec is not None and module_spec.loader is not None
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    return module


def _load_questions() -> dict[str, Any]:
    return json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))


def _first_nonexclusive(question: dict[str, Any]) -> list[str]:
    options = [option["code"] for option in question["options"] if not option.get("exclusive")]
    count = max(1, int(question.get("min_select", 0)))
    return options[:count]


def _complete_v4_answers(spec: dict[str, Any]) -> dict[str, dict[str, list[str]]]:
    answers = {
        question["id"]: {"option_codes": _first_nonexclusive(question)}
        for question in spec["questions"]
    }
    answers.update(
        {
            "Q23": {"option_codes": ["Q23-O1"]},
            "Q24": {"option_codes": ["Q24-O2"]},
            "Q25": {"option_codes": ["Q25-O2"]},
            "Q26": {"option_codes": ["Q26-O1"]},
            "Q27": {"option_codes": ["Q27-O1"]},
            "Q28": {"option_codes": ["Q28-O1"]},
        }
    )
    return answers


def test_active_signal_ignores_zero_weight_answers_and_keeps_signed_signal() -> None:
    scoring = _load_scoring()
    zero_question = {
        "id": "Q1",
        "section": "interests",
        "options": [{"code": "zero", "weights": {cluster: 0 for cluster in scoring.CLUSTERS}}],
    }
    signed_question = {
        "id": "Q2",
        "section": "interests",
        "options": [{"code": "signed", "weights": {"C1": 2, "C2": -2}}],
    }

    assert scoring._is_active_signal(zero_question, {"option_codes": ["zero"]}) is False
    assert scoring._is_active_signal(signed_question, {"option_codes": ["signed"]}) is True


def test_section_score_uses_active_signal_denominator_and_coverage_is_per_section() -> None:
    scoring = _load_scoring()
    spec = {
        "questions": [
            {
                "id": "Q1",
                "section": "interests",
                "options": [
                    {"code": "signal", "weights": {"C1": 1}},
                    {"code": "unsure", "weights": {"C1": 0}},
                ],
            },
            {
                "id": "Q2",
                "section": "interests",
                "options": [{"code": "unsure", "weights": {"C1": 0}}],
            },
        ]
    }
    answers = {
        "Q1": {"option_codes": ["signal"]},
        "Q2": {"option_codes": ["unsure"]},
    }

    _, section_scores = scoring.calculate_positive_scores(answers, spec)
    coverage = scoring.calculate_section_coverage(answers, spec)

    assert section_scores["interests"]["C1"] == 1.0
    assert coverage["interests"] == 0.5
    assert coverage["skills"] == 0.0


def test_v4_score_result_contains_section_coverage_and_semantic_context() -> None:
    scoring = _load_scoring()
    spec = _load_questions()
    result = scoring.score_assessment(_complete_v4_answers(spec), spec)

    assert result["status"] == "valid"
    assert result["section_coverage"]["interests"] == 1.0
    assert result["section_coverage"]["academic"] == 1.0
    assert result["context"] == {
        "risk_willingness": 3.0,
        "safety_readiness": 1,
        "constraints": ["time_constraint"],
        "mobility": ["medium_mobility"],
        "family_context": ["family_near_home"],
    }


def test_v4_validation_rejects_partial_multi_select() -> None:
    scoring = _load_scoring()
    spec = _load_questions()
    answers = _complete_v4_answers(spec)
    answers["Q9"] = {"option_codes": ["Q9-O1"]}

    validation = scoring.validate_answers(answers, spec)

    assert validation["is_valid"] is False
    assert "Q9: at least 2 options are required" in validation["errors"]


def test_context_normalization_omits_no_constraint_and_unsure_options() -> None:
    scoring = _load_scoring()
    spec = _load_questions()

    context = scoring.calculate_context(
        {
            "Q23": {"option_codes": ["Q23-O5"]},
            "Q24": {"option_codes": ["Q24-O5"]},
            "Q25": {"option_codes": ["Q25-O2"]},
        },
        spec,
    )

    assert context["constraints"] == []
    assert context["mobility"] == []
    assert context["family_context"] == ["family_near_home"]


def test_legacy_context_model_does_not_gain_v4_fields() -> None:
    report = ReportResponse(
        response_pattern=[],
        possible_paths=[],
        context_factors=ContextFactors(age_band="15–17 ປີ"),
        unknowns=[],
        versions=ReportVersions(form="v0.9.1"),
        summary_text="",
        template_id="legacy",
        ai_version="test",
    )

    assert set(report.model_dump()["context_factors"]) == {
        "age_band",
        "province_code",
        "has_constraints",
    }


def test_v4_report_adapter_returns_json_persistence_payload() -> None:
    spec = _load_questions()
    session_id = "00000000-0000-0000-0000-000000000004"
    answers = _complete_v4_answers(spec)
    answers.update(
        {
            "D1": {"option_codes": ["D1-O1"]},
            "D3": {"option_codes": ["D3-O01"]},
        }
    )
    answer_models = [
        AnswerModel(session_id=session_id, question_id=question_id, option_codes=answer["option_codes"])
        for question_id, answer in answers.items()
    ]

    report_data = build_v4_report(
        SessionModel(id=session_id, form_version="v4.0.0", status="completed"),
        answer_models,
    )
    context_payload = report_data["context_factors"]
    assert json.dumps(context_payload, ensure_ascii=False)
    assert context_payload["constraints"] == ["time_constraint"]
    assert context_payload["mobility"] == ["medium_mobility"]
    assert context_payload["family_context"] == ["family_near_home"]
    assert context_payload["risk_willingness"] == 3.0
    assert context_payload["safety_readiness"] == 1

    score_details = report_data["score_details"]
    assert set(score_details["scores"]) == set(_load_scoring().CLUSTERS)
    assert set(score_details["positive_scores"]) == set(_load_scoring().CLUSTERS)
    assert set(score_details["negative_penalty"]) == set(_load_scoring().CLUSTERS)
    assert score_details["section_coverage"]["interests"] == 1.0

    v4_context = V4ContextFactors(**context_payload)
    response = ReportResponse(
        response_pattern=report_data["response_pattern"],
        possible_paths=report_data["possible_paths"],
        answers=[
            ReportAnswer(question_id=question_id, option_codes=answer["option_codes"])
            for question_id, answer in answers.items()
        ],
        context_factors=v4_context,
        score_details=score_details,
        unknowns=report_data["unknowns"],
        versions=ReportVersions(**report_data["versions"]),
        summary_text=report_data["summary_text"],
        template_id=report_data["template_id"],
        ai_version=report_data["ai_version"],
    )
    assert response.model_dump()["context_factors"] == context_payload
    assert len(response.answers) == len(answers)
    assert response.score_details is not None


def test_v4_paths_include_fit_feasibility_and_change_with_context() -> None:
    spec = _load_questions()
    session_id = "00000000-0000-0000-0000-000000000005"
    base = _complete_v4_answers(spec)
    base.update(
        {
            "D1": {"option_codes": ["D1-O2"]},
            "D2": {"text_value": "ກຳລັງຮຽນ — ປະລິນຍາຕີ"},
            "D3": {"option_codes": ["D3-O01"]},
        }
    )
    constrained = {question_id: dict(answer) for question_id, answer in base.items()}
    constrained.update(
        {
            "Q23": {"option_codes": ["Q23-O3", "Q23-O4"]},
            "Q24": {"option_codes": ["Q24-O4"]},
            "Q25": {"option_codes": ["Q25-O2"]},
            "Q26": {"option_codes": ["Q26-O4"]},
            "Q27": {"option_codes": ["Q27-O1"]},
            "Q28": {"option_codes": ["Q28-O1"]},
        }
    )

    def build(answers: dict[str, dict[str, Any]]) -> dict[str, Any]:
        answer_models = [
            AnswerModel(
                session_id=session_id,
                question_id=question_id,
                option_codes=answer.get("option_codes", []),
                text_value=answer.get("text_value"),
            )
            for question_id, answer in answers.items()
        ]
        return build_v4_report(
            SessionModel(id=session_id, form_version="v4.0.0", status="completed"),
            answer_models,
        )

    base_report = build(base)
    constrained_report = build(constrained)

    assert len(base_report["possible_paths"]) == 3
    for path in base_report["possible_paths"]:
        assert 0 <= path["fit_score"] <= 100
        assert 0 <= path["feasibility_score"] <= 100
        assert 0 <= path["compatibility_score"] <= 100
        assert path["evidence_question_ids"]
        assert path["reasons_lao"]
        assert path["conditions_lao"]

    assert base_report["score_details"]["scores"] == constrained_report["score_details"]["scores"]
    assert [path["group_id"] for path in base_report["possible_paths"]] != [
        path["group_id"] for path in constrained_report["possible_paths"]
    ]
    assert constrained_report["context_factors"]["mobility"] == ["no_mobility"]
