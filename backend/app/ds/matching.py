from typing import Dict, List, Set

from app.ds.dimensions import CANONICAL_CLUSTERS
from app.ds.models import DSAssessmentPayload, DSPath


def identify_possible_paths(payload: DSAssessmentPayload) -> List[DSPath]:
    """Identify possible exploration directions strictly based on user's self-reported domain choices.
    
    Adheres strictly to the PATHAI principle:
    - Exploration directions only
    - No ranking
    - No 'best career' or 'top match'
    - No probability or predictive scores
    - Every path retains exact source question IDs
    """
    paths: List[DSPath] = []
    responses = payload.responses

    # Map question IDs to their selected option codes
    answers_by_qid: Dict[str, Set[str]] = {
        qid: set(resp.option_codes)
        for qid, resp in responses.items()
        if resp.is_answered
    }

    # Evaluate each canonical cluster in stable, deterministic order
    for cluster_id, cluster in sorted(CANONICAL_CLUSTERS.items(), key=lambda x: x[0]):
        matched_sources: List[str] = []

        for qid, selected_codes in answers_by_qid.items():
            # Check if any selected option in this question corresponds to cluster
            cluster_codes = (
                cluster.interest_option_codes
                | cluster.skill_option_codes
                | cluster.learning_option_codes
            )
            if any(code in cluster_codes for code in selected_codes):
                matched_sources.append(qid)

        if matched_sources:
            paths.append(
                DSPath(
                    group_id=cluster.group_id,
                    label_lao=cluster.label_lao,
                    description_lao=cluster.description_lao,
                    source_question_ids=matched_sources,
                    is_sample=False,
                )
            )

    return paths
