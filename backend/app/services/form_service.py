import json
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status

from app.config import settings
from app.schemas.form import QuestionnaireForm

_cached_forms: dict[str, QuestionnaireForm] = {}


def _questionnaire_path(version: str) -> Path:
    if version == "v4.0.0":
        return Path(__file__).resolve().parents[3] / "v4.0" / "questions_full.json"
    return Path(settings.QUESTIONS_FILE_PATH)


def load_questionnaire_form(version: Optional[str] = None) -> QuestionnaireForm:
    """Load and parse a versioned questionnaire JSON structure."""
    requested_version = version or settings.DEFAULT_FORM_VERSION
    if requested_version in _cached_forms:
        return _cached_forms[requested_version]

    file_path = _questionnaire_path(requested_version)
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
            parsed_form = QuestionnaireForm(**data)
            _cached_forms[requested_version] = parsed_form
            return parsed_form
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse questionnaire definition: {exc}",
        )
