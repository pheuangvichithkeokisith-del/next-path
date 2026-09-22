from fastapi import APIRouter
from app.schemas.form import QuestionnaireForm
from app.services.form_service import load_questionnaire_form

router = APIRouter(tags=["Questionnaire Form"])


@router.get(
    "/form",
    response_model=QuestionnaireForm,
    summary="Get Questionnaire Form Definition",
    description="Retrieve the metadata, demographics, and questionnaire items.",
)
async def get_form() -> QuestionnaireForm:
    return load_questionnaire_form()
