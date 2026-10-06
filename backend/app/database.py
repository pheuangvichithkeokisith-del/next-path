from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Normalize Postgres URLs from postgres:// or postgresql:// to postgresql+asyncpg:// if needed
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Connection args for SQLite and PostgreSQL (Supabase pooler support)
connect_args = {}
if "sqlite" in db_url:
    connect_args["check_same_thread"] = False
elif "postgresql" in db_url or "postgres" in db_url:
    # Disable statement caching for compatibility with PgBouncer / Supabase transaction pooler
    connect_args["statement_cache_size"] = 0
    connect_args["prepared_statement_cache_size"] = 0

engine = create_async_engine(
    db_url,
    echo=settings.DB_ECHO,
    future=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base declarative class for all ORM models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async SQLAlchemy database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize local development tables.

    Production schema changes are owned by Alembic and are applied by the
    container entrypoint before Uvicorn starts.  Calling ``create_all`` in a
    production process can silently create an incomplete schema and skip seed
    data from later migrations, so production startup must fail through the
    migration step instead of trying to repair the database here.
    """
    if settings.ENVIRONMENT.strip().lower() in {"production", "prod"}:
        return

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
