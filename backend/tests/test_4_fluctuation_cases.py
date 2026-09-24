import pytest
from app.ds.signal_engine import evaluate_signals


def test_case_0_0_percent_fluctuation_laser_focus():
    """Case 0: 0% Fluctuation - Laser Focus (Nong Sen 19 Vientiane)"""
    answers = {
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
    }
    res = evaluate_signals(answers, {"province_code": "D3-O01"})

    # Checks
    assert res.entropy_ratio < 0.15, f"Entropy Er {res.entropy_ratio} should be < 0.15"
    assert len(res.core_paths) == 1, "Should have exactly 1 Core path"
    assert res.core_paths[0].cluster_id == "C2", "Core path should be C2 ONLY"
    assert len(res.secondary_paths) == 0, "Laser focus should have 0 secondary paths"
    assert len(res.exploratory_paths) == 0, "Laser focus should have 0 exploratory paths"
    assert len(res.caution_paths) == 0, "Laser focus should have 0 caution paths"


def test_case_1_100_percent_fluctuation_need_support():
    """Case 1: 100% Fluctuation - Total Uncertainty (Nong Fah 16 Xiengkhouang)"""
    answers = {
        "D1": ["D1-O1"], "D2": ["ມ.5"], "D3": ["D3-O09"],
        "Q1": ["Q1-O11"], "Q2": ["Q2-O10"], "Q3": ["Q3-O10"], "Q4": ["Q4-O8"],
        "Q5": ["Q5-O8"], "Q6": ["Q6-O9"], "Q7": ["Q7-O8"], "Q8": ["Q8-O9"],
        "Q9": ["Q9-O7"], "Q10": ["Q10-O7"], "Q11": ["Q11-O6"], "Q12": ["Q12-O6"],
        "Q13": ["Q13-O7"], "Q14": ["Q14-O12"], "Q15": ["Q15-O13"], "Q16": ["Q16-O7"],
        "Q17": ["Q17-O5"], "Q18": ["Q18-O5"], "Q19": ["Q19-O6"], "Q20": ["Q20-O8"],
        "Q21": ["Q21-O5"], "Q22": ["Q22-O6"], "Q23": ["Q23-O5"], "Q24": ["Q24-O3"],
        "Q25": ["Q25-O3"], "Q26": ["Q26-O4"], "Q27": ["Q27-O3"], "Q28": ["Q28-O1"]
    }
    res = evaluate_signals(answers, {"province_code": "D3-O09"})

    # Checks
    assert res.entropy_ratio >= 0.85, f"Entropy Er {res.entropy_ratio} should be >= 0.85"
    assert len(res.core_paths) == 0, "Need support should have no core paths"
    assert len(res.secondary_paths) == 0, "Need support should have no secondary paths"
    assert 20 <= res.confidence_score <= 30, f"Confidence {res.confidence_score} should be 20-30"
    assert len(res.detected_tensions) == 0, "Should have no tensions"
    for p in res.cluster_evaluations.values():
        assert p.classification == "low_fit", f"Cluster {p.cluster_id} should be low fit"


def test_case_2_75_percent_fluctuation_multi_scattered():
    """Case 2: 75% Fluctuation - Multi-Scattered Interest (Nong Mon 19 Savannakhet)"""
    answers = {
        "D1": ["D1-O2"], "D2": ["Year 2"], "D3": ["D3-O13"],
        "Q1": ["Q1-O2", "Q1-O9", "Q1-O10"], "Q2": ["Q2-O4"], "Q3": ["Q3-O5"], "Q4": ["Q4-O3", "Q4-O4"],
        "Q5": ["Q5-O4"], "Q6": ["Q6-O2", "Q6-O5", "Q6-O7"], "Q7": ["Q7-O2"],
        "Q8": ["Q8-O4", "Q8-O1"], "Q9": ["Q9-O6"], "Q10": ["Q10-O5"], "Q11": ["Q11-O5"],
        "Q12": ["Q12-O4"], "Q13": ["Q13-O2", "Q13-O5"], "Q14": ["Q14-O3", "Q14-O7", "Q14-O6"],
        "Q15": ["Q15-O1", "Q15-O2"], "Q16": ["Q16-O7"], "Q17": ["Q17-O3"], "Q18": ["Q18-O3"],
        "Q19": ["Q19-O6"], "Q20": ["Q20-O5", "Q20-O7"], "Q21": ["Q21-O5"], "Q22": ["Q22-O1", "Q22-O2"],
        "Q23": ["Q23-O3"], "Q24": ["Q24-O2"], "Q25": ["Q25-O3"], "Q26": ["Q26-O3"],
        "Q27": ["Q27-O2"], "Q28": ["Q28-O2"]
    }
    res = evaluate_signals(answers, {"province_code": "D3-O13"})

    # Checks
    assert 0.65 <= res.entropy_ratio <= 0.84, f"Entropy Er {res.entropy_ratio} should be 0.65-0.84"
    assert len(res.core_paths) == 0, "Multi-scattered should not have core paths"
    assert 35 <= res.confidence_score <= 45, f"Confidence {res.confidence_score} should be 35-45"
    tension_ids = [t["id"] for t in res.detected_tensions]
    assert "T1" in tension_ids, "Should detect T1"
    assert "T6" in tension_ids, "Should detect T6"
    assert 68 <= res.cluster_evaluations["C3"].feasibility_score <= 78, "Feasibility should be around 68-78"


