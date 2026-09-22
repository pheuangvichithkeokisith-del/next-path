from typing import List, Optional
from pydantic import BaseModel, ConfigDict


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


class ReportVersions(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ds: str = "stub-0"
    enc: str = "enc-0"
    form: str = "v0.9.1"


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    response_pattern: List[ReportPattern]
    possible_paths: List[ReportPath]
    context_factors: ContextFactors
    unknowns: List[str]
    versions: ReportVersions
    summary_text: str
    template_id: str
    ai_version: str
