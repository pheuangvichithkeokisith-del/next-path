import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database import init_db


@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    """Ensure DB tables are initialized before tests."""
    await init_db()
    yield


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_get_form():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/form")
        assert response.status_code == 200
        data = response.json()
        assert "meta" in data
        assert "demographics" in data
        assert "questions" in data
        assert len(data["demographics"]) > 0
        assert len(data["questions"]) > 0


@pytest.mark.asyncio
async def test_session_lifecycle_and_answers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Create session
        create_res = await client.post("/api/v1/sessions")
        assert create_res.status_code == 201
        session_data = create_res.json()
        assert "session_id" in session_data
        assert "form_version" in session_data
        session_id = session_data["session_id"]

        # 2. Check initial status
        status_res = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "created"

        # 3. Save an answer
        answer_payload = {
            "question_id": "Q1",
            "option_codes": ["Q1-O1", "Q1-O2"],
            "other_text": None,
            "extra_text": None,
            "text_value": None,
        }
        ans_res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json=answer_payload,
        )
        assert ans_res.status_code == 200
        assert ans_res.json()["status"] == "ok"

        # 4. Check status advanced to in_progress
        status_res2 = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res2.status_code == 200
        assert status_res2.json()["status"] == "in_progress"

        # 5. Update the same answer (upsert test)
        update_payload = {
            "question_id": "Q1",
            "option_codes": ["Q1-O3"],
            "other_text": "Updated custom reason",
            "extra_text": None,
            "text_value": None,
        }
        ans_update_res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json=update_payload,
        )
        assert ans_update_res.status_code == 200

        # 6. Complete session
        complete_res = await client.post(f"/api/v1/sessions/{session_id}/complete")
        assert complete_res.status_code == 200
        assert complete_res.json()["status"] == "completed"

        # 7. Verify status is completed
        status_res3 = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res3.status_code == 200
        assert status_res3.json()["status"] == "completed"

        # 8. Retrieve report
        report_res = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert report_res.status_code == 200
        report_data = report_res.json()
        assert "response_pattern" in report_data
        assert "possible_paths" in report_data
        assert "context_factors" in report_data
        assert "unknowns" in report_data
        assert "versions" in report_data
        assert "summary_text" in report_data

        # 9. Export report (JSON)
        export_json = await client.get(f"/api/v1/sessions/{session_id}/export?format=json")
        assert export_json.status_code == 200
        assert export_json.headers["content-type"].startswith("application/json")
        assert "response_pattern" in export_json.json()

        # 10. Export report (Markdown)
        export_md = await client.get(f"/api/v1/sessions/{session_id}/export?format=md")
        assert export_md.status_code == 200
        assert "text/markdown" in export_md.headers["content-type"]
        assert "# PATHAI Reflection Report" in export_md.text

        # 11. Submit feedback
        feedback_payload = {
            "agreement": "yes",
            "incorrect_note": None,
            "next_interest": "Software Engineering & Data Analysis",
        }
        feedback_res = await client.post(
            f"/api/v1/sessions/{session_id}/feedback",
            json=feedback_payload,
        )
        assert feedback_res.status_code == 200
        assert feedback_res.json()["saved"] is True


@pytest.mark.asyncio
async def test_nonexistent_session_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/sessions/invalid-uuid-999/status")
        assert res.status_code == 404
