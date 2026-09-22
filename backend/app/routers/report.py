from typing import Literal
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.report import ReportResponse
from app.services.report_service import (
    generate_report_markdown,
    get_or_create_session_report,
)

router = APIRouter(prefix="/sessions", tags=["Reports & Export"])


@router.get(
    "/{session_id}/report",
    response_model=ReportResponse,
    summary="Get Reflection Report",
    description=(
        "Retrieve the reflection report for a completed session. "
        "Adheres to PATHAI principle: AI provides explanation and reflection, "
        "system does not decide user's future."
    ),
)
async def get_report(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> ReportResponse:
    return await get_or_create_session_report(session_id, db)


@router.get(
    "/{session_id}/export",
    summary="Export Reflection Report",
    description="Export the session reflection report in JSON or Markdown format.",
)
async def export_report(
    session_id: str,
    format: Literal["json", "md"] = Query(
        "json",
        description="Target export file format (json or md)",
    ),
    db: AsyncSession = Depends(get_db),
) -> Response:
    report = await get_or_create_session_report(session_id, db)

    if format == "md":
        md_content = generate_report_markdown(report)
        return Response(
            content=md_content,
            media_type="text/markdown; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="pathai-report-{session_id}.md"',
            },
        )

    json_content = report.model_dump_json(indent=2)
    return Response(
        content=json_content,
        media_type="application/json; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="pathai-report-{session_id}.json"',
        },
    )
