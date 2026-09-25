import json
import itertools
import random
from pathlib import Path
from app.ds.signal_engine import evaluate_signals, POSITIVE_SIGNALS, QUESTION_TYPE

def generate_synthetic_profiles():
    random.seed(42)
    profiles = {}
    
    # 1. Five Fluctuation archetypes (Sen, Nam, Mek, Mon, Fah)
    profiles["sen_laser_c2"] = {
        "D1": "D1-O2", "D3": "D3-O01",
        "Q1": ["Q1-O2"], "Q2": "Q2-O1", "Q3": "Q3-O3", "Q4": ["Q4-O1"],
        "Q5": "Q5-O2", "Q6": ["Q6-O2"], "Q7": "Q7-O7",
        "Q8": ["Q8-O1", "Q8-O5"], "Q9": "Q9-O1", "Q10": "Q10-O4",
        "Q11": "Q11-O1", "Q12": "Q12-O1", "Q13": ["Q13-O4"],
        "Q14": ["Q14-O3"], "Q15": ["Q15-O7", "Q15-O9"], "Q16": "Q16-O2",
        "Q19": "Q19-O1", "Q20": ["Q20-O5"], "Q22": ["Q22-O5"], "Q23": "Q23-O1"
    }
    
    profiles["nam_clear_c2"] = {
        "D1": "D1-O2", "D3": "D3-O01",
        "Q1": ["Q1-O2", "Q1-O3"], "Q2": "Q2-O1", "Q3": "Q3-O3", "Q4": ["Q4-O1"],
        "Q5": "Q5-O2", "Q6": ["Q6-O2", "Q6-O1"], "Q7": "Q7-O7",
        "Q8": ["Q8-O1", "Q8-O5"], "Q9": "Q9-O1", "Q10": "Q10-O4",
        "Q11": "Q11-O1", "Q12": "Q12-O1", "Q13": ["Q13-O4"],
        "Q14": ["Q14-O3", "Q14-O1"], "Q15": ["Q15-O12"], "Q16": "Q16-O2",
        "Q19": "Q19-O1", "Q20": ["Q20-O5"], "Q22": ["Q22-O5"], "Q23": "Q23-O1"
    }
    
    profiles["mek_dual_c3_c6"] = {
        "D1": "D1-O1", "D3": "D3-O07",
        "Q1": ["Q1-O9", "Q1-O10"], "Q2": "Q2-O4", "Q3": "Q3-O2", "Q4": ["Q4-O4", "Q4-O3"],
        "Q5": "Q5-O4", "Q6": ["Q6-O5", "Q6-O7"], "Q7": "Q7-O3",
        "Q8": ["Q8-O4", "Q8-O2"], "Q9": "Q9-O2", "Q10": "Q10-O5",
        "Q11": "Q11-O5", "Q12": "Q12-O3", "Q13": ["Q13-O2"],
        "Q14": ["Q14-O7", "Q14-O6"], "Q15": ["Q15-O1"], "Q16": "Q16-O5",
        "Q19": "Q19-O3", "Q20": ["Q20-O7", "Q20-O6"], "Q22": ["Q22-O2"], "Q23": "Q23-O3"
    }
    
    profiles["mon_multi_c2_c3_c6"] = {
        "D1": "D1-O2", "D3": "D3-O13",
        "Q1": ["Q1-O2", "Q1-O9", "Q1-O10"], "Q2": "Q2-O4", "Q3": "Q3-O5", "Q4": ["Q4-O3", "Q4-O4"],
        "Q5": "Q5-O4", "Q6": ["Q6-O2", "Q6-O5", "Q6-O7"], "Q7": "Q7-O2",
        "Q8": ["Q8-O4", "Q8-O1"], "Q9": ["Q9-O6"], "Q10": ["Q10-O5"],
        "Q11": "Q11-O5", "Q12": "Q12-O4", "Q13": ["Q13-O2", "Q13-O5"],
        "Q14": ["Q14-O3", "Q14-O7", "Q14-O6"], "Q15": ["Q15-O1", "Q15-O2"],
        "Q16": "Q16-O7", "Q19": "Q19-O6", "Q20": ["Q20-O5", "Q20-O7"],
        "Q22": ["Q22-O1", "Q22-O2"], "Q23": "Q23-O3"
    }
    
    profiles["fah_uncertain"] = {
        "D1": "D1-O1", "D3": "D3-O09",
        "Q1": ["Q1-O11"], "Q2": "Q2-O10", "Q3": "Q3-O10", "Q4": ["Q4-O8"],
        "Q5": "Q5-O8", "Q6": ["Q6-O9"], "Q7": "Q7-O8", "Q8": ["Q8-O9"],
        "Q9": "Q9-O7", "Q10": "Q10-O7", "Q11": "Q11-O6", "Q12": "Q12-O6",
        "Q13": ["Q13-O7"], "Q14": ["Q14-O12"], "Q15": ["Q15-O13"], "Q16": "Q16-O7",
        "Q19": "Q19-O6", "Q20": ["Q20-O8"], "Q22": ["Q22-O6"], "Q23": "Q23-O5"
    }
    
    # 2. Pure synthetic clusters C1 to C7
    clusters = ["C1", "C2", "C3", "C4", "C5", "C6", "C7"]
    for c in clusters:
        p_ans = {"D1": "D1-O2", "D3": "D3-O01"}
        for qid in POSITIVE_SIGNALS:
            opts = [(oid, sigs.get(c, 0)) for oid, sigs in POSITIVE_SIGNALS[qid].items() if sigs.get(c, 0) > 0]
            if opts:
                opts.sort(key=lambda x: -x[1])
                qtype = QUESTION_TYPE.get(qid, "single")
                max_s = 3 if qtype == "multi" else 1
                if qid == "Q4": max_s = 2
                p_ans[qid] = [o[0] for o in opts[:max_s]]
        p_ans["Q15"] = ["Q15-O12"]
        p_ans["Q22"] = ["Q22-O5"]
        p_ans["Q23"] = ["Q23-O1"]
        profiles[f"pure_{c.lower()}"] = p_ans
        
    # 3. Dual pairs combinations (21 pairs)
    for c1, c2 in itertools.combinations(clusters, 2):
        p_ans = {"D1": "D1-O2", "D3": "D3-O01"}
        for qid in POSITIVE_SIGNALS:
            opts = [(oid, max(sigs.get(c1, 0), sigs.get(c2, 0))) for oid, sigs in POSITIVE_SIGNALS[qid].items() if sigs.get(c1, 0) > 0 or sigs.get(c2, 0) > 0]
            if opts:
                opts.sort(key=lambda x: -x[1])
                qtype = QUESTION_TYPE.get(qid, "single")
                max_s = 3 if qtype == "multi" else 1
                p_ans[qid] = [o[0] for o in opts[:max_s]]
        p_ans["Q15"] = ["Q15-O12"]
        p_ans["Q22"] = ["Q22-O5"]
        p_ans["Q23"] = ["Q23-O1"]
        profiles[f"dual_{c1.lower()}_{c2.lower()}"] = p_ans
        
    # 4. 70 randomized realistic youth profiles
    for idx in range(70):
        p_ans = {
            "D1": random.choice(["D1-O1", "D1-O2", "D1-O3"]),
            "D3": random.choice(["D3-O01", "D3-O07", "D3-O13", "D3-O09", "D3-O16"])
        }
        for qid, opts_dict in POSITIVE_SIGNALS.items():
            all_o = list(opts_dict.keys())
            qtype = QUESTION_TYPE.get(qid, "single")
            k = random.randint(1, 3) if qtype == "multi" else 1
            if qid == "Q4": k = min(k, 2)
            p_ans[qid] = random.sample(all_o, min(k, len(all_o)))
        p_ans["Q15"] = random.sample(["Q15-O1", "Q15-O3", "Q15-O7", "Q15-O9", "Q15-O12", "Q15-O13"], 1)
        p_ans["Q22"] = random.sample(["Q22-O1", "Q22-O2", "Q22-O5", "Q22-O6"], 1)
        p_ans["Q23"] = random.sample(["Q23-O1", "Q23-O3", "Q23-O4", "Q23-O5"], 1)
        profiles[f"random_user_{idx+1:02d}"] = p_ans

    return profiles

def snapshot(output_path: str):
    profiles = generate_synthetic_profiles()
    results = {}
    for pid, answers in profiles.items():
        demographics = {"province_code": answers.get("D3", "")}
        res = evaluate_signals(answers, demographics)
        
        er = res.entropy_ratio
        if er < 0.15:
            arch = "Laser Focus"
        elif er < 0.40:
            arch = "Clear Direction"
        elif er < 0.65:
            arch = "Dual Interest"
        elif er < 0.85:
            arch = "Multi-Scattered"
        else:
            arch = "Total Uncertainty"
            
        results[pid] = {
            "algorithm_version": res.algorithm_version,
            "entropy_ratio": er,
            "archetype": arch,
            "confidence": res.confidence_score,
            "core": [p.cluster_id for p in res.core_paths],
            "secondary": [p.cluster_id for p in res.secondary_paths],
            "exploratory": [p.cluster_id for p in res.exploratory_paths],
            "caution": [p.cluster_id for p in res.caution_paths],
        }
        
    p = Path(output_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {len(results)} profile snapshots to {output_path}")

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "snapshots/v1.1.2.json"
    snapshot(out)
