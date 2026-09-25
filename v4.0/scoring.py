"""PATHAI Career Assessment Instrument v4.0 scoring contract.

This module remains deliberately separate from the legacy v0.9.1 questionnaire
and DS engine. The production backend calls it through the v4 report adapter.
"""

from __future__ import annotations

import itertools
import json
import math
from pathlib import Path
from typing import Any, Mapping, Sequence


ROOT = Path(__file__).resolve().parent
CLUSTERS = ("C1", "C2", "C3", "C4", "C5", "C6", "C7")
SCORING_SECTIONS = ("interests", "skills", "values", "work_style", "academic", "goals")
CONTEXT_SECTIONS = ("constraints", "flexibility")
SECTION_WEIGHTS = {section: 1.0 / len(SCORING_SECTIONS) for section in SCORING_SECTIONS}
MIN_TOTAL = 20
EPSILON = 1e-9


def load_questions(path: Path | None = None) -> dict[str, Any]:
    """Load only the v4.0 question file."""
    source = path or ROOT / "questions_full.json"
    return json.loads(source.read_text(encoding="utf-8"))


def _question_map(spec: Mapping[str, Any]) -> dict[str, Mapping[str, Any]]:
    return {question["id"]: question for question in spec["questions"]}


def _selected_codes(answer: Any) -> list[str]:
    if answer is None:
        return []
    if isinstance(answer, Mapping):
        codes = answer.get("option_codes", answer.get("options", []))
    else:
        codes = answer
    if isinstance(codes, str):
        return [codes]
    return list(codes or [])


def _is_answered(answer: Any) -> bool:
    return bool(_selected_codes(answer))


def _options_by_code(question: Mapping[str, Any]) -> dict[str, Mapping[str, Any]]:
    return {option["code"]: option for option in question.get("options", [])}


def validate_answers(answers: Mapping[str, Any], spec: Mapping[str, Any]) -> dict[str, Any]:
    """Validate IDs, selection cardinality, exclusives, and section minimums."""
    questions = _question_map(spec)
    errors: list[str] = []
    warnings: list[str] = []
    answered = {qid for qid in questions if _is_answered(answers.get(qid))}

    if len(answered) < MIN_TOTAL:
        errors.append(f"answered {len(answered)} of {len(questions)}; minimum is {MIN_TOTAL}")

    required_questions = spec.get("meta", {}).get("validation", {}).get("required_questions", [])
    for qid in required_questions:
        if qid in questions and qid not in answered:
            errors.append(f"{qid}: an answer is required")

    for qid, answer in answers.items():
        if qid not in questions:
            continue
        question = questions[qid]
        codes = _selected_codes(answer)
        options = _options_by_code(question)
        unknown = [code for code in codes if code not in options]
        if unknown:
            errors.append(f"{qid}: unknown option code(s): {unknown}")
            continue
        if len(codes) > int(question.get("max_select", 1)):
            errors.append(f"{qid}: too many options selected")
        min_select = int(question.get("min_select", 0))
        if codes and len(codes) < min_select:
            errors.append(f"{qid}: at least {min_select} options are required")
        exclusive = {code for code in codes if options[code].get("exclusive")}
        if exclusive and (len(codes) > 1 or len(exclusive) > 1):
            errors.append(f"{qid}: exclusive option cannot be combined")

    for section, section_spec in spec["meta"]["sections"].items():
        count = sum(qid in answered for qid in section_spec["questions"])
        minimum = int(section_spec["min_required"])
        if count < minimum:
            errors.append(f"{section}: answered {count}; minimum is {minimum}")
            warnings.append(f"{section}: answered {count}; minimum is {minimum}")

    return {"is_valid": not errors, "errors": errors, "warnings": warnings, "answered": len(answered)}


def _valid_combinations(question: Mapping[str, Any]) -> list[tuple[Mapping[str, Any], ...]]:
    options = tuple(question.get("options", []))
    max_select = int(question.get("max_select", 1))
    min_select = int(question.get("min_select", 0))
    combinations: list[tuple[Mapping[str, Any], ...]] = []
    for size in range(max(1, min_select), max_select + 1):
        for combo in itertools.combinations(options, size):
            if any(option.get("exclusive") for option in combo) and len(combo) > 1:
                continue
            combinations.append(combo)
    return combinations or [tuple()]


def max_possible_score(question: Mapping[str, Any], cluster: str) -> float:
    """Maximum score accounting for max_select and exclusive options."""
    values = [sum(float(option.get("weights", {}).get(cluster, 0)) for option in combo)
              for combo in _valid_combinations(question)]
    return max(values, default=0.0)


def question_score(question: Mapping[str, Any], answer: Any, cluster: str) -> float:
    """Return a question-level positive score in [0, 1]."""
    options = _options_by_code(question)
    codes = _selected_codes(answer)
    raw = sum(float(options[code].get("weights", {}).get(cluster, 0)) for code in codes if code in options)
    maximum = max_possible_score(question, cluster)
    if maximum <= EPSILON:
        return 0.0
    return max(0.0, min(1.0, raw / maximum))


