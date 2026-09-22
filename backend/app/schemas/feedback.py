from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

FeedbackAgreement = Literal["yes", "not_really", "unsure"]


class FeedbackCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    agreement: FeedbackAgreement
    incorrect_note: Optional[str] = None
    next_interest: Optional[str] = None


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    saved: bool = True
