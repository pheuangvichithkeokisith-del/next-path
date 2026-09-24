from datetime import datetime, timezone
import pytest

from app.ds.engine import DSEngine, evaluate_ds_assessment
from app.ds.models import (
    DSAssessmentPayload,
    DSDemographicFeature,
    DSQuestionResponse,
)


def create_mock_payload(
    responses_dict=None,
    demographics=None,
    form_version="v0.9.1",
    is_ready=True,
    missing=None,
) -> DSAssessmentPayload:
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
        session_id="test-session-001",
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


def test_ds_complete_valid_answers():
    """Test standard evaluation with full 28Q answers (Tech & Analysis profile)."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2", "Q1-O3"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
        "Q3": DSQuestionResponse(question_id="Q3", question_type="single", option_codes=["Q3-O3"], is_answered=True),
        "Q4": DSQuestionResponse(question_id="Q4", question_type="multi", option_codes=["Q4-O1", "Q4-O2"], is_answered=True),
        "Q5": DSQuestionResponse(question_id="Q5", question_type="single", option_codes=["Q5-O2"], is_answered=True),
        "Q6": DSQuestionResponse(question_id="Q6", question_type="multi", option_codes=["Q6-O1", "Q6-O2"], is_answered=True),
        "Q7": DSQuestionResponse(question_id="Q7", question_type="single", option_codes=["Q7-O7"], is_answered=True),
        "Q8": DSQuestionResponse(question_id="Q8", question_type="multi", option_codes=["Q8-O4", "Q8-O5"], is_answered=True),
        "Q9": DSQuestionResponse(question_id="Q9", question_type="single", option_codes=["Q9-O1"], is_answered=True),
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O1"], is_answered=True),
        "Q11": DSQuestionResponse(question_id="Q11", question_type="single", option_codes=["Q11-O4"], is_answered=True),
        "Q12": DSQuestionResponse(question_id="Q12", question_type="single", option_codes=["Q12-O1"], is_answered=True),
        "Q13": DSQuestionResponse(question_id="Q13", question_type="multi", option_codes=["Q13-O2", "Q13-O4"], is_answered=True),
        "Q14": DSQuestionResponse(question_id="Q14", question_type="multi", option_codes=["Q14-O1", "Q14-O3"], is_answered=True),
        "Q15": DSQuestionResponse(question_id="Q15", question_type="multi", option_codes=["Q15-O4"], is_answered=True),
        "Q16": DSQuestionResponse(question_id="Q16", question_type="single", option_codes=["Q16-O2"], is_answered=True),
        "Q17": DSQuestionResponse(question_id="Q17", question_type="single", option_codes=["Q17-O3"], is_answered=True),
        "Q18": DSQuestionResponse(question_id="Q18", question_type="single", option_codes=["Q18-O1"], is_answered=True),
        "Q19": DSQuestionResponse(question_id="Q19", question_type="single", option_codes=["Q19-O4"], is_answered=True),
        "Q20": DSQuestionResponse(question_id="Q20", question_type="multi", option_codes=["Q20-O5"], is_answered=True),
        "Q21": DSQuestionResponse(question_id="Q21", question_type="single", option_codes=["Q21-O4"], is_answered=True),
        "Q22": DSQuestionResponse(question_id="Q22", question_type="multi", option_codes=["Q22-O5"], is_answered=True),
        "Q23": DSQuestionResponse(question_id="Q23", question_type="single", option_codes=["Q23-O1"], is_answered=True),
        "Q24": DSQuestionResponse(question_id="Q24", question_type="single", option_codes=["Q24-O2"], is_answered=True),
        "Q25": DSQuestionResponse(question_id="Q25", question_type="single", option_codes=["Q25-O2"], is_answered=True),
        "Q26": DSQuestionResponse(question_id="Q26", question_type="single", option_codes=["Q26-O1"], is_answered=True),
        "Q27": DSQuestionResponse(question_id="Q27", question_type="single", option_codes=["Q27-O1"], is_answered=True),
        "Q28": DSQuestionResponse(question_id="Q28", question_type="single", option_codes=["Q28-O1"], is_answered=True),
    }
    payload = create_mock_payload(responses_dict=responses, is_ready=True)

    result = evaluate_ds_assessment(payload)

    assert result.is_complete is True
    assert len(result.response_patterns) > 0
    # Check tech interest pattern
    tech_pattern = next((p for p in result.response_patterns if p.pattern_id == "PAT-INT-TECH"), None)
    assert tech_pattern is not None
    assert "Q1" in tech_pattern.source_question_ids
    assert "Q2" in tech_pattern.source_question_ids

    # Check possible paths
    path_groups = {p.group_id for p in result.possible_paths}
    assert "C1" in path_groups  # Data analysis
    assert "C2" in path_groups  # Tech & software

    # Check context factors
    assert result.context_factors.age_band == "18–20 ປີ"
    assert result.context_factors.has_constraints is False
    assert "D1" in result.context_factors.source_question_ids
    assert "Q22" in result.context_factors.source_question_ids

    # Check experiments
    assert len(result.experiments) == 3
    assert result.experiments[0].type == "interview"

    # Check versions
    assert result.versions.form == "v0.9.1"
    assert result.versions.ds == "v1.0.0"


def test_ds_partial_answers():
    """Verify partial submission does not crash or fabricate results, and identifies unknowns."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
    }
    missing = [f"Q{i}" for i in range(3, 29)]
    payload = create_mock_payload(responses_dict=responses, is_ready=False, missing=missing)

    result = evaluate_ds_assessment(payload)

    assert result.is_complete is False
    assert len(result.unanswered_question_ids) == 26
    # Missing questions must be flagged in unknowns
    assert any("Q3" in u and "ຍັງບໍ່ໄດ້ຕອບ" in u for u in result.unknowns)
    # Tech patterns should still be extracted with strict traceability
    tech_pattern = next((p for p in result.response_patterns if p.pattern_id == "PAT-INT-TECH"), None)
    assert tech_pattern is not None
    assert tech_pattern.source_question_ids == ["Q1", "Q2"]


