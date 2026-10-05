"""Add first-party analytics fields and normalized report paths.

Revision ID: 0002_analytics_ready
Revises: 0001_initial
Create Date: 2026-10-05

"""
from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Sequence, Union
from zoneinfo import ZoneInfo

from alembic import op
import sqlalchemy as sa


revision: str = "0002_analytics_ready"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


PROVINCES = [
    ("VTE", "D3-O01", "ນະຄອນຫຼວງວຽງຈັນ"),
    ("VTP", "D3-O02", "ແຂວງວຽງຈັນ"),
    ("PSL", "D3-O03", "ແຂວງຜົ້ງສາລີ"),
    ("LNT", "D3-O04", "ແຂວງຫຼວງນ້ຳທາ"),
    ("ODX", "D3-O05", "ແຂວງອຸດົມໄຊ"),
    ("BOK", "D3-O06", "ແຂວງບໍ່ແກ້ວ"),
    ("LPB", "D3-O07", "ແຂວງຫຼວງພະບາງ"),
    ("HPH", "D3-O08", "ແຂວງຫົວພັນ"),
    ("XKH", "D3-O09", "ແຂວງຊຽງຂວາງ"),
    ("XAY", "D3-O10", "ແຂວງໄຊຍະບູລີ"),
    ("BOL", "D3-O11", "ແຂວງບໍລິຄຳໄຊ"),
    ("KHM", "D3-O12", "ແຂວງຄຳມ່ວນ"),
    ("SVK", "D3-O13", "ແຂວງສະຫວັນນະເຂດ"),
    ("SLV", "D3-O14", "ແຂວງສາລະວັນ"),
    ("SEK", "D3-O15", "ແຂວງເຊກອງ"),
    ("CPS", "D3-O16", "ແຂວງຈຳປາສັກ"),
    ("ATP", "D3-O17", "ແຂວງອັດຕະປື"),
    ("XSB", "D3-O18", "ແຂວງໄຊສົມບູນ"),
]


