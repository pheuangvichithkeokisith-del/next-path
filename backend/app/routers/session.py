from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.session import (
    SessionCompleteResponse,
    SessionResponse,
    SessionStatus,
)
from app.services.session_service import (
    create_anonymous_session,
    get_session_status_info,
    mark_session_completed,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Anonymous Session",
    description="Initialize a new anonymous session with UUID identifier and form version.",
)
async def create_session(
    form_version: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    return await create_anonymous_session(db, form_version)


@router.get(
    "/{session_id}/status",
    response_model=SessionStatus,
    summary="Get Session Status",
    description="Poll current processing/completion status of a session.",
)
async def get_session_status(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionStatus:
    return await get_session_status_info(session_id, db)


@router.post(
    "/{session_id}/complete",
    response_model=SessionCompleteResponse,
    summary="Complete Session",
    description="Signal questionnaire completion and trigger processing / reflection report generation.",
)
async def complete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionCompleteResponse:
    session_status = await mark_session_completed(session_id, db)
    return SessionCompleteResponse(status=session_status)
