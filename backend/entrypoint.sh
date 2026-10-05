#!/bin/sh
set -eu

python -m app.migration_bootstrap
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
