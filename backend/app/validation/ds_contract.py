from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

from app.models.answer import AnswerModel
from app.models.session import SessionModel
from app.schemas.form import FormItem, QuestionnaireForm
from app.validation.answer_validator import get_form_items_map


class DSDemographicFeature(BaseModel):
    model_config = ConfigDict(extra="ignore")

    age_band: Optional[str] = None
    age_band_code: Optional[str] = None
    education_level: Optional[str] = None
    province_code: Optional[str] = None
    province_name: Optional[str] = None


class DSQuestionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    question_id: str
    section: Optional[str] = None
    question_type: str
    option_codes: List[str] = []
    other_text: Optional[str] = None
    extra_text: Optional[str] = None
    text_value: Optional[str] = None
    is_answered: bool = False


class DSAssessmentPayload(BaseModel):
    """Clean, standardized assessment data structure ready for consumption by future DS Engine.
    
    Contains strictly raw data preservation and feature mappings without scoring formulas or AI logic.
    """
    model_config = ConfigDict(extra="ignore")

    session_id: str
    form_version: str
    session_status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    demographics: DSDemographicFeature
    responses: Dict[str, DSQuestionResponse]
    total_answered: int
    total_expected_questions: int
    is_ready_for_evaluation: bool
    missing_questions: List[str]


def extract_ds_assessment_payload(
    session: SessionModel,
    answers: List[AnswerModel],
    form: Optional[QuestionnaireForm] = None,
) -> DSAssessmentPayload:
    """Extract and standardize session answers into a DS-compatible feature representation."""
    if form is None:
        from app.services.form_service import load_questionnaire_form
        form = load_questionnaire_form(session.form_version)

    items_map = get_form_items_map(form)
    answers_by_qid: Dict[str, AnswerModel] = {a.question_id: a for a in answers}

    # Extract Demographics
    d1 = answers_by_qid.get("D1")
    d2 = answers_by_qid.get("D2")
    d3 = answers_by_qid.get("D3")

    # Resolve option labels if available
    d1_code = d1.option_codes[0] if d1 and d1.option_codes else None
    d1_label = None
    if d1_code and "D1" in items_map and items_map["D1"].options:
        d1_label = next((opt.text for opt in items_map["D1"].options if opt.code == d1_code), None)

    d3_code = d3.option_codes[0] if d3 and d3.option_codes else None
    d3_label = None
    if d3_code and "D3" in items_map and items_map["D3"].options:
        d3_label = next((opt.text for opt in items_map["D3"].options if opt.code == d3_code), None)

    demographics_feature = DSDemographicFeature(
        age_band_code=d1_code,
        age_band=d1_label,
        education_level=d2.text_value if d2 else None,
        province_code=d3_code,
        province_name=d3_label,
    )

    # Extract Questions (Q1 - Q28)
    responses_map: Dict[str, DSQuestionResponse] = {}
    missing_questions: List[str] = []
    answered_count = 0

    for q in form.questions:
        ans = answers_by_qid.get(q.id)
        is_answered = False
        if ans:
            if q.type == "text" and ans.text_value:
                is_answered = bool(ans.text_value.strip())
            elif q.type in ["single", "multi"] and ans.option_codes:
                is_answered = len(ans.option_codes) > 0

        if is_answered:
            answered_count += 1
        else:
            missing_questions.append(q.id)

        responses_map[q.id] = DSQuestionResponse(
            question_id=q.id,
            section=q.section,
            question_type=q.type,
            option_codes=ans.option_codes if ans else [],
            other_text=ans.other_text if ans else None,
            extra_text=ans.extra_text if ans else None,
            text_value=ans.text_value if ans else None,
            is_answered=is_answered,
        )

    return DSAssessmentPayload(
        session_id=session.id,
        form_version=session.form_version,
        session_status=session.status,
        created_at=session.created_at,
        completed_at=session.completed_at,
        demographics=demographics_feature,
        responses=responses_map,
        total_answered=answered_count,
        total_expected_questions=len(form.questions),
        is_ready_for_evaluation=(answered_count == len(form.questions)),
        missing_questions=missing_questions,
    )
