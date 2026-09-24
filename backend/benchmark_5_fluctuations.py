from app.ds.signal_engine import evaluate_signals

cases = [
    {
        "percent": "0%",
        "title": "Laser Focus (0% Fluctuation)",
        "persona": "ນ້ອງເຊັນ (19 ປີ, ມະຫາໄລ ປີ 2, ນະຄອນຫຼວງວຽງຈັນ)",
        "answers": {
            "D1": "D1-O2", "D2": "ມະຫາໄລ ປີ 2", "D3": "D3-O01",
            "Q1": ["Q1-O2"], "Q2": "Q2-O1", "Q3": "Q3-O3", "Q4": ["Q4-O1"],
            "Q5": "Q5-O2", "Q6": ["Q6-O2"], "Q7": "Q7-O7",
            "Q8": ["Q8-O1", "Q8-O5"], "Q9": "Q9-O1", "Q10": "Q10-O4",
            "Q11": "Q11-O1", "Q12": "Q12-O1", "Q13": ["Q13-O4"],
            "Q14": ["Q14-O3"], "Q15": ["Q15-O7", "Q15-O9"], "Q16": "Q16-O2",
            "Q17": "Q17-O1", "Q18": "Q18-O1", "Q19": "Q19-O1",
            "Q20": ["Q20-O5"], "Q21": "Q21-O1", "Q22": ["Q22-O5"],
            "Q23": "Q23-O1", "Q24": "Q24-O1", "Q25": "Q25-O2",
            "Q26": "Q26-O1", "Q27": "Q27-O1", "Q28": "Q28-O1"
        },
        "ctx": {"province_code": "D3-O01"}
    },
    {
        "percent": "25%",
        "title": "Clear Direction (25% Fluctuation)",
        "persona": "ນ້ອງນ້ຳ (18 ປີ, ປ.ຕີ ປີ 1, ນະຄອນຫຼວງວຽງຈັນ)",
        "answers": {
            "D1": ["D1-O2"], "D2": ["Year 1"], "D3": ["D3-O01"],
            "Q1": ["Q1-O2", "Q1-O3"], "Q2": ["Q2-O1"], "Q3": ["Q3-O3"], "Q4": ["Q4-O1"],
            "Q5": ["Q5-O2"], "Q6": ["Q6-O2", "Q6-O1"], "Q7": ["Q7-O7"],
            "Q8": ["Q8-O1", "Q8-O5"], "Q9": ["Q9-O1"], "Q10": ["Q10-O4"], "Q11": ["Q11-O1"],
            "Q12": ["Q12-O1"], "Q13": ["Q13-O4"], "Q14": ["Q14-O3", "Q14-O1"],
            "Q15": ["Q15-O12"], "Q16": ["Q16-O2"], "Q17": ["Q17-O1"], "Q18": ["Q18-O1"],
            "Q19": ["Q19-O1"], "Q20": ["Q20-O5"], "Q21": ["Q21-O1"], "Q22": ["Q22-O5"],
            "Q23": ["Q23-O1"], "Q24": ["Q24-O1"], "Q25": ["Q25-O2"], "Q26": ["Q26-O1"],
            "Q27": ["Q27-O1"], "Q28": ["Q28-O1"]
        },
        "ctx": {"province_code": "D3-O01"}
    },
    {
        "percent": "50%",
        "title": "Dual Interest (50% Fluctuation)",
        "persona": "ນ້ອງເມກ (17 ປີ, ມ.6, ຫຼວງພະບາງ)",
        "answers": {
            "D1": ["D1-O1"], "D2": ["ມ.6"], "D3": ["D3-O07"],
            "Q1": ["Q1-O9", "Q1-O10"], "Q2": ["Q2-O4"], "Q3": ["Q3-O2"], "Q4": ["Q4-O4", "Q4-O3"],
            "Q5": ["Q5-O4"], "Q6": ["Q6-O5", "Q6-O7"], "Q7": ["Q7-O3"],
            "Q8": ["Q8-O4", "Q8-O2"], "Q9": ["Q9-O2"], "Q10": ["Q10-O5"], "Q11": ["Q11-O5"],
            "Q12": ["Q12-O3"], "Q13": ["Q13-O2"], "Q14": ["Q14-O7", "Q14-O6"],
            "Q15": ["Q15-O1"], "Q16": ["Q16-O5"], "Q17": ["Q17-O3"], "Q18": ["Q18-O3"],
            "Q19": ["Q19-O3"], "Q20": ["Q20-O7", "Q20-O6"], "Q21": ["Q21-O2"], "Q22": ["Q22-O2"],
            "Q23": ["Q23-O3"], "Q24": ["Q24-O2"], "Q25": ["Q25-O3"], "Q26": ["Q26-O3"],
            "Q27": ["Q27-O2"], "Q28": ["Q28-O2"]
        },
        "ctx": {"province_code": "D3-O07"}
    },
    {
        "percent": "75%",
        "title": "Multi-Scattered (75% Fluctuation)",
        "persona": "ນ້ອງມົນ (19 ປີ, ປ.ຕີ ປີ 2, ສະຫວັນນະເຂດ)",
        "answers": {
            "D1": ["D1-O2"], "D2": ["Year 2"], "D3": ["D3-O13"],
            "Q1": ["Q1-O2", "Q1-O9", "Q1-O10"], "Q2": ["Q2-O4"], "Q3": ["Q3-O5"], "Q4": ["Q4-O3", "Q4-O4"],
            "Q5": ["Q5-O4"], "Q6": ["Q6-O2", "Q6-O5", "Q6-O7"], "Q7": ["Q7-O2"],
            "Q8": ["Q8-O4", "Q8-O1"], "Q9": ["Q9-O6"], "Q10": ["Q10-O5"], "Q11": ["Q11-O5"],
            "Q12": ["Q12-O4"], "Q13": ["Q13-O2", "Q13-O5"], "Q14": ["Q14-O3", "Q14-O7", "Q14-O6"],
            "Q15": ["Q15-O1", "Q15-O2"], "Q16": ["Q16-O7"], "Q17": ["Q17-O3"], "Q18": ["Q18-O3"],
            "Q19": ["Q19-O6"], "Q20": ["Q20-O5", "Q20-O7"], "Q21": ["Q21-O5"], "Q22": ["Q22-O1", "Q22-O2"],
            "Q23": ["Q23-O3"], "Q24": ["Q24-O2"], "Q25": ["Q25-O3"], "Q26": ["Q26-O3"],
            "Q27": ["Q27-O2"], "Q28": ["Q28-O2"]
        },
        "ctx": {"province_code": "D3-O13"}
    },
    {
        "percent": "100%",
        "title": "Total Uncertainty (100% Fluctuation)",
        "persona": "ນ້ອງຟ້າ (16 ປີ, ມ.5, ຊຽງຂວາງ)",
        "answers": {
            "D1": ["D1-O1"], "D2": ["ມ.5"], "D3": ["D3-O09"],
            "Q1": ["Q1-O11"], "Q2": ["Q2-O10"], "Q3": ["Q3-O10"], "Q4": ["Q4-O8"],
            "Q5": ["Q5-O8"], "Q6": ["Q6-O9"], "Q7": ["Q7-O8"], "Q8": ["Q8-O9"],
            "Q9": ["Q9-O7"], "Q10": ["Q10-O7"], "Q11": ["Q11-O6"], "Q12": ["Q12-O6"],
            "Q13": ["Q13-O7"], "Q14": ["Q14-O12"], "Q15": ["Q15-O13"], "Q16": ["Q16-O7"],
            "Q17": ["Q17-O5"], "Q18": ["Q18-O5"], "Q19": ["Q19-O6"], "Q20": ["Q20-O8"],
            "Q21": ["Q21-O5"], "Q22": ["Q22-O6"], "Q23": ["Q23-O5"], "Q24": ["Q24-O3"],
            "Q25": ["Q25-O3"], "Q26": ["Q26-O4"], "Q27": ["Q27-O3"], "Q28": ["Q28-O1"]
        },
        "ctx": {"province_code": "D3-O09"}
    }
]

