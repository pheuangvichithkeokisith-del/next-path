"""Safely mark the original schema revision on existing create_all databases.

Older deployments created the initial schema via SQLAlchemy ``create_all`` and
may not have an Alembic version table. This stamps only databases whose full
baseline schema is present; partial or unknown schemas fail closed.
"""

import asyncio

from sqlalchemy import inspect, text

from app.database import engine


BASELINE_COLUMNS = {
    "sessions": {
        "id", "form_version", "status", "created_at", "updated_at", "completed_at",
    },
    "answers": {
        "id", "session_id", "question_id", "option_codes", "other_text",
        "extra_text", "text_value", "created_at", "updated_at",
    },
    "reports": {
        "id", "session_id", "response_pattern", "possible_paths", "context_factors",
        "unknowns", "versions", "summary_text", "template_id", "ai_version",
        "created_at", "updated_at",
    },
    "feedbacks": {
        "id", "session_id", "agreement", "incorrect_note", "next_interest", "created_at",
    },
}


async def bootstrap_baseline_revision() -> None:
    async with engine.begin() as connection:
        schema = await connection.run_sync(
            lambda sync_connection: {
                "tables": set(inspect(sync_connection).get_table_names()),
                "columns": {
                    table: {
                        column["name"]
                        for column in inspect(sync_connection).get_columns(table)
                    }
                    for table in BASELINE_COLUMNS
                    if table in inspect(sync_connection).get_table_names()
                },
            }
        )
        tables = schema["tables"]
        baseline_tables = set(BASELINE_COLUMNS)

        if "alembic_version" in tables:
            result = await connection.execute(text("SELECT version_num FROM alembic_version"))
            if result.first() is None:
                raise RuntimeError(
                    "alembic_version exists but is empty; refusing to guess the database revision."
                )
            return

        present_baseline = baseline_tables.intersection(tables)
        if not present_baseline:
            return  # Fresh database: Alembic will create the baseline normally.
        if present_baseline != baseline_tables:
            raise RuntimeError(
                "Existing database has only part of the original PATHAI schema; "
                "refusing to stamp an unknown baseline."
            )

        missing_columns = {
            table: sorted(BASELINE_COLUMNS[table] - schema["columns"].get(table, set()))
            for table in baseline_tables
            if BASELINE_COLUMNS[table] - schema["columns"].get(table, set())
        }
        if missing_columns:
            raise RuntimeError(
                f"Existing PATHAI schema does not match the Alembic baseline: {missing_columns}"
            )

        await connection.execute(
            text(
                "CREATE TABLE IF NOT EXISTS alembic_version "
                "(version_num VARCHAR(32) NOT NULL PRIMARY KEY)"
            )
        )
        await connection.execute(
            text(
                "INSERT INTO alembic_version (version_num) VALUES ('0001_initial') "
                "ON CONFLICT DO NOTHING"
            )
        )


if __name__ == "__main__":
    asyncio.run(bootstrap_baseline_revision())
