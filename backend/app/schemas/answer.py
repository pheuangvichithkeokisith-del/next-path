from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AnswerCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    question_id: str
    option_codes: List[str] = []
    other_text: Optional[str] = None
    extra_text: Optional[str] = None
    text_value: Optional[str] = None


class AnswerResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str = "ok"
    question_id: str
    session_id: str
