import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.report import ReportModel
from app.models.session import SessionModel
from app.schemas.report import ReportResponse
from app.services.report_service import get_or_create_session_report


@pytest.mark.asyncio
async def test_concurrent_report_requests_create_one_report(monkeypatch: pytest.MonkeyPatch) -> None:
    session_id = str(uuid4())
    async with AsyncSessionLocal() as db:
        db.add(
            SessionModel(
                id=session_id,
                form_version="v0.9.1",
                status="completed",
                completed_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()

    original_execute = AsyncSession.execute
    report_lookup_count = 0
    report_lookups_ready = asyncio.Event()
    lookup_count_lock = asyncio.Lock()

    async def synchronized_execute(self: AsyncSession, statement, *args, **kwargs):
        nonlocal report_lookup_count
        result = await original_execute(self, statement, *args, **kwargs)
        statement_text = str(statement)
        if "FROM reports" in statement_text and "session_id" in statement_text:
            async with lookup_count_lock:
                report_lookup_count += 1
                if report_lookup_count == 2:
                    report_lookups_ready.set()
            await report_lookups_ready.wait()
        return result

    monkeypatch.setattr(AsyncSession, "execute", synchronized_execute)

    async with AsyncSessionLocal() as first_db, AsyncSessionLocal() as second_db:
        results = await asyncio.wait_for(
            asyncio.gather(
                get_or_create_session_report(session_id, first_db),
                get_or_create_session_report(session_id, second_db),
                return_exceptions=True,
            ),
            timeout=5,
        )

    assert all(isinstance(result, ReportResponse) for result in results), results

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ReportModel).where(ReportModel.session_id == session_id)
        )
        assert len(result.scalars().all()) == 1
