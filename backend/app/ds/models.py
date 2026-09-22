from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.validation.ds_contract import (
    DSAssessmentPayload,
    DSDemographicFeature,
    DSQuestionResponse,
)


class DSPattern(BaseModel):
    """Traceable observation of user responses in a specific domain or theme."""
    model_config = ConfigDict(extra="ignore")

    pattern_id: str
    section: str
    label_lao: str
    description_lao: Optional[str] = None
    source_question_ids: List[str] = Field(default_factory=list)
    is_sample: bool = False
    evidence_level: str = "direct"  # "direct", "inferred", "insufficient"


class DSPath(BaseModel):
    """Exploration direction without ranking, probability, prediction, or automated decision."""
    model_config = ConfigDict(extra="ignore")

    group_id: str
    label_lao: str
    description_lao: Optional[str] = None
    source_question_ids: List[str] = Field(default_factory=list)
    is_sample: bool = False


class DSContextFactors(BaseModel):
    """Contextual features distinguishing self-reported demographics from system constraints."""
    model_config = ConfigDict(extra="ignore")

    age_band: Optional[str] = None
    age_band_code: Optional[str] = None
    education_level: Optional[str] = None
    province_code: Optional[str] = None
    province_name: Optional[str] = None
    has_constraints: bool = False
    constraints_detail: List[str] = Field(default_factory=list)
    relocation_preference: Optional[str] = None
    source_question_ids: List[str] = Field(default_factory=list)


class DSTension(BaseModel):
    """Meaningful conflict/divergence between answers preserved for user reflection."""
    model_config = ConfigDict(extra="ignore")

    tension_id: str
    title_lao: str
    description_lao: str
    source_question_ids: List[str] = Field(default_factory=list)
    is_resolved: bool = False


class DSExperiment(BaseModel):
    """Low-stakes try-before-decide action structured for experiential discovery."""
    model_config = ConfigDict(extra="ignore")

    experiment_id: str
    type: str  # "interview", "micro_project", "observation"
    title_lao: str
    description_lao: str
    path_group_ids: List[str] = Field(default_factory=list)
    source_question_ids: List[str] = Field(default_factory=list)


class DSEngineVersions(BaseModel):
    """Deterministic version tracking for DS calculation and form metadata."""
    model_config = ConfigDict(extra="ignore")

    ds: str = "v0.1.0"
    enc: str = "enc-0"
    form: str = "v0.9.1"


class DSEngineResult(BaseModel):
    """Structured, pure output of the PATHAI DS Engine."""
    model_config = ConfigDict(extra="ignore")

    response_patterns: List[DSPattern] = Field(default_factory=list)
    possible_paths: List[DSPath] = Field(default_factory=list)
    context_factors: DSContextFactors
    unknowns: List[str] = Field(default_factory=list)
    tensions: List[DSTension] = Field(default_factory=list)
    experiments: List[DSExperiment] = Field(default_factory=list)
    summary_text: str
    template_id: str
    versions: DSEngineVersions
    is_complete: bool
    unanswered_question_ids: List[str] = Field(default_factory=list)
