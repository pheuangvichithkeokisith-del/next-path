"""Shared pytest cleanup for the async database engine."""

import pytest_asyncio

from app.database import engine


@pytest_asyncio.fixture(autouse=True)
async def dispose_database_engine():
    """Release aiosqlite connections so pytest can exit after DB tests."""
    yield
    await engine.dispose()
