import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database import init_db


@pytest.mark.asyncio
async def test_cors_headers():
    """Verify CORS preflight and response headers for frontend client at http://localhost:3000."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8000") as client:
        # Preflight OPTIONS request
        options_res = await client.options("/api/v1/sessions", headers=headers)
        assert options_res.status_code == 200
        assert options_res.headers.get("access-control-allow-origin") in ["http://localhost:3000", "*"]

        # Actual POST request with Origin header
        post_res = await client.post("/api/v1/sessions", headers={"Origin": "http://localhost:3000"})
        assert post_res.status_code == 201
        assert post_res.headers.get("access-control-allow-origin") in ["http://localhost:3000", "*"]


@pytest.mark.asyncio
async def test_complete_user_flow_28q():
    """Verify complete user flow: form load, session creation, 28Q + 3 Demographics answers, completion, report retrieval, exports, and feedback."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8000") as client:
        # Step 1: Frontend fetches questionnaire form
        form_res = await client.get("/api/v1/form")
        assert form_res.status_code == 200
        form_data = form_res.json()
        assert "demographics" in form_data
        assert "questions" in form_data
        demographics = form_data["demographics"]
        questions = form_data["questions"]
        assert len(demographics) == 3, f"Expected 3 demographics items, got {len(demographics)}"
        assert len(questions) == 28, f"Expected 28 question items, got {len(questions)}"

        # Step 2: User clicks start on /introduction -> create anonymous session
        session_res = await client.post("/api/v1/sessions")
        assert session_res.status_code == 201
        session_data = session_res.json()
        session_id = session_data["session_id"]
        assert session_id is not None
        assert session_data["form_version"] == "v0.9.1"

        # Step 3: Check initial status
        status_res = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "created"

        # Step 4: Answer 3 Demographics items (D1, D2, D3)
        # D1 (Single choice)
        d1_res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "D1", "option_codes": ["D1-O2"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert d1_res.status_code == 200

        # D2 (Text input)
        d2_res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "D2", "option_codes": [], "other_text": None, "extra_text": None, "text_value": "ມັດທະຍົມຕອນປາຍ (ມ.7)"},
        )
        assert d2_res.status_code == 200

        # D3 (Single choice - province)
        d3_res = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "D3", "option_codes": ["D3-O01"], "other_text": None, "extra_text": None, "text_value": None},
        )
        assert d3_res.status_code == 200

        # Step 5: Answer all 28 Questions (Q1 to Q28)
        for i, q in enumerate(questions, start=1):
            q_id = q["id"]
            q_type = q["type"]
            options = q.get("options") or []
            
            if q_type == "multi":
                selected_codes = [opt["code"] for opt in options[:2]] if options else []
            elif q_type == "single":
                selected_codes = [options[0]["code"]] if options else []
            else:
                selected_codes = []

            payload = {
                "question_id": q_id,
                "option_codes": selected_codes,
                "other_text": "Option detail" if any(opt.get("has_other") for opt in options) and i % 5 == 0 else None,
                "extra_text": "Sample note" if q.get("extra_text") else None,
                "text_value": f"Text value for {q_id}" if q_type == "text" else None,
            }

            ans_res = await client.post(
                f"/api/v1/sessions/{session_id}/answers",
                json=payload,
            )
            assert ans_res.status_code == 200
            assert ans_res.json()["status"] == "ok"
            assert ans_res.json()["question_id"] == q_id

        # Step 6: Verify status is now 'in_progress'
        status_res = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "in_progress"

        # Step 7: User completes questionnaire (/assessment -> executeComplete)
        complete_res = await client.post(f"/api/v1/sessions/{session_id}/complete")
        assert complete_res.status_code == 200
        assert complete_res.json()["status"] == "completed"

        # Step 8: Frontend polling on /processing checks status
        status_res = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "completed"

        # Step 9: Frontend loads /report page and calls getReport(sessionId)
        report_res = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert report_res.status_code == 200
        report = report_res.json()
        assert len(report["response_pattern"]) > 0
        assert len(report["possible_paths"]) > 0
        assert "summary_text" in report
        assert "context_factors" in report
        assert "unknowns" in report
        assert "versions" in report

        # Step 10: User downloads JSON export
        export_json = await client.get(f"/api/v1/sessions/{session_id}/export?format=json")
        assert export_json.status_code == 200
        assert "application/json" in export_json.headers["content-type"]
        json_body = export_json.json()
        assert json_body["versions"]["form"] == "v0.9.1"

        # Step 11: User downloads Markdown export
        export_md = await client.get(f"/api/v1/sessions/{session_id}/export?format=md")
        assert export_md.status_code == 200
        assert "text/markdown" in export_md.headers["content-type"]
        assert "# PATHAI Reflection Report" in export_md.text
        assert "## Response Patterns" in export_md.text
        assert "## Possible Paths" in export_md.text

        # Step 12: User submits feedback on /feedback page
        feedback_res = await client.post(
            f"/api/v1/sessions/{session_id}/feedback",
            json={
                "agreement": "yes",
                "incorrect_note": None,
                "next_interest": "ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ",
            },
        )
        assert feedback_res.status_code == 200
        assert feedback_res.json()["saved"] is True