def calculate_positive_scores(answers: Mapping[str, Any], spec: Mapping[str, Any]) -> tuple[dict[str, float], dict[str, dict[str, float]]]:
    """Calculate six equally weighted scoring sections, excluding Q17/context."""
    questions = _question_map(spec)
    section_scores = {section: {cluster: 0.0 for cluster in CLUSTERS} for section in SCORING_SECTIONS}
    section_counts = {section: 0 for section in SCORING_SECTIONS}

    for question in spec["questions"]:
        section = question["section"]
        qid = question["id"]
        if section not in SCORING_SECTIONS or question.get("is_negative_signal"):
            continue
        if not _is_answered(answers.get(qid)):
            continue
        section_counts[section] += 1
        for cluster in CLUSTERS:
            section_scores[section][cluster] += question_score(question, answers[qid], cluster)

    for section in SCORING_SECTIONS:
        if section_counts[section]:
            for cluster in CLUSTERS:
                section_scores[section][cluster] /= section_counts[section]

    final = {cluster: 0.0 for cluster in CLUSTERS}
    for section in SCORING_SECTIONS:
        for cluster in CLUSTERS:
            final[cluster] += SECTION_WEIGHTS[section] * section_scores[section][cluster]
    return final, section_scores


def calculate_negative_penalty(answers: Mapping[str, Any], spec: Mapping[str, Any]) -> dict[str, float]:
    """Convert Q17's negative signals to comparable [0, 1] penalties."""
    question = _question_map(spec)["Q17"]
    options = _options_by_code(question)
    raw = {cluster: 0.0 for cluster in CLUSTERS}
    for code in _selected_codes(answers.get("Q17")):
        for cluster in CLUSTERS:
            raw[cluster] += min(0.0, float(options[code]["weights"].get(cluster, 0)))
    maximum = float(question.get("max_possible_negative", 4))
    return {cluster: min(1.0, abs(value) / maximum) if maximum else 0.0 for cluster, value in raw.items()}


def apply_negative_penalty(positive: Mapping[str, float], penalty: Mapping[str, float]) -> dict[str, float]:
    return {
        cluster: max(0.0, min(1.0, float(positive[cluster]) - float(penalty[cluster])))
        for cluster in CLUSTERS
    }


def _pearson(left: Sequence[float], right: Sequence[float]) -> float | None:
    if len(left) != len(right) or len(left) < 2:
        return None
    left_mean = sum(left) / len(left)
    right_mean = sum(right) / len(right)
    numerator = sum((a - left_mean) * (b - right_mean) for a, b in zip(left, right))
    left_var = sum((a - left_mean) ** 2 for a in left)
    right_var = sum((b - right_mean) ** 2 for b in right)
    denominator = math.sqrt(left_var * right_var)
    if denominator <= EPSILON:
        return None
    return numerator / denominator


def calculate_profile_correlation(scores: Mapping[str, float], templates: Mapping[str, Sequence[float]]) -> dict[str, Any]:
    """Compare one C1..C7 profile against all templates deterministically."""
    vector = [float(scores[cluster]) for cluster in CLUSTERS]
    if sum((value - sum(vector) / len(vector)) ** 2 for value in vector) <= EPSILON:
        return {"archetype": "Multi-Scattered", "r_max": 0.0, "top_cluster": None, "correlations": {cluster: 0.0 for cluster in CLUSTERS}, "reason": "profile variance is zero"}

    correlations = {}
    for cluster in CLUSTERS:
        template = templates[cluster]
        result = _pearson(vector, [float(value) for value in template])
        correlations[cluster] = 0.0 if result is None else result
    max_r = max(correlations.values())
    tied = [cluster for cluster in CLUSTERS if abs(correlations[cluster] - max_r) <= EPSILON]
    top_cluster = sorted(tied, key=lambda cluster: (-float(scores[cluster]), cluster))[0]
    if max_r >= 0.80:
        archetype = "Laser Focus"
    elif max_r >= 0.60:
        archetype = "Clear Direction"
    elif max_r >= 0.40:
        archetype = "Dual Interest"
    else:
        archetype = "Multi-Scattered"
    return {"archetype": archetype, "r_max": round(max_r, 3), "top_cluster": top_cluster, "correlations": correlations}


def calculate_context(answers: Mapping[str, Any], spec: Mapping[str, Any]) -> dict[str, Any]:
    questions = _question_map(spec)
    q26 = _selected_codes(answers.get("Q26"))
    q27 = _selected_codes(answers.get("Q27"))
    q28 = _selected_codes(answers.get("Q28"))
    risk_map = {**questions["Q26"].get("risk_willingness_score", {}), **questions["Q27"].get("risk_willingness_score", {})}
    safety_map = questions["Q28"].get("safety_readiness_score", {})
    risk_values = [risk_map[code] for code in q26 + q27 if code in risk_map]
    return {
        "risk_willingness": sum(risk_values) / len(risk_values) if risk_values else None,
        "safety_readiness": sum(safety_map.get(code, 0) for code in q28),
        "constraints": [code for code in _selected_codes(answers.get("Q23"))],
        "mobility": _selected_codes(answers.get("Q24")),
        "family_context": _selected_codes(answers.get("Q25")),
    }


def score_assessment(answers: Mapping[str, Any], spec: Mapping[str, Any] | None = None) -> dict[str, Any]:
    spec = spec or load_questions()
    validation = validate_answers(answers, spec)
    if not validation["is_valid"]:
        return {"status": "invalid", "validation": validation}
    templates = json.loads((ROOT / "templates.json").read_text(encoding="utf-8"))["templates"]
    positive, sections = calculate_positive_scores(answers, spec)
    penalties = calculate_negative_penalty(answers, spec)
    final = apply_negative_penalty(positive, penalties)
    result = calculate_profile_correlation(final, templates)
    result.update({"status": "valid", "scores": final, "positive_scores": positive, "negative_penalty": penalties, "section_scores": sections, "context": calculate_context(answers, spec), "validation": validation, "version": "4.0.0"})
    return result


if __name__ == "__main__":
    print(json.dumps({"version": "4.0.0", "questions": len(load_questions()["questions"])}, ensure_ascii=False, indent=2))
