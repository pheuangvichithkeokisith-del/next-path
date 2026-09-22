import json
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status

from app.config import settings
from app.schemas.form import QuestionnaireForm

_cached_form: Optional[QuestionnaireForm] = None


def load_questionnaire_form() -> QuestionnaireForm:
    """Load and parse the questionnaire JSON structure."""
    global _cached_form
    if _cached_form is not None:
        return _cached_form

    file_path = Path(settings.QUESTIONS_FILE_PATH)
    if not file_path.exists():
        # Try checking parent project data directory
        alt_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "questions.json"
        if alt_path.exists():
            file_path = alt_path
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Questionnaire configuration file not found at {file_path}",
            )

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            _cached_form = QuestionnaireForm(**data)
            return _cached_form
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse questionnaire definition: {exc}",
        )
