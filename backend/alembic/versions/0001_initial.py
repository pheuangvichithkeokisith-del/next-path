"""Initial schema creation for sessions, answers, reports, feedbacks

Revision ID: 0001_initial
Revises: 
Create Date: 2026-09-22 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Sessions table
    op.create_table(
        "sessions",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("form_version", sa.String(length=50), nullable=False, server_default="v0.9.1"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="created"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_sessions_status", "sessions", ["status"])

    # 2. Answers table
    op.create_table(
        "answers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("session_id", sa.String(length=36), sa.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.String(length=50), nullable=False),
        sa.Column("option_codes", sa.JSON(), nullable=False),
        sa.Column("other_text", sa.Text(), nullable=True),
        sa.Column("extra_text", sa.Text(), nullable=True),
        sa.Column("text_value", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("session_id", "question_id", name="uq_session_question"),
    )
    op.create_index("ix_answers_session_id", "answers", ["session_id"])
    op.create_index("ix_answers_question_id", "answers", ["question_id"])

    # 3. Reports table
    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("session_id", sa.String(length=36), sa.ForeignKey("sessions.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("response_pattern", sa.JSON(), nullable=False),
        sa.Column("possible_paths", sa.JSON(), nullable=False),
        sa.Column("context_factors", sa.JSON(), nullable=False),
        sa.Column("unknowns", sa.JSON(), nullable=False),
        sa.Column("versions", sa.JSON(), nullable=False),
        sa.Column("summary_text", sa.Text(), nullable=False),
        sa.Column("template_id", sa.String(length=100), nullable=False),
        sa.Column("ai_version", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_reports_session_id", "reports", ["session_id"])

    # 4. Feedbacks table
    op.create_table(
        "feedbacks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("session_id", sa.String(length=36), sa.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agreement", sa.String(length=50), nullable=False),
        sa.Column("incorrect_note", sa.Text(), nullable=True),
        sa.Column("next_interest", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_feedbacks_session_id", "feedbacks", ["session_id"])


def downgrade() -> None:
    op.drop_table("feedbacks")
    op.drop_table("reports")
    op.drop_table("answers")
    op.drop_table("sessions")
