from pydantic import BaseModel, ConfigDict


class SessionCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    pass


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    session_id: str
    form_version: str


class SessionStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    status: str
    form_version: str


class SessionCompleteResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str