def test_ds_unknown_answers_and_unsure_codes():
    """Verify explicit unsure answers are recognized and recorded in unknowns."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2"], is_answered=True),
        "Q8": DSQuestionResponse(question_id="Q8", question_type="multi", option_codes=["Q8-O9"], is_answered=True),
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O7"], is_answered=True),
        "Q16": DSQuestionResponse(question_id="Q16", question_type="single", option_codes=["Q16-O7"], is_answered=True),
        "Q22": DSQuestionResponse(question_id="Q22", question_type="multi", option_codes=["Q22-O6"], is_answered=True),
    }
    payload = create_mock_payload(responses_dict=responses, is_ready=False)

    result = evaluate_ds_assessment(payload)

    # Verify unsure options are tracked in unknowns
    assert any("Q8" in u and "ຍັງບໍ່ແນ່ໃຈ" in u for u in result.unknowns)
    assert any("Q10" in u and "ຍັງບໍ່ແນ່ໃຈ" in u for u in result.unknowns)
    assert any("Q16" in u and "ຍັງບໍ່ແນ່ໃຈ" in u for u in result.unknowns)
    assert any("Q22" in u and "ຍັງບໍ່ແນ່ໃຈ" in u for u in result.unknowns)


def test_ds_exclusive_options():
    """Verify exclusive options like Q22-O5 (no constraints)."""
    responses = {
        "Q22": DSQuestionResponse(question_id="Q22", question_type="multi", option_codes=["Q22-O5"], is_answered=True),
    }
    payload = create_mock_payload(responses_dict=responses)

    result = evaluate_ds_assessment(payload)
    assert result.context_factors.has_constraints is False
    assert len(result.context_factors.constraints_detail) == 0

    # With constraints selected:
    responses_with_c = {
        "Q22": DSQuestionResponse(question_id="Q22", question_type="multi", option_codes=["Q22-O1", "Q22-O3"], is_answered=True),
    }
    payload_c = create_mock_payload(responses_dict=responses_with_c)
    result_c = evaluate_ds_assessment(payload_c)
    assert result_c.context_factors.has_constraints is True
    assert len(result_c.context_factors.constraints_detail) == 2


def test_ds_tension_detection():
    """Verify tension rules preservation without auto-resolving."""
    # Case 1: Interest in Math (Q14-O1) but difficulty in Math (Q15-O1)
    # Case 2: Solo work style (Q10-O1) but collaborative environment (Q13-O3)
    # Case 3: Mastery goal (Q8-O5) but short-term result (Q26-O2)
    # Case 4: Mobility (Q21-O1) but cannot relocate (Q23-O4)
    responses = {
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O1"], is_answered=True),
        "Q13": DSQuestionResponse(question_id="Q13", question_type="multi", option_codes=["Q13-O3"], is_answered=True),
        "Q14": DSQuestionResponse(question_id="Q14", question_type="multi", option_codes=["Q14-O1"], is_answered=True),
        "Q15": DSQuestionResponse(question_id="Q15", question_type="multi", option_codes=["Q15-O1"], is_answered=True),
        "Q8": DSQuestionResponse(question_id="Q8", question_type="multi", option_codes=["Q8-O5"], is_answered=True),
        "Q26": DSQuestionResponse(question_id="Q26", question_type="single", option_codes=["Q26-O2"], is_answered=True),
        "Q21": DSQuestionResponse(question_id="Q21", question_type="single", option_codes=["Q21-O1"], is_answered=True),
        "Q23": DSQuestionResponse(question_id="Q23", question_type="single", option_codes=["Q23-O4"], is_answered=True),
    }
    payload = create_mock_payload(responses_dict=responses)

    result = evaluate_ds_assessment(payload)

    assert len(result.tensions) == 4
    tension_ids = {t.tension_id for t in result.tensions}
    assert "TENSION-INTEREST-DIFFICULTY-MATH" in tension_ids
    assert "TENSION-WORKSTYLE-SOLO-VS-TEAM-ENV" in tension_ids
    assert "TENSION-GOAL-MASTERY-VS-SHORTTERM" in tension_ids
    assert "TENSION-LOCATION-AMBITION-VS-CONSTRAINT" in tension_ids

    # All tensions must have is_resolved == False
    for t in result.tensions:
        assert t.is_resolved is False
        assert len(t.source_question_ids) >= 2


def test_ds_version_mismatch():
    """Verify version mismatch is handled safely and noted in unknowns."""
    payload = create_mock_payload(form_version="v0.7.0-beta")
    result = evaluate_ds_assessment(payload)

    assert result.versions.form == "v0.7.0-beta"
    assert any("FORM_VERSION_MISMATCH" in u for u in result.unknowns)


def test_ds_traceability_to_question_ids():
    """Verify that every important derived entity retains valid question IDs."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O1"], is_answered=True),
        "Q14": DSQuestionResponse(question_id="Q14", question_type="multi", option_codes=["Q14-O3"], is_answered=True),
    }
    payload = create_mock_payload(responses_dict=responses)
    result = evaluate_ds_assessment(payload)

    for p in result.response_patterns:
        assert len(p.source_question_ids) > 0
        for qid in p.source_question_ids:
            assert qid.startswith("Q") or qid.startswith("D")

    for path in result.possible_paths:
        assert len(path.source_question_ids) > 0

    assert len(result.context_factors.source_question_ids) > 0


