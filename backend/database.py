from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
import datetime
from config import settings

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    merchant_url = Column(String, index=True)
    step = Column(String) # e.g., "scraping", "llm_analysis", "kyc_synthesis"
    status = Column(String) # "success", "error", "fallback"
    details = Column(Text) # JSON string with detailed trace/logs
    is_failure_recovery = Column(Boolean, default=False)

class MerchantSession(Base):
    __tablename__ = "merchant_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_url = Column(String, unique=True, index=True)
    analysis_result = Column(Text) # JSON string of MerchantAnalysis
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
