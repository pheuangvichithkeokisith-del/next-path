from datetime import datetime, timezone
import pytest

from app.ds.engine import DSEngine, evaluate_ds_assessment
from app.ds.models import (
    DSAssessmentPayload,
    DSDemographicFeature,
    DSQuestionResponse,
)


def build_audit_payload(
    responses_dict=None,
    demographics=None,
    form_version="v0.9.1",
    is_ready=True,
    missing=None,
) -> DSAssessmentPayload:
    """Helper to build standard DSAssessmentPayload for audit testing."""
    if responses_dict is None:
        responses_dict = {}
    if demographics is None:
        demographics = DSDemographicFeature(
            age_band="18–20 ປີ",
            age_band_code="D1-O2",
            education_level="ມັດທະຍົມຕອນປາຍ (ມ.7)",
            province_code="D3-O01",
            province_name="ນະຄອນຫຼວງວຽງຈັນ",
        )
    if missing is None:
        missing = []

    return DSAssessmentPayload(
        session_id="audit-session-001",
        form_version=form_version,
        session_status="completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        demographics=demographics,
        responses=responses_dict,
        total_answered=len(responses_dict),
        total_expected_questions=28,
        is_ready_for_evaluation=is_ready,
        missing_questions=missing,
    )


def test_audit_deterministic_repeat():
    """Audit Test 1: Verify evaluate() is pure function producing 100% identical outputs over 100 runs."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2", "Q1-O3"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
        "Q3": DSQuestionResponse(question_id="Q3", question_type="single", option_codes=["Q3-O3"], is_answered=True),
        "Q8": DSQuestionResponse(question_id="Q8", question_type="multi", option_codes=["Q8-O5"], is_answered=True),
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O1"], is_answered=True),
        "Q13": DSQuestionResponse(question_id="Q13", question_type="multi", option_codes=["Q13-O3"], is_answered=True),
        "Q14": DSQuestionResponse(question_id="Q14", question_type="multi", option_codes=["Q14-O1"], is_answered=True),
        "Q15": DSQuestionResponse(question_id="Q15", question_type="multi", option_codes=["Q15-O1"], is_answered=True),
        "Q21": DSQuestionResponse(question_id="Q21", question_type="single", option_codes=["Q21-O1"], is_answered=True),
        "Q23": DSQuestionResponse(question_id="Q23", question_type="single", option_codes=["Q23-O4"], is_answered=True),
        "Q26": DSQuestionResponse(question_id="Q26", question_type="single", option_codes=["Q26-O2"], is_answered=True),
    }
    payload = build_audit_payload(responses_dict=responses)

    engine = DSEngine()
    first_run = engine.evaluate(payload).model_dump_json()

    for _ in range(100):
        next_run = engine.evaluate(payload).model_dump_json()
        assert next_run == first_run, "DS Engine produced non-deterministic output across runs"


def test_audit_invalid_and_empty_payload():
    """Audit Test 2: Verify empty/partial inputs do not crash or hallucinate false conclusions."""
    empty_payload = build_audit_payload(
        responses_dict={},
        demographics=DSDemographicFeature(),
        is_ready=False,
        missing=[f"Q{i}" for i in range(1, 29)],
    )

    result = evaluate_ds_assessment(empty_payload)

    assert result.is_complete is False
    assert len(result.response_patterns) == 0
    assert len(result.possible_paths) == 0
    assert len(result.tensions) == 0
    assert len(result.unanswered_question_ids) == 28
    assert len(result.unknowns) == 28
    assert "ໄລຍະເລີ່ມຕົ້ນສຳຫຼວດ" in result.summary_text


def test_audit_missing_answers_handling():
    """Audit Test 3: Verify missing answers are properly identified and not treated as negative scores."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
    }
    missing_qids = [f"Q{i}" for i in range(3, 29)]
    payload = build_audit_payload(responses_dict=responses, is_ready=False, missing=missing_qids)

    result = evaluate_ds_assessment(payload)

    assert result.is_complete is False
    assert len(result.unanswered_question_ids) == 26
    for qid in missing_qids:
        assert any(qid in u for u in result.unknowns)

    # Valid answered patterns must still be derived accurately
    tech_pattern = next((p for p in result.response_patterns if p.pattern_id == "PAT-INT-TECH"), None)
    assert tech_pattern is not None
    assert tech_pattern.source_question_ids == ["Q1", "Q2"]


def test_audit_version_mismatch():
    """Audit Test 4: Verify unsupported form version is flagged in unknowns without crashing."""
    payload = build_audit_payload(form_version="v0.0.1-unknown")
    result = evaluate_ds_assessment(payload)

    assert result.versions.form == "v0.0.1-unknown"
    assert any("FORM_VERSION_MISMATCH" in u for u in result.unknowns)


def test_audit_traceability_completeness():
    """Audit Test 5: Verify 100% of generated patterns, paths, tensions, and experiments have valid source_question_ids."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2", "Q1-O10"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
        "Q8": DSQuestionResponse(question_id="Q8", question_type="multi", option_codes=["Q8-O5"], is_answered=True),
        "Q9": DSQuestionResponse(question_id="Q9", question_type="single", option_codes=["Q9-O1"], is_answered=True),
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O1"], is_answered=True),
        "Q13": DSQuestionResponse(question_id="Q13", question_type="multi", option_codes=["Q13-O3"], is_answered=True),
        "Q14": DSQuestionResponse(question_id="Q14", question_type="multi", option_codes=["Q14-O3"], is_answered=True),
        "Q15": DSQuestionResponse(question_id="Q15", question_type="multi", option_codes=["Q15-O3"], is_answered=True),
        "Q18": DSQuestionResponse(question_id="Q18", question_type="single", option_codes=["Q18-O1"], is_answered=True),
        "Q22": DSQuestionResponse(question_id="Q22", question_type="multi", option_codes=["Q22-O1"], is_answered=True),
        "Q23": DSQuestionResponse(question_id="Q23", question_type="single", option_codes=["Q23-O1"], is_answered=True),
        "Q24": DSQuestionResponse(question_id="Q24", question_type="single", option_codes=["Q24-O2"], is_answered=True),
    }
    payload = build_audit_payload(responses_dict=responses)
    result = evaluate_ds_assessment(payload)

    # 1. Patterns
    assert len(result.response_patterns) > 0
    for p in result.response_patterns:
        assert len(p.source_question_ids) > 0, f"Pattern {p.pattern_id} has empty source_question_ids"

    # 2. Paths
    assert len(result.possible_paths) > 0
    for path in result.possible_paths:
        assert len(path.source_question_ids) > 0, f"Path {path.group_id} has empty source_question_ids"

    # 3. Tensions
    assert len(result.tensions) > 0
    for t in result.tensions:
        assert len(t.source_question_ids) >= 2, f"Tension {t.tension_id} has insufficient source_question_ids"

    # 4. Context Factors
    assert len(result.context_factors.source_question_ids) > 0, "ContextFactors has empty source_question_ids"

    # 5. Experiments
    assert len(result.experiments) > 0
    for exp in result.experiments:
        assert len(exp.source_question_ids) > 0, f"Experiment {exp.experiment_id} has empty source_question_ids"
