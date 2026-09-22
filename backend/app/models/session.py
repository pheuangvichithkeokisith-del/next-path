import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SessionModel(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    form_version: Mapped[str] = mapped_column(
        String(50),
        default="v0.9.1",
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="created",
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    answers: Mapped[List["AnswerModel"]] = relationship(  # noqa: F821
        "AnswerModel",
        back_populates="session",
        cascade="all, delete-orphan",
    )
    report: Mapped[Optional["ReportModel"]] = relationship(  # noqa: F821
        "ReportModel",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan",
    )
    feedbacks: Mapped[List["FeedbackModel"]] = relationship(  # noqa: F821
        "FeedbackModel",
        back_populates="session",
        cascade="all, delete-orphan",
    )
