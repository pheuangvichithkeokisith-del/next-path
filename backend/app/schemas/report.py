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


class ContextFactors(BaseModel):
    model_config = ConfigDict(extra="ignore")

    age_band: Optional[str] = None
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
    context_factors: Union[V4ContextFactors, ContextFactors]
    unknowns: List[str]
    versions: ReportVersions
    summary_text: str
    template_id: str
    ai_version: str
