from datetime import datetime, timezone
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.answer import AnswerModel
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.services.session_service import get_session_by_id
from app.validation.answer_validator import validate_and_sanitize_answer


async def save_session_answer(
    session_id: str,
    answer_in: AnswerCreate,
    db: AsyncSession,
) -> AnswerResponse:
    """Validate, sanitize, and save or update an answer for an anonymous session."""
    session_obj = await get_session_by_id(session_id, db)

    # Validate against form definition and sanitize free-text (scrubbing PII & injection)
    sanitized_answer, _ = validate_and_sanitize_answer(answer_in)

    # If session is still in 'created' state, advance to 'in_progress'
    if session_obj.status == "created":
        session_obj.status = "in_progress"
        session_obj.updated_at = datetime.now(timezone.utc)

    # Check if answer for this question already exists (upsert logic)
    query = select(AnswerModel).where(
        AnswerModel.session_id == session_id,
        AnswerModel.question_id == sanitized_answer.question_id,
    )
    result = await db.execute(query)
    existing_answer = result.scalar_one_or_none()

    if existing_answer:
        existing_answer.option_codes = sanitized_answer.option_codes
        existing_answer.other_text = sanitized_answer.other_text
        existing_answer.extra_text = sanitized_answer.extra_text
        existing_answer.text_value = sanitized_answer.text_value
        existing_answer.updated_at = datetime.now(timezone.utc)
    else:
        new_answer = AnswerModel(
            session_id=session_id,
            question_id=sanitized_answer.question_id,
            option_codes=sanitized_answer.option_codes,
            other_text=sanitized_answer.other_text,
            extra_text=sanitized_answer.extra_text,
            text_value=sanitized_answer.text_value,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_answer)

    await db.commit()

    return AnswerResponse(
        status="ok",
        question_id=sanitized_answer.question_id,
        session_id=session_id,
    )


async def get_session_answers(
    session_id: str,
    db: AsyncSession,
) -> List[AnswerModel]:
    """Retrieve all answers stored for a session."""
    await get_session_by_id(session_id, db)
    query = (
        select(AnswerModel)
        .where(AnswerModel.session_id == session_id)
        .order_by(AnswerModel.created_at.asc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())
