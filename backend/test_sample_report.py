import asyncio
import json
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database import init_db

async def run_sample():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8000") as client:
        # Create session
        res = await client.post("/api/v1/sessions")
        session_id = res.json()["session_id"]
        print(f"=== Session Created: {session_id} ===")

        # Demographics: Vientiane Capital (D3), High School Grade 12 (D2), Male 18 (D1)
        await client.post(f"/api/v1/sessions/{session_id}/answers", json={"question_id": "D1", "option_codes": ["D1-O2"]})
        await client.post(f"/api/v1/sessions/{session_id}/answers", json={"question_id": "D2", "text_value": "ມັດທະຍົມຕອນປາຍ (ມ.7)"})
        await client.post(f"/api/v1/sessions/{session_id}/answers", json={"question_id": "D3", "option_codes": ["D3-O01"]}) # Vientiane Capital

        # Realistic Answers for a Lao youth leaning strongly towards C2 (Software/Tech) & C3 (Design/Creative)
        answers = {
            "Q1": ["Q1-O2", "Q1-O1"],       # multi: Coding / Tech, Creative arts
            "Q2": ["Q2-O1"],                # single: Web/App development
            "Q3": ["Q3-O3"],                # single: Creating tech systems
            "Q4": ["Q4-O1", "Q4-O4"],       # multi: Tech tutorials & programming, Design showcases
            "Q5": ["Q5-O2"],                # single: Quick with computer software
            "Q6": ["Q6-O2", "Q6-O5"],       # multi: Programming / Logic, UI/UX & media editing
            "Q7": ["Q7-O7"],                # single: Built a website/app
            "Q8": ["Q8-O2"],                # single: Autonomy & creative freedom
            "Q9": ["Q9-O1"],                # single: Innovator who builds impactful tech solutions
            "Q10": ["Q10-O2"],              # single: Independent work with collaborative team check-ins
            "Q11": ["Q11-O1"],              # single: Research online & try practical solutions systematically
            "Q12": ["Q12-O3"],              # single: Combine analytical data with personal intuition
            "Q13": ["Q13-O2"],              # single: Flexible workspace with modern computer setup
            "Q14": ["Q14-O3", "Q14-O7"],    # multi: Software engineering, Digital design & multimedia
            "Q15": ["Q15-O6"],              # single: Repetitive physical manual labor without growth
            "Q16": ["Q16-O2"],              # single: Hands-on technical bootcamp & degree in Computer Science
            "Q17": ["Q17-O1"],              # single: Break problem into smaller steps and persist
            "Q18": ["Q18-O2"],              # single: Project-based learning (Learn by building)
            "Q19": ["Q19-O1"],              # single: Working as a Professional Software Engineer / Digital Creator
            "Q20": ["Q20-O5"],              # single: Advancing digital economy & technology in Laos
            "Q21": ["Q21-O2"],              # single: Hybrid / Remote tech work
            "Q22": ["Q22-O4"],              # multi: Need guidance on learning resources & scholarships
            "Q23": ["Q23-O1"],              # single: Ready to study/work in Vientiane Capital or abroad
            "Q24": ["Q24-O2"],              # single: Adapt plan and find alternative pathways
            "Q25": ["Q25-O1"],              # single: Online tutorials, documentation, and building real projects
            "Q26": ["Q26-O1"],              # single: High commitment (1-2 years dedicated learning)
            "Q27": ["Q27-O2"],              # single: Balance between passion and career growth
            "Q28": ["Q28-O1"]               # single: Clear step-by-step roadmap and mentor guidance
        }

        for q_id, opts in answers.items():
            ans_res = await client.post(f"/api/v1/sessions/{session_id}/answers", json={"question_id": q_id, "option_codes": opts})
            if ans_res.status_code != 200:
                print(f"Error answering {q_id}: {ans_res.text}")

        # Complete session
        comp_res = await client.post(f"/api/v1/sessions/{session_id}/complete")
        print(f"Completion Status: {comp_res.json()}")

        # Fetch 6-Part Report
        rep_res = await client.get(f"/api/v1/sessions/{session_id}/report")
        rep = rep_res.json()
        print("\n" + "="*60)
        print("          ✨ PATHAI 6-PART REFLECTION REPORT ✨          ")
        print("="*60)
        print("\n📌 [PART 1: ພາບລວມບຸກຄະລິກກະພາບ (Summary Text)]")
        print(rep.get("summary_text", ""))

        print("\n📊 [PART 2: ຮູບແບບການຕອບສະໜອງ 8 ມິຕິ (Response Patterns)]")
        for p in rep.get("response_pattern", []):
            sec = p.get("section", "")
            pid = p.get("pattern_id", "")
            label = p.get("label_lao", "")
            print(f"  • [{sec}] ({pid}): {label}")

        print("\n🧭 [PART 3: ເສັ້ນທາງອາຊີບ ແລະ ສາຂາວິຊາ (Possible Paths)]")
        for path in rep.get("possible_paths", []):
            gid = path.get("group_id", "")
            label = path.get("label_lao", "")
            is_sample = path.get("is_sample", False)
            tag = "[Sample]" if is_sample else "[Exploration Match]"
            print(f"  🌟 {tag} ({gid}): {label}")

        print("\n🌍 [PART 4: ປັດໄຈແວດລ້ອມ & ຄວາມພ້ອມ (Context Factors)]")
        ctx = rep.get("context_factors", {})
        for k, v in ctx.items():
            print(f"  • {k}: {v}")

        print("\n❓ [PART 5: ສິ່ງທີ່ຍັງເປີດກວ້າງ (Unknowns / Blindspots)]")
        unknowns = rep.get("unknowns", [])
        if unknowns:
            for u in unknowns:
                print(f"  • {u}")
        else:
            print("  • ບໍ່ມີຄຳຖາມຕົກຄ້າງ - ຕອບຄົບຖ້ວນທຸກຂໍ້ 100%")

        print("\n⚙️ [ENGINE METADATA & VERSIONS]")
        vers = rep.get("versions", {})
        print(f"  • Template ID: {rep.get('template_id')} | Engine AI: {rep.get('ai_version')}")
        print(f"  • Form Version: {vers.get('form')} | DS Version: {vers.get('ds')} | Enc: {vers.get('enc')}")

        print("\n" + "="*60)

        # Markdown Export check
        md_res = await client.get(f"/api/v1/sessions/{session_id}/export?format=md")
        print(f"✅ Markdown Export Generated:\n\n{md_res.text}")

if __name__ == "__main__":
    asyncio.run(run_sample())
