from typing import Dict, List, Set, Tuple

from app.ds.dimensions import CANONICAL_CLUSTERS
from app.ds.models import DSAssessmentPayload, DSPath
from app.ds.signal_engine import (
    CLUSTERS,
    STUDY_PATH_MAPPING,
    EngineEvaluationResult,
    evaluate_signals,
)


def identify_possible_paths_with_evaluation(
    payload: DSAssessmentPayload,
) -> Tuple[List[DSPath], EngineEvaluationResult]:
    """Evaluate exploration paths using PathAI Signal Aggregation Engine (v1.0)."""
    responses = payload.responses

    answers_by_qid: Dict[str, List[str]] = {
        qid: list(resp.option_codes)
        for qid, resp in responses.items()
        if resp.is_answered
    }

    demographics_dict: Dict[str, str] = {
        "age_band": payload.demographics.age_band or "",
        "education_level": payload.demographics.education_level or "",
        "province_code": payload.demographics.province_code or "",
    }

    eval_res = evaluate_signals(answers_by_qid, demographics_dict)

    paths: List[DSPath] = []
    # Preserve deterministic order across clusters C1-C7 or ranked by adjusted_fit
    for cluster_id, cluster_eval in eval_res.cluster_evaluations.items():
        if cluster_eval.adjusted_fit >= 35.0 or len(cluster_eval.matched_qids) > 0:
            canonical = CANONICAL_CLUSTERS.get(cluster_id)
            desc = canonical.description_lao if canonical else ""
            paths.append(
                DSPath(
                    group_id=cluster_id,
                    label_lao=cluster_eval.label_lao,
                    description_lao=desc,
                    source_question_ids=cluster_eval.matched_qids,
                    is_sample=False,
                    classification=cluster_eval.classification,
                    fit_score=cluster_eval.raw_fit,
                    adjusted_fit=cluster_eval.adjusted_fit,
                    feasibility_score=cluster_eval.feasibility_score,
                    negative_factor=cluster_eval.negative_factor,
                    study_paths=cluster_eval.study_paths,
                    tensions=cluster_eval.detected_tensions,
                )
            )

    return paths, eval_res


def identify_possible_paths(payload: DSAssessmentPayload) -> List[DSPath]:
    """Backward-compatible helper returning List[DSPath]."""
    paths, _ = identify_possible_paths_with_evaluation(payload)
    return paths
