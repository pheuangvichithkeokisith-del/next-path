from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ResponseCounterModel(Base):
    __tablename__ = "response_counters"

    year: Mapped[int] = mapped_column(Integer, primary_key=True)
    province_code: Mapped[str] = mapped_column(String(16), primary_key=True)
    last_sequence: Mapped[int] = mapped_column(Integer, nullable=False)
