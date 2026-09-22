from typing import List, Optional

from app.ds.experiments import get_default_experiments
from app.ds.matching import identify_possible_paths
from app.ds.models import (
    DSAssessmentPayload,
    DSEngineResult,
    DSEngineVersions,
)
from app.ds.rules import (
    detect_tensions,
    extract_context_factors,
    extract_response_patterns,
    extract_unknowns,
)

# Supported questionnaire form versions
SUPPORTED_FORM_VERSIONS = {"v0.9.1", "v0.9.0"}
CURRENT_DS_ENGINE_VERSION = "v0.1.0"


class DSEngine:
    """Pure, deterministic DS Engine for PATHAI self-reflection and pattern discovery.
    
    Principles:
    - Pure function: Identical inputs produce identical outputs.
    - No AI, LLM, or probabilistic models.
    - No career predictions, rankings, or automated decisions.
    - Complete traceability: Every pattern, path, and tension retains source question IDs.
    - Explicit unknown / uncertainty handling for incomplete evidence.
    """

    def __init__(self, ds_engine_version: str = CURRENT_DS_ENGINE_VERSION):
        self.ds_engine_version = ds_engine_version

    def evaluate(self, payload: DSAssessmentPayload) -> DSEngineResult:
        """Evaluate standard DSAssessmentPayload into explainable reflection structures."""
        form_version = payload.form_version
        
        # 1. Extract context factors
        context_factors = extract_context_factors(payload)

        # 2. Extract unknowns and incomplete states
        unknowns = extract_unknowns(payload)

        # If form version is unsupported, record unknown warning
        if form_version not in SUPPORTED_FORM_VERSIONS:
            unknowns.insert(
                0,
                f"FORM_VERSION_MISMATCH (ແບບສອບຖາມເວີຊັນ '{form_version}' ອາດມີໂຄງສ້າງບໍ່ຕົງກັບລະບົບ)",
            )

        # 3. Extract descriptive response patterns
        response_patterns = extract_response_patterns(payload)

        # 4. Identify possible exploration paths
        possible_paths = identify_possible_paths(payload)

        # 5. Detect structured tensions
        tensions = detect_tensions(payload)

        # 6. Retrieve structured 'Try Before Decide' experiments
        experiments = get_default_experiments(possible_paths)

        # 7. Generate deterministic summary text
        summary_text = self._build_deterministic_summary(
            response_patterns=response_patterns,
            possible_paths=possible_paths,
            context_factors=context_factors,
            unknowns_count=len(unknowns),
            tensions_count=len(tensions),
        )

        template_id = "reflection-deterministic-v1"
        if possible_paths:
            primary_code = possible_paths[0].group_id.lower()
            template_id = f"reflection-{primary_code}-v1"

        versions = DSEngineVersions(
            ds=self.ds_engine_version,
            enc="enc-0",
            form=form_version,
        )

        return DSEngineResult(
            response_patterns=response_patterns,
            possible_paths=possible_paths,
            context_factors=context_factors,
            unknowns=unknowns,
            tensions=tensions,
            experiments=experiments,
            summary_text=summary_text,
            template_id=template_id,
            versions=versions,
            is_complete=payload.is_ready_for_evaluation and len(payload.missing_questions) == 0,
            unanswered_question_ids=payload.missing_questions,
        )

    def _build_deterministic_summary(
        self,
        response_patterns,
        possible_paths,
        context_factors,
        unknowns_count: int,
        tensions_count: int,
    ) -> str:
        """Compose a concise, objective Lao summary strictly describing observed answer patterns."""
        if not response_patterns and not possible_paths:
            return (
                "ຄຳຕອບຂອງທ່ານສະແດງເຖິງຄວາມສົນໃຈທີ່ຍັງເປີດກວ້າງ ຫຼື ຢູ່ໃນໄລຍະເລີ່ມຕົ້ນສຳຫຼວດ. "
                "ທ່ານສາມາດໃຊ້ການທົດລອງຕົວຈິງເພື່ອຊອກຫາທິດທາງທີ່ຊັດເຈນຂຶ້ນ."
            )

        # Gather pattern labels
        int_patterns = [p for p in response_patterns if p.section == "interests"]
        ws_patterns = [p for p in response_patterns if p.section == "work_style"]
        val_patterns = [p for p in response_patterns if p.section == "values"]

        parts: List[str] = []
        if int_patterns:
            parts.append(f"ຄຳຕອບຂອງທ່ານສະທ້ອນ{int_patterns[0].label_lao.lower()}")
        else:
            parts.append("ຄຳຕອບຂອງທ່ານສະທ້ອນຄວາມສົນໃຈທີ່ຫຼາກຫຼາຍ")

        if ws_patterns:
            parts.append(f"ພ້ອມທັງ{ws_patterns[0].label_lao.lower()}")

        if val_patterns:
            parts.append(f"ແລະ {val_patterns[0].label_lao.lower()}")

        summary = ". ".join(parts) + "."

        if tensions_count > 0:
            summary += " ພົບຈຸດທີ່ໜ້າສົນໃຈສຳລັບການທົບທວນຕົນເອງເພີ່ມເຕີມ."

        return summary


def evaluate_ds_assessment(payload: DSAssessmentPayload) -> DSEngineResult:
    """Convenience helper to evaluate payload with standard DSEngine instance."""
    engine = DSEngine()
    return engine.evaluate(payload)
