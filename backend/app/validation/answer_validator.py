from typing import Dict, Optional, Tuple
from fastapi import HTTPException, status

from app.schemas.answer import AnswerCreate
from app.schemas.form import FormItem, QuestionnaireForm
from app.services.form_service import load_questionnaire_form
from app.validation.sanitizer import sanitize_text


def get_form_items_map(form: Optional[QuestionnaireForm] = None) -> Dict[str, FormItem]:
    """Build a lookup map of all form items (demographics + questions) by ID."""
    if form is None:
        form = load_questionnaire_form()
    
    items: Dict[str, FormItem] = {}
    for item in form.demographics:
        items[item.id] = item
    for item in form.questions:
        items[item.id] = item
    return items


def validate_and_sanitize_answer(
    answer: AnswerCreate,
    form: Optional[QuestionnaireForm] = None,
) -> Tuple[AnswerCreate, FormItem]:
    """Validate answer payload against form item specification and sanitize free-text fields.
    
    Preserves exact option codes while ensuring data integrity.
    """
    items_map = get_form_items_map(form)
    
    if answer.question_id not in items_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question_id '{answer.question_id}'. Not found in form specification.",
        )

    item = items_map[answer.question_id]
    valid_option_codes = {opt.code: opt for opt in (item.options or [])}
    exclusive_codes = {opt.code for opt in (item.options or []) if opt.exclusive}

    # 1. Validate option codes against allowed options for this item
    for code in answer.option_codes:
        if code not in valid_option_codes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Option code '{code}' is not valid for question '{item.id}'.",
            )

    # 2. Validate single-choice constraint
    if item.type == "single" and len(answer.option_codes) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Question '{item.id}' is single-choice but received {len(answer.option_codes)} options.",
        )

    # 3. Validate multi-choice constraints (max_select)
    if item.type == "multi" and item.max_select is not None:
        if len(answer.option_codes) > item.max_select:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question '{item.id}' allows at most {item.max_select} selections, but received {len(answer.option_codes)}.",
            )

    # 4. Validate exclusive option rule (e.g. 'ຍັງບໍ່ແນ່ໃຈ' cannot be co-selected)
    if len(answer.option_codes) > 1:
        chosen_exclusive = [c for c in answer.option_codes if c in exclusive_codes]
        if chosen_exclusive:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Exclusive option '{chosen_exclusive[0]}' cannot be selected alongside other options in question '{item.id}'.",
            )

    # 5. Sanitize text fields while preserving data integrity
    sanitized_answer = AnswerCreate(
        question_id=answer.question_id,
        option_codes=answer.option_codes,
        other_text=sanitize_text(answer.other_text, max_length=500),
        extra_text=sanitize_text(answer.extra_text, max_length=1000),
        text_value=sanitize_text(answer.text_value, max_length=500),
    )

    return sanitized_answer, item
