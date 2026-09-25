from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.ds.engine import evaluate_ds_assessment
from app.models.answer import AnswerModel
from app.models.report import ReportModel
from app.schemas.report import (
    ContextFactors,
    ReportPath,
    ReportPattern,
    ReportResponse,
    ReportVersions,
)
from app.services.session_service import get_session_by_id
from app.validation.ds_contract import extract_ds_assessment_payload
from app.validation.sanitizer import sanitize_for_export
from app.services.v4_report_service import build_v4_report


async def get_or_create_session_report(
    session_id: str,
    db: AsyncSession,
) -> ReportResponse:
    """Retrieve existing stored report or generate and persist reflection report using deterministic DS Engine."""
    session_obj = await get_session_by_id(session_id, db)

    # Check if a report is already stored in the database
    query = select(ReportModel).where(ReportModel.session_id == session_id)
    result = await db.execute(query)
    report_model = result.scalar_one_or_none()

    # Retrieve latest user answers for the session
    ans_query = select(AnswerModel).where(AnswerModel.session_id == session_id)
    ans_result = await db.execute(ans_query)
    answers: List[AnswerModel] = list(ans_result.scalars().all())

    if session_obj.form_version == "v4.0.0":
        # v4.0 has a new question map and scoring contract. Keep it out of the
        # legacy option-code engine so the report cannot silently misinterpret it.
        report_data = build_v4_report(session_obj, answers)
    else:
        # Extract structured DSAssessmentPayload and evaluate with the legacy
        # deterministic DS Engine for v0.9.x sessions.
        payload = extract_ds_assessment_payload(session_obj, answers)
        ds_result = evaluate_ds_assessment(payload)
        report_data = {
            "response_pattern": [p.model_dump() for p in ds_result.response_patterns],
            "possible_paths": [p.model_dump() for p in ds_result.possible_paths],
            "context_factors": {
                "age_band": ds_result.context_factors.age_band,
                "province_code": ds_result.context_factors.province_code or ds_result.context_factors.province_name,
                "has_constraints": ds_result.context_factors.has_constraints,
            },
            "unknowns": ds_result.unknowns,
            "versions": {
                "ds": ds_result.versions.ds,
                "enc": ds_result.versions.enc,
                "form": ds_result.versions.form,
            },
            "summary_text": ds_result.summary_text,
            "template_id": ds_result.template_id,
            "ai_version": "deterministic-0",
        }

    if not report_model:
        report_model = ReportModel(
            session_id=session_id,
            response_pattern=report_data["response_pattern"],
            possible_paths=report_data["possible_paths"],
            context_factors=report_data["context_factors"],
            unknowns=report_data["unknowns"],
            versions=report_data["versions"],
            summary_text=report_data["summary_text"],
            template_id=report_data["template_id"],
            ai_version=report_data["ai_version"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(report_model)
    else:
        report_model.response_pattern = report_data["response_pattern"]
        report_model.possible_paths = report_data["possible_paths"]
        report_model.context_factors = report_data["context_factors"]
        report_model.unknowns = report_data["unknowns"]
        report_model.versions = report_data["versions"]
        report_model.summary_text = report_data["summary_text"]
        report_model.template_id = report_data["template_id"]
        report_model.ai_version = report_data["ai_version"]
        report_model.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(report_model)

    return ReportResponse(
        response_pattern=[ReportPattern(**p) for p in report_model.response_pattern],
        possible_paths=[ReportPath(**p) for p in report_model.possible_paths],
        context_factors=ContextFactors(**report_model.context_factors),
        unknowns=report_model.unknowns,
        versions=ReportVersions(**report_model.versions),
        summary_text=report_model.summary_text,
        template_id=report_model.template_id,
        ai_version=report_model.ai_version,
    )


def generate_report_markdown(report: ReportResponse) -> str:
    """Generate sanitized markdown representation for secure export without PII leakage."""
    patterns_md = "\n".join(
        f"- [{sanitize_for_export(p.section)}] {sanitize_for_export(p.label_lao)}"
        for p in report.response_pattern
    ) or "- ຍັງບໍ່ມີຮູບແບບສະທ້ອນ"
    paths_md = "\n".join(
        f"- {sanitize_for_export(p.group_id)}: {sanitize_for_export(p.label_lao)}"
        for p in report.possible_paths
    ) or "- ຍັງບໍ່ມີເສັ້ນທາງສຳຫຼວດ"
    unknowns_md = "\n".join(
        f"- {sanitize_for_export(u)}" for u in report.unknowns
    ) or "- ບໍ່ມີຂໍ້ທີ່ຍັງບໍ່ຊັດເຈນ"

    age_band = sanitize_for_export(report.context_factors.age_band or "N/A")
    province = sanitize_for_export(report.context_factors.province_code or "N/A")
    form_version = sanitize_for_export(report.versions.form)
    summary_text = sanitize_for_export(report.summary_text)

    return f"""# PATHAI Reflection Report
**Form Version**: {form_version}
**Summary**: {summary_text}

## Response Patterns
{patterns_md}

## Possible Paths
{paths_md}

## Context Factors
- Age: {age_band}
- Province: {province}

## Unknowns (Exploration Opportunities)
{unknowns_md}
"""
