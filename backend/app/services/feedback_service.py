from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feedback import FeedbackModel
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.session_service import get_session_by_id
from app.validation.sanitizer import sanitize_text


async def save_session_feedback(
    session_id: str,
    feedback_in: FeedbackCreate,
    db: AsyncSession,
) -> FeedbackResponse:
    """Save user reflection feedback for an anonymous session after PII sanitization."""
    await get_session_by_id(session_id, db)

    feedback_model = FeedbackModel(
        session_id=session_id,
        agreement=feedback_in.agreement,
        incorrect_note=sanitize_text(feedback_in.incorrect_note, max_length=1000),
        next_interest=sanitize_text(feedback_in.next_interest, max_length=500),
        created_at=datetime.now(timezone.utc),
    )
    db.add(feedback_model)
    await db.commit()

    return FeedbackResponse(saved=True)
