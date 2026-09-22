from fastapi import APIRouter

from app.routers.form import router as form_router
from app.routers.session import router as session_router
from app.routers.answer import router as answer_router
from app.routers.report import router as report_router
from app.routers.feedback import router as feedback_router

api_router = APIRouter()

api_router.include_router(form_router)
api_router.include_router(session_router)
api_router.include_router(answer_router)
api_router.include_router(report_router)
api_router.include_router(feedback_router)

__all__ = ["api_router"]
