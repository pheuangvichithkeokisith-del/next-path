import pytest
from app.ds.signal_engine import (
    CLUSTERS,
    clamp,
    compute_shannon_entropy_ratio,
    evaluate_signals,
    smoothstep,
)


def test_smoothstep_properties():
    assert smoothstep(0.0) == 0.0
    assert smoothstep(0.5) == 0.5
    assert smoothstep(1.0) == 1.0
    assert smoothstep(-0.5) == 0.0
    assert smoothstep(1.5) == 1.0


def test_entropy_ratio_two_close_clusters_is_dual():
    s = {"C1": 100.0, "C2": 85.0, "C3": 10.0}
    er = compute_shannon_entropy_ratio(s, 0)
    assert 0.40 <= er < 0.65, f"Expected Dual Interest [0.40, 0.64], got {er}"


def test_entropy_ratio_three_close_clusters_is_multi():
    s = {"C1": 75.0, "C2": 55.0, "C3": 55.0}
    er = compute_shannon_entropy_ratio(s, 0)
    assert 0.65 <= er < 0.85, f"Expected Multi-Scattered [0.65, 0.84], got {er}"


def test_entropy_ratio_strong_leader_with_two_trailing_is_dual_or_clear():
    # 80 vs 30 vs 30 -> N_eff ~ 2.66 -> Er ~ 0.56 (Dual Interest)
    s = {"C1": 80.0, "C2": 30.0, "C3": 30.0}
    er = compute_shannon_entropy_ratio(s, 0)
    assert er < 0.65, f"Expected er < 0.65 (not Multi-Scattered), got {er}"


def test_entropy_ratio_four_equal_clusters_is_multi():
    # 4 equal strong clusters (N_eff = 4.00) -> Multi-Scattered (Exploration across 4 paths)
    s = {"C1": 60.0, "C2": 60.0, "C3": 60.0, "C4": 60.0}
    er = compute_shannon_entropy_ratio(s, 0)
    assert 0.65 <= er < 0.85, f"Expected Multi-Scattered [0.65, 0.84], got {er}"


def test_entropy_ratio_five_equal_clusters_is_multi():
    # 5 equal strong clusters (N_eff = 5.00) -> Multi-Scattered
    s = {"C1": 60.0, "C2": 60.0, "C3": 60.0, "C4": 60.0, "C5": 60.0}
    er = compute_shannon_entropy_ratio(s, 0)
    assert 0.65 <= er < 0.85, f"Expected Multi-Scattered [0.65, 0.84], got {er}"


def test_entropy_ratio_six_and_seven_equal_clusters_is_total():
    # 6 equal clusters (N_eff = 6.00) -> Total Uncertainty
    s6 = {f"C{i}": 50.0 for i in range(1, 7)}
    er6 = compute_shannon_entropy_ratio(s6, 0)
    assert er6 >= 0.85, f"Expected Total Uncertainty (>= 0.85), got {er6}"

    # 7 equal clusters (N_eff = 7.00) -> Total Uncertainty
    s7 = {f"C{i}": 50.0 for i in range(1, 8)}
    er7 = compute_shannon_entropy_ratio(s7, 0)
    assert er7 >= 0.85, f"Expected Total Uncertainty (>= 0.85), got {er7}"


def test_laser_focus_single_cluster_dominant():
    """Verify single dominant cluster falls into Laser Focus (< 0.15)."""
    s = {"C2": 95.0, "C1": 5.0}
    er = compute_shannon_entropy_ratio(s, 0)
    assert er < 0.15, f"Expected Laser Focus (< 0.15), got {er}"


def test_pure_c5_is_dual_care_companion():
    """Pure C5 (Health) user -> falls into Dual Interest (C5 + C4).

    Architectural Rationale (v1.1.2 Decision):
    Health options in the Lao questionnaire matrix naturally carry strong co-signals
    with Social/Care (C4) (e.g. Q1-O6 gives C5:3, C4:2).
    In v1.1.2, this Health & Social synergy is embraced as a natural dual companion.
    Matrix rebalancing will be considered in v1.2.0.
    """
    answers_c5 = {
        "Q1": ["Q1-O6"], "Q2": "Q2-O8", "Q3": "Q3-O6", "Q4": ["Q4-O5"],
        "Q5": "Q5-O5", "Q8": ["Q8-O3"], "Q9": "Q9-O3", "Q14": ["Q14-O9"],
        "Q16": "Q16-O1", "Q19": "Q19-O5", "Q20": ["Q20-O3"],
        "Q22": ["Q22-O5"], "Q23": "Q23-O1"
    }
    res = evaluate_signals(answers_c5, {"province_code": "D3-O01"})
    # C5 is top path
    assert "C5" in [p.cluster_id for p in res.core_paths + res.secondary_paths]
    assert 0.40 <= res.entropy_ratio < 0.65, f"Expected Dual Interest [0.40, 0.64], got {res.entropy_ratio}"


def test_no_regression_pure_c1_to_c7_archetype_assignment():
    # Pure C7 -> Laser Focus
    er_c7 = compute_shannon_entropy_ratio({"C7": 85.0, "C1": 1.5})
    assert er_c7 < 0.15

    # Pure C6 -> Laser Focus
    er_c6 = compute_shannon_entropy_ratio({"C6": 85.0, "C4": 6.0})
    assert er_c6 < 0.15

    # Pure C2 -> Laser Focus / Clear Direction
    er_c2 = compute_shannon_entropy_ratio({"C2": 80.0, "C1": 13.0})
    assert er_c2 < 0.39


def test_engine_status_and_version():
    # Normal profile -> OK
    res_normal = evaluate_signals({
        "Q1": ["Q1-O2"],  # Interests
        "Q2": ["Q2-O1"],  # Interests
        "Q5": ["Q5-O2"],  # Skills
        "Q6": ["Q6-O2"],  # Skills
        "Q14": ["Q14-O3"], # Learning
    })
    assert res_normal.algorithm_version == "1.1.2"
    assert res_normal.status == "OK"
    assert res_normal.status_reason is None

    # All unknowns profile -> SUGGEST_EXPLORATION with too_many_unknowns
    all_unk = {f"Q{i}": ["Q1-O11" if i == 1 else "Q2-O10"] for i in range(1, 20)}
    res_unk = evaluate_signals(all_unk)
    assert res_unk.status == "SUGGEST_EXPLORATION"
    assert res_unk.status_reason in ["too_many_unknowns", "low_signal"]


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
    assert res.algorithm_version == "1.1.2"
    assert res.status == "OK"
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


