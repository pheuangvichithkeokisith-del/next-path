from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.form import QuestionnaireForm
from app.services.form_service import load_questionnaire_form

router = APIRouter(tags=["Questionnaire Form"])


@router.get(
    "/form",
    response_model=QuestionnaireForm,
    summary="Get Questionnaire Form Definition",
    description="Retrieve the metadata, demographics, and questionnaire items.",
)
async def get_form(version: Optional[str] = Query(default=None)) -> QuestionnaireForm:
    return load_questionnaire_form(version)
