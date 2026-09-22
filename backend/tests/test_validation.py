import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database import init_db, AsyncSessionLocal
from app.services.session_service import create_anonymous_session, get_session_by_id
from app.services.answer_service import save_session_answer, get_session_answers
from app.schemas.answer import AnswerCreate
from app.validation.ds_contract import extract_ds_assessment_payload
from app.validation.sanitizer import sanitize_text, check_for_pii


@pytest.mark.asyncio
async def test_pii_scrubbing_and_injection_prevention():
    """Verify sanitizer neutralizes HTML/script injection and redacts PII."""
    raw_input = "<script>alert('hack')</script> Contact me at user.test@example.la or call +856 20 5555 1234"
    cleaned = sanitize_text(raw_input)
    
    assert "<script>" not in cleaned
    assert "[REDACTED_EMAIL]" in cleaned
    assert "[REDACTED_PHONE]" in cleaned
    assert "user.test@example.la" not in cleaned
    assert "+856 20 5555 1234" not in cleaned


@pytest.mark.asyncio
async def test_answer_validation_rules():
    """Verify constraint enforcement on question options, single/multi select, and exclusive codes."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Create session
        res = await client.post("/api/v1/sessions")
        session_id = res.json()["session_id"]

        # 2. Test unknown question ID
        bad_qid = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q999", "option_codes": ["Q1-O1"]},
        )
        assert bad_qid.status_code == 400
        assert "Invalid question_id" in bad_qid.json()["detail"]

        # 3. Test invalid option code for valid question
        bad_opt = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q1", "option_codes": ["Q99-O999"]},
        )
        assert bad_opt.status_code == 400
        assert "is not valid for question" in bad_opt.json()["detail"]

        # 4. Test single-choice constraint (Q2 is single choice)
        multi_on_single = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q2", "option_codes": ["Q2-O1", "Q2-O2"]},
        )
        assert multi_on_single.status_code == 400
        assert "is single-choice" in multi_on_single.json()["detail"]

        # 5. Test max_select constraint (Q4 has max_select = 2)
        exceed_max = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q4", "option_codes": ["Q4-O1", "Q4-O2", "Q4-O3"]},
        )
        assert exceed_max.status_code == 400
        assert "allows at most 2" in exceed_max.json()["detail"]

        # 6. Test exclusive option constraint (Q4-O9 is exclusive 'ບໍ່ຄ່ອຍໄດ້ເບິ່ງ')
        exclusive_conflict = await client.post(
            f"/api/v1/sessions/{session_id}/answers",
            json={"question_id": "Q4", "option_codes": ["Q4-O1", "Q4-O9"]},
        )
        assert exclusive_conflict.status_code == 400
        assert "Exclusive option" in exclusive_conflict.json()["detail"]


@pytest.mark.asyncio
async def test_form_version_tracking():
    """Verify session maintains exact form version and propagates to report metadata."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/sessions")
        session_id = res.json()["session_id"]
        assert res.json()["form_version"] == "v0.9.1"

        status_res = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_res.json()["form_version"] == "v0.9.1"

        report_res = await client.get(f"/api/v1/sessions/{session_id}/report")
        assert report_res.json()["versions"]["form"] == "v0.9.1"


@pytest.mark.asyncio
async def test_ds_engine_payload_compatibility():
    """Verify DS feature extraction produces strongly-typed, complete payload for future DS scoring."""
    async with AsyncSessionLocal() as db:
        session_res = await create_anonymous_session(db)
        session_id = session_res.session_id

        # Add demographics
        await save_session_answer(
            session_id,
            AnswerCreate(question_id="D1", option_codes=["D1-O2"]),
            db,
        )
        await save_session_answer(
            session_id,
            AnswerCreate(question_id="D2", text_value="ຊັ້ນສູງ / ປະລິນຍາຕີ"),
            db,
        )
        await save_session_answer(
            session_id,
            AnswerCreate(question_id="D3", option_codes=["D3-O01"]),
            db,
        )

        # Add questions Q1 to Q28
        for q_num in range(1, 29):
            qid = f"Q{q_num}"
            await save_session_answer(
                session_id,
                AnswerCreate(question_id=qid, option_codes=[f"{qid}-O1"]),
                db,
            )

        session_obj = await get_session_by_id(session_id, db)
        answers = await get_session_answers(session_id, db)

        ds_payload = extract_ds_assessment_payload(session_obj, answers)

        assert ds_payload.session_id == session_id
        assert ds_payload.form_version == "v0.9.1"
        assert ds_payload.demographics.age_band == "18–20 ປີ"
        assert ds_payload.demographics.province_name == "ນະຄອນຫຼວງວຽງຈັນ"
        assert ds_payload.demographics.education_level == "ຊັ້ນສູງ / ປະລິນຍາຕີ"
        assert ds_payload.total_answered == 28
        assert ds_payload.total_expected_questions == 28
        assert ds_payload.is_ready_for_evaluation is True
        assert len(ds_payload.missing_questions) == 0
        assert "Q1" in ds_payload.responses
        assert ds_payload.responses["Q1"].option_codes == ["Q1-O1"]
