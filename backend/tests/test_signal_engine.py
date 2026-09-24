import pytest
from app.ds.signal_engine import (
    CLUSTERS,
    evaluate_signals,
)


def test_evaluate_signals_tech_profile():
    # Tech lover answers
    answers = {
        "Q1": ["Q1-O2"],  # C2: 3
        "Q2": ["Q2-O1"],  # C2: 3, C1: 1
        "Q3": ["Q3-O3"],  # C2: 3, C7: 1
        "Q4": ["Q4-O1"],  # C2: 3
        "Q5": ["Q5-O2"],  # C2: 3
        "Q6": ["Q6-O2"],  # C2: 3
        "Q7": ["Q7-O7"],  # C2: 3
        "Q8": ["Q8-O1"],  # C1: 1, C2: 1
        "Q9": ["Q9-O2"],  # C3: 2, C2: 1
        "Q10": ["Q10-O4"], # C1: 3
        "Q11": ["Q11-O5"], # C1: 1, C2: 1, C3: 1
        "Q12": ["Q12-O1"], # C1: 3
        "Q13": ["Q13-O2"], # C3: 1, C2: 1
        "Q14": ["Q14-O3"], # C2: 3
        "Q15": [],         # No negative
        "Q16": ["Q16-O2"], # C2: 3
        "Q19": ["Q19-O4"], # C1: 1, C2: 1
        "Q20": ["Q20-O5"], # C2: 3, C1: 1
        "Q22": ["Q22-O5"], # No major constraints
        "Q23": ["Q23-O1"], # Ready to move
    }
    res = evaluate_signals(answers)
    assert res.cluster_evaluations["C2"].adjusted_fit >= 68
    assert res.cluster_evaluations["C2"].classification == "core"
    assert "C2" in [p.cluster_id for p in res.core_paths]
    assert res.confidence_score >= 55


def test_evaluate_signals_with_tension_and_soft_negative():
    # Tech lover but feels tech is difficult (Q15-O3)
    answers = {
        "Q1": ["Q1-O2"],
        "Q2": ["Q2-O1"],
        "Q3": ["Q3-O3"],
        "Q4": ["Q4-O1"],
        "Q5": ["Q5-O2"],
        "Q6": ["Q6-O2"],
        "Q7": ["Q7-O7"],
        "Q14": ["Q14-O3"],
        "Q15": ["Q15-O3"],  # Negative tech
        "Q16": ["Q16-O2"],
        "Q22": ["Q22-O1"],  # Time constraint
        "Q23": ["Q23-O4"],  # Cannot move
    }
    res = evaluate_signals(answers)
    # T1 tension (high C2 + Q15-O3)
    tension_ids = [t["id"] for t in res.detected_tensions]
    assert "T1" in tension_ids
    assert res.cluster_evaluations["C2"].negative_factor > 0
    # Soft negative never eliminates path
    assert res.cluster_evaluations["C2"].adjusted_fit > 0
