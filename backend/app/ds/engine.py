from typing import List, Optional

from app.ds.experiments import get_default_experiments
from app.ds.matching import identify_possible_paths_with_evaluation
from app.ds.models import (
    DSAssessmentPayload,
    DSEngineResult,
    DSEngineVersions,
    DSTension,
)
from app.ds.rules import (
    detect_tensions,
    extract_context_factors,
    extract_response_patterns,
    extract_unknowns,
)

# Supported questionnaire form versions
SUPPORTED_FORM_VERSIONS = {"v0.9.1", "v0.9.0"}
CURRENT_DS_ENGINE_VERSION = "v1.0.0"


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

        # 4. Identify possible exploration paths & run Signal Engine v1.0
        possible_paths, eval_res = identify_possible_paths_with_evaluation(payload)

        # 5. Detect structured tensions from rules + signal engine
        rule_tensions = detect_tensions(payload)
        existing_tension_titles = {t.title_lao for t in rule_tensions}

        # Traceability: map each tension ID to the question codes that trigger it
        TENSION_SOURCE_QIDS: dict = {
            "T1": ["Q1", "Q2", "Q3", "Q14", "Q15", "Q20"],   # Tech interest + Math/Science hard
            "T2": ["Q1", "Q2", "Q14", "Q15", "Q20"],          # Health interest + Health hard
            "T3": ["Q1", "Q15"],                               # Analysis interest + Math hard
            "T4": ["Q19", "Q22"],                              # Business goal + Time constraint
            "T5": ["Q22", "Q23"],                              # C5/C2 + Cannot relocate
            "T6": ["Q8", "Q13", "Q22", "Q23"],                # Freedom pref + Location constraint
            "T7": ["Q8", "Q19"],                               # Family value + Business goal
        }

        all_tensions: List[DSTension] = list(rule_tensions)
        for t_info in eval_res.detected_tensions:
            msg = t_info.get("message", "")
            if msg and msg not in existing_tension_titles:
                existing_tension_titles.add(msg)
                tid = t_info.get("id", f"T-{len(all_tensions)+1}")
                all_tensions.append(
                    DSTension(
                        tension_id=tid,
                        title_lao=msg,
                        description_lao=f"ຈຸດສະທ້ອນຄວາມຄິດ: {msg}",
                        source_question_ids=TENSION_SOURCE_QIDS.get(tid, ["Q1", "Q15"]),
                        is_resolved=False,
                    )
                )

        # 6. Retrieve structured 'Try Before Decide' experiments
        experiments = get_default_experiments(possible_paths)

        # 7. Generate deterministic summary text
        summary_text = self._build_deterministic_summary(
            response_patterns=response_patterns,
            possible_paths=possible_paths,
            context_factors=context_factors,
            unknowns_count=len(unknowns),
            tensions_count=len(all_tensions),
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
            tensions=all_tensions,
            experiments=experiments,
            confidence_score=eval_res.confidence_score,
            disclaimer="ລາຍງານນີ້ຊ່ວຍໃນການຄິດ ແລະ ສຳຫຼວດຕົນເອງ ບໍ່ແມ່ນຄຳຕັດສິນສຸດທ້າຍ",
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
