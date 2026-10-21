import base64
import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


def to_global_id(type_: str, internal_id: int) -> str:
    # Relay normalizes its store on `id`, so ids must be unique across types.
    combined = f"{type_}:{internal_id}"
    return base64.urlsafe_b64encode(combined.encode("utf-8")).decode("utf-8").rstrip("=")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