def test_ds_deterministic_repeated_execution():
    """Verify running evaluate 100 times produces bit-for-bit identical outputs."""
    responses = {
        "Q1": DSQuestionResponse(question_id="Q1", question_type="multi", option_codes=["Q1-O2", "Q1-O3"], is_answered=True),
        "Q2": DSQuestionResponse(question_id="Q2", question_type="single", option_codes=["Q2-O1"], is_answered=True),
        "Q8": DSQuestionResponse(question_id="Q8", question_type="multi", option_codes=["Q8-O4", "Q8-O5"], is_answered=True),
        "Q10": DSQuestionResponse(question_id="Q10", question_type="single", option_codes=["Q10-O1"], is_answered=True),
        "Q13": DSQuestionResponse(question_id="Q13", question_type="multi", option_codes=["Q13-O3"], is_answered=True),
        "Q14": DSQuestionResponse(question_id="Q14", question_type="multi", option_codes=["Q14-O3"], is_answered=True),
        "Q15": DSQuestionResponse(question_id="Q15", question_type="multi", option_codes=["Q15-O3"], is_answered=True),
    }
    payload = create_mock_payload(responses_dict=responses)

    baseline_result = evaluate_ds_assessment(payload)
    baseline_json = baseline_result.model_dump_json()

    for _ in range(100):
        run_result = evaluate_ds_assessment(payload)
        assert run_result.model_dump_json() == baseline_json