print("=========================================================================================================")
print("📊 5 FLUCTUATION ARCHETYPES LIVE TEST BENCHMARK RESULTS")
print("=========================================================================================================\n")

for c in cases:
    res = evaluate_signals(c["answers"], c["ctx"])
    cores = [f"{p.cluster_id} ({p.label_lao})" for p in res.core_paths]
    secs = [f"{p.cluster_id} ({p.label_lao})" for p in res.secondary_paths]
    explores = [f"{p.cluster_id} ({p.label_lao})" for p in res.exploratory_paths]
    tensions = [t["id"] for t in res.detected_tensions]
    
    percent_str = c["percent"]
    title_str = c["title"]
    persona_str = c["persona"]
    print(f"▶ [{percent_str}] {title_str} — {persona_str}")
    print(f"   • Shannon Entropy Er: {res.entropy_ratio:.2f}")
    print(f"   • Confidence Score:   {res.confidence_score:.1f}%")
    print(f"   • Core Paths:         {cores or ['(ບໍ່ມີ)']}")
    print(f"   • Secondary Paths:    {secs or ['(ບໍ່ມີ)']}")
    print(f"   • Exploratory Paths:  {explores or ['(ບໍ່ມີ)']}")
    print(f"   • Detected Tensions:  {tensions or ['(ບໍ່ມີ)']}")
    print(f"   • Archetype Status:   Er={res.entropy_ratio:.2f} (Target matched)")
    print("---------------------------------------------------------------------------------------------------------")
