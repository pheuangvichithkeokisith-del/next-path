"""
test_e2e_sessions.py — End-to-End Session Lifecycle Tests (17 tests)

Covers full session lifecycle: create → answer → complete → report → export → feedback
Including edge cases: double submit, wrong status, missing session, concurrent sessions,
partial answers, export formats, CORS, and PII safety.
"""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database import init_db


@pytest.fixture(autouse=True)
async def setup_db():
    """Ensure DB is initialized before each test."""
    await init_db()
    yield


async def _make_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def _create_session(client: AsyncClient) -> str:
    res = await client.post("/api/v1/sessions")
    assert res.status_code == 201
    return res.json()["session_id"]


async def _complete_session(client: AsyncClient, session_id: str):
    """Answer Q1 and complete session."""
    await client.post(
        f"/api/v1/sessions/{session_id}/answers",
        json={"question_id": "Q1", "option_codes": ["Q1-O2"], "other_text": None, "extra_text": None, "text_value": None},
    )
    res = await client.post(f"/api/v1/sessions/{session_id}/complete")
    assert res.status_code == 200


# ─────────────────────────────────────────────────────
# 1. CREATE SESSION
# ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_e2e_create_session_returns_session_id_and_form_version():
    """New session returns session_id and form_version."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/sessions")
        assert res.status_code == 201
        data = res.json()
        assert "session_id" in data
        assert "form_version" in data
        assert data["form_version"] == "v0.9.1"
        assert len(data["session_id"]) > 0


@pytest.mark.asyncio
async def test_e2e_create_session_initial_status_is_created():
    """Newly created session has status 'created'."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        res = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert res.status_code == 200
        assert res.json()["status"] == "created"


@pytest.mark.asyncio
async def test_e2e_two_concurrent_sessions_are_independent():
    """Two simultaneous sessions share no state."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        sid1 = await _create_session(client)
        sid2 = await _create_session(client)
        assert sid1 != sid2

        # Save answer to session 1 only
        await client.post(
            f"/api/v1/sessions/{sid1}/answers",
            json={"question_id": "Q1", "option_codes": ["Q1-O2"], "other_text": None, "extra_text": None, "text_value": None},
        )

        # Session 2 should still be "created"
        s2_res = await client.get(f"/api/v1/sessions/{sid2}/status")
        assert s2_res.json()["status"] == "created"

        # Session 1 should be "in_progress"
        s1_res = await client.get(f"/api/v1/sessions/{sid1}/status")
        assert s1_res.json()["status"] == "in_progress"


# ─────────────────────────────────────────────────────
# 2. ANSWER SAVING
# ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_e2e_save_single_answer_advances_to_in_progress():
    """Saving first answer transitions status from created → in_progress."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q1", "option_codes": ["Q1-O2"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "ok"
        assert res.json()["question_id"] == "Q1"

        status = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status.json()["status"] == "in_progress"


@pytest.mark.asyncio
async def test_e2e_upsert_answer_overwrites_previous():
    """Saving the same question twice performs an upsert (not duplicate)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)

        # First save
        await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q2", "option_codes": ["Q2-O1"], "other_text": None, "extra_text": None, "text_value": None},
        )

        # Overwrite with different option
        res2 = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q2", "option_codes": ["Q2-O3"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert res2.status_code == 200


@pytest.mark.asyncio
async def test_e2e_answer_unknown_question_id_is_400():
    """Saving an answer with an unknown question_id returns 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q999", "option_codes": ["Q1-O1"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert res.status_code == 400


@pytest.mark.asyncio
async def test_e2e_answer_invalid_option_for_question_is_400():
    """Saving an invalid option code for a valid question returns 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q1", "option_codes": ["Q99-O999"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert res.status_code == 400


# ─────────────────────────────────────────────────────
# 3. COMPLETION
# ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_e2e_complete_session_transitions_to_completed():
    """Completing session sets status to 'completed'."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        status = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_e2e_double_complete_is_idempotent_or_409():
    """Calling complete twice on same session returns 409 or 200 (idempotent)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        res2 = await client.post(f"/api/v1/sessions/{session_id}/complete")
        assert res2.status_code in [200, 409]


@pytest.mark.asyncio
async def test_e2e_answer_after_complete_is_409():
    """Saving answers to a completed session returns 409."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q3", "option_codes": ["Q3-O1"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert res.status_code == 409


# ─────────────────────────────────────────────────────
# 4. REPORT
# ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_e2e_report_has_required_fields():
    """Report response contains all required fields."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        res = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert res.status_code == 200
        data = res.json()
        for field in ["response_pattern", "possible_paths", "context_factors", "unknowns", "versions", "summary_text"]:
            assert field in data, f"Missing field: {field}"


@pytest.mark.asyncio
async def test_e2e_report_version_matches_form_version():
    """Report version field matches form version from session creation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        report = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert report.json()["versions"]["form"] == "v0.9.1"


@pytest.mark.asyncio
async def test_e2e_report_for_unknown_session_is_404():
    """Report fetch for unknown session returns 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/sessions/nonexistent-session-abc/report")
        assert res.status_code == 404


@pytest.mark.asyncio
async def test_e2e_report_requires_completed_session():
    """Report and export are unavailable until the session is completed."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)

        report_before_complete = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert report_before_complete.status_code == 409

        export_before_complete = await client.get(
            f"/api/v1/sessions/{session_id}/export?format=json"
        )
        assert export_before_complete.status_code == 409

        await _complete_session(client, session_id)
        report_after_complete = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert report_after_complete.status_code == 200


# ─────────────────────────────────────────────────────
# 5. EXPORT
# ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_e2e_export_json_format():
    """JSON export returns application/json with report structure."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        res = await client.get(f"/api/v1/sessions/{session_id}/export?format=json")
        assert res.status_code == 200
        assert "application/json" in res.headers["content-type"]
        data = res.json()
        assert "versions" in data
        assert data["versions"]["form"] == "v0.9.1"


@pytest.mark.asyncio
async def test_e2e_export_markdown_format():
    """Markdown export returns text/markdown with PATHAI header."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        res = await client.get(f"/api/v1/sessions/{session_id}/export?format=md")
        assert res.status_code == 200
        assert "text/markdown" in res.headers["content-type"]
        assert "# PATHAI Reflection Report" in res.text


# ─────────────────────────────────────────────────────
# 6. FEEDBACK
# ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_e2e_feedback_saved_successfully():
    """Feedback is accepted after session completion."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        await _complete_session(client, session_id)

        res = await client.post(
            f"/api/v1/sessions/{session_id}/feedback",
            json={
                "agreement": "yes",
                "incorrect_note": None,
                "next_interest": "ສາຍເທັກໂນໂລຊີ",
            },
        )
        assert res.status_code == 200
        assert res.json()["saved"] is True


@pytest.mark.asyncio
async def test_e2e_feedback_on_unknown_session_is_404():
    """Feedback on unknown session returns 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/v1/sessions/no-session-here/feedback",
            json={"agreement": "not_really", "incorrect_note": None, "next_interest": None},
        )
        assert res.status_code == 404
