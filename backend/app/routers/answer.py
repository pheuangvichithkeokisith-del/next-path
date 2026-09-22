from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.services.answer_service import save_session_answer

router = APIRouter(prefix="/sessions", tags=["Answers"])


@router.post(
    "/{session_id}/answers",
    response_model=AnswerResponse,
    status_code=status.HTTP_200_OK,
    summary="Save Question Answer",
    description="Store or update a response for a specific question within an anonymous session.",
)
async def save_answer(
    session_id: str,
    answer_in: AnswerCreate,
    db: AsyncSession = Depends(get_db),
) -> AnswerResponse:
    return await save_session_answer(session_id, answer_in, db)
