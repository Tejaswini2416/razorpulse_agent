from __future__ import annotations

import json
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

try:
    from .config import settings
except (ImportError, ValueError):
    from config import settings



class Base(DeclarativeBase):
    pass


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(255), index=True)
    merchant_input: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(64), index=True)
    trace: Mapped[str] = mapped_column(Text)
    scraped_summary: Mapped[str] = mapped_column(Text)
    analysis: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )


engine = create_async_engine(settings.sqlite_database_url, echo=False, future=True)
AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def log_audit_entry(session_id: str, merchant_input: str, status: str, trace: list[dict], scraped_summary: dict, analysis: dict | None = None) -> None:
    async with AsyncSessionFactory() as session:
        entry = AuditLog(
            session_id=session_id,
            merchant_input=merchant_input,
            status=status,
            trace=json.dumps(trace, default=str),
            scraped_summary=json.dumps(scraped_summary, default=str),
            analysis=json.dumps(analysis, default=str) if analysis else None,
        )
        session.add(entry)
        await session.commit()
