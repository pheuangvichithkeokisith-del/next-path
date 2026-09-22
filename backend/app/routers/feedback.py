from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.feedback_service import save_session_feedback

router = APIRouter(prefix="/sessions", tags=["Feedback"])


@router.post(
    "/{session_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Session Feedback",
    description="Store user agreement and feedback notes on the reflection report.",
)
async def submit_feedback(
    session_id: str,
    feedback_in: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponse:
    return await save_session_feedback(session_id, feedback_in, db)
