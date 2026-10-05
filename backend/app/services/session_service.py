import uuid
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.config import settings
from app.models.answer import AnswerModel
from app.models.province import ProvinceModel
from app.models.response_counter import ResponseCounterModel
from app.models.session import SessionModel
from app.schemas.session import SessionResponse, SessionStatus
from app.services.form_service import load_questionnaire_form
from app.services.v4_report_service import validate_v4_answers


async def create_anonymous_session(
    db: AsyncSession,
    form_version: str | None = None,
) -> SessionResponse:
    """Create an anonymous session after validating the requested form version."""
    requested_version = form_version or settings.DEFAULT_FORM_VERSION
    load_questionnaire_form(requested_version)
    session_id = str(uuid.uuid4())
    new_session = SessionModel(
        id=session_id,
        form_version=requested_version,
        status="created",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)

    return SessionResponse(
        session_id=new_session.id,
        form_version=new_session.form_version,
    )


async def get_session_by_id(session_id: str, db: AsyncSession) -> SessionModel:
    """Retrieve session by ID or raise 404."""
    query = select(SessionModel).where(SessionModel.id == session_id)
    result = await db.execute(query)
    session_obj = result.scalar_one_or_none()

    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    return session_obj


async def get_session_status_info(session_id: str, db: AsyncSession) -> SessionStatus:
    """Get status and form version for session polling."""
    session_obj = await get_session_by_id(session_id, db)
    return SessionStatus(
        status=session_obj.status,
        form_version=session_obj.form_version,
    )


async def mark_session_completed(session_id: str, db: AsyncSession) -> str:
    """Validate, normalize first-party demographics, and complete a session."""
    query = select(SessionModel).where(SessionModel.id == session_id).with_for_update()
    result = await db.execute(query)
    session_obj = result.scalar_one_or_none()
    if session_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )

    answer_query = select(AnswerModel).where(AnswerModel.session_id == session_id)
    answer_result = await db.execute(answer_query)
    answers = list(answer_result.scalars().all())

    if session_obj.form_version == "v4.0.0":
        validation = validate_v4_answers(answers)
        if not validation["is_valid"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "v4 answers are incomplete or invalid",
                    "errors": validation["errors"],
                    "warnings": validation["warnings"],
                },
            )

    now = datetime.now(timezone.utc)
    answer_by_question = {answer.question_id: answer for answer in answers}
    age_answer = answer_by_question.get("D1")
    try:
        age_years = int((age_answer.text_value or "").strip()) if age_answer else None
    except (TypeError, ValueError):
        age_years = None
    if age_years is not None and not 15 <= age_years <= 120:
        age_years = None

    province_answer = answer_by_question.get("D3")
    form_option_code = (
        (province_answer.option_codes or [None])[0] if province_answer else None
    )
    province_result = await db.execute(
        select(ProvinceModel).where(ProvinceModel.form_option_code == form_option_code)
    ) if form_option_code else None
    province = province_result.scalar_one_or_none() if province_result else None
    province_code = province.province_code if province else None

    session_obj.age_years = age_years
    session_obj.province_code = province_code
    if session_obj.completed_at is None:
        session_obj.completed_at = now
    session_obj.status = "completed"
    session_obj.updated_at = now

    if session_obj.response_code is None:
        local_year = now.astimezone(ZoneInfo("Asia/Vientiane")).year
        counter_province = province_code or "UNK"
        counter_table = ResponseCounterModel.__table__
        insert_fn = (
            pg_insert if db.bind and db.bind.dialect.name == "postgresql" else sqlite_insert
        )
        statement = insert_fn(counter_table).values(
            year=local_year,
            province_code=counter_province,
            last_sequence=1,
        )
        statement = statement.on_conflict_do_update(
            index_elements=[counter_table.c.year, counter_table.c.province_code],
            set_={"last_sequence": counter_table.c.last_sequence + 1},
        ).returning(counter_table.c.last_sequence)
        sequence_result = await db.execute(statement)
        sequence = sequence_result.scalar_one()
        session_obj.response_code = f"{local_year}-{counter_province}-{sequence:06d}"

    await db.commit()
    return session_obj.status