def _json_value(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (TypeError, ValueError):
            return None
    return value


def _as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _local_year(value: Any) -> int:
    timestamp = _as_datetime(value) or datetime.now(timezone.utc)
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return timestamp.astimezone(ZoneInfo("Asia/Vientiane")).year


def _age_years(value: Any) -> int | None:
    try:
        age = int(str(value).strip())
    except (TypeError, ValueError):
        return None
    return age if 15 <= age <= 120 else None


def upgrade() -> None:
    op.create_table(
        "province_catalog",
        sa.Column("province_code", sa.String(length=16), primary_key=True),
        sa.Column("form_option_code", sa.String(length=50), nullable=False, unique=True),
        sa.Column("label_lao", sa.String(length=200), nullable=False),
    )
    province_table = sa.table(
        "province_catalog",
        sa.column("province_code", sa.String),
        sa.column("form_option_code", sa.String),
        sa.column("label_lao", sa.String),
    )
    op.bulk_insert(
        province_table,
        [
            {"province_code": code, "form_option_code": option, "label_lao": label}
            for code, option, label in PROVINCES
        ],
    )

    op.create_table(
        "response_counters",
        sa.Column("year", sa.Integer(), primary_key=True),
        sa.Column("province_code", sa.String(length=16), primary_key=True),
        sa.Column("last_sequence", sa.Integer(), nullable=False),
    )

    with op.batch_alter_table("sessions") as batch:
        batch.add_column(sa.Column("response_code", sa.String(length=64), nullable=True))
        batch.add_column(sa.Column("province_code", sa.String(length=16), nullable=True))
        batch.add_column(sa.Column("age_years", sa.Integer(), nullable=True))
        batch.create_foreign_key(
            "fk_sessions_province_code_province_catalog",
            "province_catalog",
            ["province_code"],
            ["province_code"],
        )
        batch.create_index("ix_sessions_province_code", ["province_code"])

    op.create_index("uq_sessions_response_code", "sessions", ["response_code"], unique=True)

    op.create_table(
        "report_paths",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("path_code", sa.String(length=50), nullable=False),
        sa.Column("label_lao", sa.String(length=500), nullable=False),
        sa.Column("classification", sa.String(length=50), nullable=True),
        sa.Column("fit_score", sa.Float(), nullable=True),
        sa.Column("feasibility_score", sa.Float(), nullable=True),
        sa.Column("compatibility_score", sa.Float(), nullable=True),
        sa.Column("evidence_question_ids", sa.JSON(), nullable=False),
        sa.Column("reasons_lao", sa.JSON(), nullable=False),
        sa.Column("conditions_lao", sa.JSON(), nullable=False),
        sa.Column("scoring_version", sa.String(length=100), nullable=True),
        sa.CheckConstraint("rank >= 1 AND rank <= 3", name="ck_report_paths_rank_1_3"),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("report_id", "rank", name="uq_report_paths_report_rank"),
    )
    op.create_index("ix_report_paths_report_id", "report_paths", ["report_id"])
    op.create_index("ix_report_paths_path_code", "report_paths", ["path_code"])

    bind = op.get_bind()
    answer_rows = sa.table(
        "answers",
        sa.column("session_id", sa.String),
        sa.column("question_id", sa.String),
        sa.column("option_codes", sa.JSON),
        sa.column("text_value", sa.Text),
    )
    session_rows = sa.table(
        "sessions",
        sa.column("id", sa.String),
        sa.column("status", sa.String),
        sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("completed_at", sa.DateTime(timezone=True)),
    )
    response_counters = sa.table(
        "response_counters",
        sa.column("year", sa.Integer),
        sa.column("province_code", sa.String),
        sa.column("last_sequence", sa.Integer),
    )

    answers_by_session: dict[str, dict[str, Any]] = defaultdict(dict)
    for row in bind.execute(sa.select(answer_rows)).mappings():
        answers_by_session[row["session_id"]][row["question_id"]] = row

    option_to_province = {option: code for code, option, _ in PROVINCES}
    counters: dict[tuple[int, str], int] = defaultdict(int)
    update_sessions = sa.table(
        "sessions",
        sa.column("id", sa.String),
        sa.column("response_code", sa.String),
        sa.column("province_code", sa.String),
        sa.column("age_years", sa.Integer),
    )
    ordered_sessions = sa.select(session_rows).order_by(
        sa.func.coalesce(session_rows.c.completed_at, session_rows.c.created_at),
        session_rows.c.id,
    )
    for row in bind.execute(ordered_sessions).mappings():
        session_answers = answers_by_session.get(row["id"], {})
        d1 = session_answers.get("D1")
        d3 = session_answers.get("D3")
        age = _age_years(d1["text_value"] if d1 else None)
        options = _json_value(d3["option_codes"] if d3 else None) or []
        province_code = option_to_province.get(options[0]) if options else None

        values: dict[str, Any] = {
            "province_code": province_code,
            "age_years": age,
        }
        if row["status"] == "completed":
            year = _local_year(row["completed_at"] or row["created_at"])
            counter_key = (year, province_code or "UNK")
            counters[counter_key] += 1
            values["response_code"] = (
                f"{year}-{counter_key[1]}-{counters[counter_key]:06d}"
            )
        bind.execute(
            sa.update(update_sessions)
            .where(update_sessions.c.id == row["id"])
            .values(**values)
        )

    if counters:
        op.bulk_insert(
            response_counters,
            [
                {"year": year, "province_code": province, "last_sequence": sequence}
                for (year, province), sequence in counters.items()
            ],
        )

    reports_table = sa.table(
        "reports",
        sa.column("id", sa.Integer),
        sa.column("possible_paths", sa.JSON),
        sa.column("versions", sa.JSON),
    )
    report_paths_table = sa.table(
        "report_paths",
        sa.column("report_id", sa.Integer),
        sa.column("rank", sa.Integer),
        sa.column("path_code", sa.String),
        sa.column("label_lao", sa.String),
        sa.column("classification", sa.String),
        sa.column("fit_score", sa.Float),
        sa.column("feasibility_score", sa.Float),
        sa.column("compatibility_score", sa.Float),
        sa.column("evidence_question_ids", sa.JSON),
        sa.column("reasons_lao", sa.JSON),
        sa.column("conditions_lao", sa.JSON),
        sa.column("scoring_version", sa.String),
    )
    path_inserts = []
    for row in bind.execute(sa.select(reports_table)).mappings():
        paths = _json_value(row["possible_paths"]) or []
        versions = _json_value(row["versions"]) or {}
        if not isinstance(paths, list):
            continue
        scoring_version = versions.get("ds") if isinstance(versions, dict) else None
        for rank, path in enumerate(paths[:3], start=1):
            if not isinstance(path, dict):
                continue
            path_code = path.get("group_id")
            if not path_code:
                continue
            path_inserts.append({
                "report_id": row["id"],
                "rank": rank,
                "path_code": str(path_code),
                "label_lao": str(path.get("label_lao") or path_code),
                "classification": path.get("classification"),
                "fit_score": path.get("fit_score"),
                "feasibility_score": path.get("feasibility_score"),
                "compatibility_score": path.get("compatibility_score"),
                "evidence_question_ids": path.get("evidence_question_ids") or [],
                "reasons_lao": path.get("reasons_lao") or [],
                "conditions_lao": path.get("conditions_lao") or [],
                "scoring_version": scoring_version,
            })
    if path_inserts:
        op.bulk_insert(report_paths_table, path_inserts)


def downgrade() -> None:
    op.drop_table("report_paths")
    op.drop_index("uq_sessions_response_code", table_name="sessions")
    with op.batch_alter_table("sessions") as batch:
        batch.drop_index("ix_sessions_province_code")
        batch.drop_constraint("fk_sessions_province_code_province_catalog", type_="foreignkey")
        batch.drop_column("age_years")
        batch.drop_column("province_code")
        batch.drop_column("response_code")
    op.drop_table("response_counters")
    op.drop_table("province_catalog")
