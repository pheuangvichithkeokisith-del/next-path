from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class ReportPattern(BaseModel):
    model_config = ConfigDict(extra="ignore")

    section: str
    pattern_id: str
    label_lao: str
    is_sample: bool = False


class ReportPath(BaseModel):
    model_config = ConfigDict(extra="ignore")

    group_id: str
    label_lao: str
    is_sample: bool = False
    classification: str = "explore"
    fit_score: Optional[float] = None
    feasibility_score: Optional[float] = None
    compatibility_score: Optional[float] = None
    evidence_question_ids: List[str] = Field(default_factory=list)
    reasons_lao: List[str] = Field(default_factory=list)
    conditions_lao: List[str] = Field(default_factory=list)


class ReportAnswer(BaseModel):
    """Sanitized answer data returned with a user's own report."""

    model_config = ConfigDict(extra="ignore")

    question_id: str
    option_codes: List[str] = Field(default_factory=list)
    other_text: Optional[str] = None
    extra_text: Optional[str] = None
    text_value: Optional[str] = None


class ReportScoreDetails(BaseModel):
    """Deterministic v4 score evidence; absent for legacy reports/incomplete runs."""

    model_config = ConfigDict(extra="ignore")

    scores: dict[str, float] = Field(default_factory=dict)
    positive_scores: dict[str, float] = Field(default_factory=dict)
    negative_penalty: dict[str, float] = Field(default_factory=dict)
    section_scores: dict[str, dict[str, float]] = Field(default_factory=dict)
    section_coverage: dict[str, float] = Field(default_factory=dict)
    correlations: dict[str, float] = Field(default_factory=dict)
    r_max: Optional[float] = None


class ContextFactors(BaseModel):
    model_config = ConfigDict(extra="ignore")

    age_band: Optional[str] = None
    age_years: Optional[int] = None
    province_code: Optional[str] = None
    has_constraints: bool = False


class V4ContextFactors(ContextFactors):
    constraints: List[str] = Field(default_factory=list)
    mobility: List[str] = Field(default_factory=list)
    family_context: List[str] = Field(default_factory=list)
    risk_willingness: Optional[float] = None
    safety_readiness: Optional[int] = None


class ReportVersions(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ds: str = "stub-0"
    enc: str = "enc-0"
    form: str = "v0.9.1"


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    response_pattern: List[ReportPattern]
    possible_paths: List[ReportPath]
    answers: List[ReportAnswer] = Field(default_factory=list)
    context_factors: Union[V4ContextFactors, ContextFactors]
    score_details: Optional[ReportScoreDetails] = None
    unknowns: List[str]
    versions: ReportVersions
    summary_text: str
    template_id: str
    ai_version: str