def test_case_3_50_percent_fluctuation_dual_interest():
    """Case 3: 50% Fluctuation - Dual Interest (Nong Mek 17 Luang Prabang)"""
    answers = {
        "D1": ["D1-O1"], "D2": ["ມ.6"], "D3": ["D3-O07"],
        "Q1": ["Q1-O9", "Q1-O10"], "Q2": ["Q2-O4"], "Q3": ["Q3-O2"], "Q4": ["Q4-O4", "Q4-O3"],
        "Q5": ["Q5-O4"], "Q6": ["Q6-O5", "Q6-O7"], "Q7": ["Q7-O3"],
        "Q8": ["Q8-O4", "Q8-O2"], "Q9": ["Q9-O2"], "Q10": ["Q10-O5"], "Q11": ["Q11-O5"],
        "Q12": ["Q12-O3"], "Q13": ["Q13-O2"], "Q14": ["Q14-O7", "Q14-O6"],
        "Q15": ["Q15-O1"], "Q16": ["Q16-O5"], "Q17": ["Q17-O3"], "Q18": ["Q18-O3"],
        "Q19": ["Q19-O3"], "Q20": ["Q20-O7", "Q20-O6"], "Q21": ["Q21-O2"], "Q22": ["Q22-O2"],
        "Q23": ["Q23-O3"], "Q24": ["Q24-O2"], "Q25": ["Q25-O3"], "Q26": ["Q26-O3"],
        "Q27": ["Q27-O2"], "Q28": ["Q28-O2"]
    }
    res = evaluate_signals(answers, {"province_code": "D3-O07"})

    # Checks
    assert 0.40 <= res.entropy_ratio <= 0.64, f"Entropy Er {res.entropy_ratio} should be 0.40-0.64"
    assert len(res.core_paths) == 0, "Dual interest with tension should not have core paths"
    sec_ids = [p.cluster_id for p in res.secondary_paths]
    assert "C3" in sec_ids, "C3 should be secondary"
    assert "C6" in sec_ids, "C6 should be secondary"
    assert 55 <= res.confidence_score <= 65, f"Confidence {res.confidence_score} should be 55-65"
    tension_ids = [t["id"] for t in res.detected_tensions]
    assert "T6" in tension_ids, "Should detect T6"


def test_case_4_25_percent_fluctuation_clear_direction():
    """Case 4: 25% Fluctuation - Clear Direction (Nong Nam 18 Vientiane)"""
    answers = {
        "D1": ["D1-O2"], "D2": ["Year 1"], "D3": ["D3-O01"],
        "Q1": ["Q1-O2", "Q1-O3"], "Q2": ["Q2-O1"], "Q3": ["Q3-O3"], "Q4": ["Q4-O1"],
        "Q5": ["Q5-O2"], "Q6": ["Q6-O2", "Q6-O1"], "Q7": ["Q7-O7"],
        "Q8": ["Q8-O1", "Q8-O5"], "Q9": ["Q9-O1"], "Q10": ["Q10-O4"], "Q11": ["Q11-O1"],
        "Q12": ["Q12-O1"], "Q13": ["Q13-O4"], "Q14": ["Q14-O3", "Q14-O1"],
        "Q15": ["Q15-O12"], "Q16": ["Q16-O2"], "Q17": ["Q17-O1"], "Q18": ["Q18-O1"],
        "Q19": ["Q19-O1"], "Q20": ["Q20-O5"], "Q21": ["Q21-O1"], "Q22": ["Q22-O5"],
        "Q23": ["Q23-O1"], "Q24": ["Q24-O1"], "Q25": ["Q25-O2"], "Q26": ["Q26-O1"],
        "Q27": ["Q27-O1"], "Q28": ["Q28-O1"]
    }
    res = evaluate_signals(answers, {"province_code": "D3-O01"})

    # Checks
    assert 0.15 <= res.entropy_ratio <= 0.39, f"Entropy Er {res.entropy_ratio} should be 0.15-0.39"
    assert len(res.core_paths) == 1, "Should have exactly 1 core path"
    assert res.core_paths[0].cluster_id == "C2", "Core path should be C2 Tech"
    assert 75 <= res.confidence_score <= 85, f"Confidence {res.confidence_score} should be 75-85"
    assert res.cluster_evaluations["C2"].feasibility_score == 100.0, "Feasibility should be 100"
    assert len(res.detected_tensions) == 0, "Should have no tensions"
