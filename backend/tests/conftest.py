"""Shared pytest setup and cleanup for the async database engine."""

import os
import tempfile

import pytest_asyncio

# Keep tests isolated from the developer database when pytest is run without an
# explicit DATABASE_URL. The environment override is set before test modules
# import app.main and construct the SQLAlchemy engine.
if "DATABASE_URL" not in os.environ:
    test_db_path = os.path.join(tempfile.gettempdir(), f"pathai_pytest_{os.getpid()}.db")
    os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{test_db_path}"

from app.database import engine
from app.database import init_db


@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    """Create tables for each test and release aiosqlite connections afterward."""
    await init_db()
    yield
    await engine.dispose()
