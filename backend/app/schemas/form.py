from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class FormOption(BaseModel):
    model_config = ConfigDict(extra="ignore")

    code: str
    text: str
    exclusive: Optional[bool] = None
    has_other: Optional[bool] = None


class FormItemExtraText(BaseModel):
    model_config = ConfigDict(extra="ignore")

    required: bool
    placeholder: str


class FormItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    type: str  # "single" | "multi" | "text"
    stem: str
    note: Optional[str] = None
    section_lao: Optional[str] = None
    section: Optional[str] = None
    options: Optional[List[FormOption]] = None
    min_select: Optional[int] = None
    max_select: Optional[int] = None
    extra_text: Optional[FormItemExtraText] = None


class QuestionnaireForm(BaseModel):
    model_config = ConfigDict(extra="ignore")

    meta: Dict[str, Any]
    demographics: List[FormItem]
    questions: List[FormItem]
