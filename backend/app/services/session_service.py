import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.config import settings
from app.models.session import SessionModel
from app.schemas.session import SessionResponse, SessionStatus
from app.services.form_service import load_questionnaire_form


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
    """Mark session as completed."""
    session_obj = await get_session_by_id(session_id, db)
    session_obj.status = "completed"
    session_obj.completed_at = datetime.now(timezone.utc)
    session_obj.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return session_obj.status
