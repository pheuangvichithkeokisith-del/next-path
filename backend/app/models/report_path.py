from typing import List, Optional

from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ReportPathModel(Base):
    __tablename__ = "report_paths"
    __table_args__ = (
        UniqueConstraint("report_id", "rank", name="uq_report_paths_report_rank"),
        CheckConstraint("rank >= 1 AND rank <= 3", name="ck_report_paths_rank_1_3"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    path_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    label_lao: Mapped[str] = mapped_column(String(500), nullable=False)
    classification: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    fit_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feasibility_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    compatibility_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evidence_question_ids: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    reasons_lao: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    conditions_lao: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    scoring_version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
