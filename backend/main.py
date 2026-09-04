from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import datetime
from schemas import MerchantRequest, ScraperStatus, MerchantAnalysis
from scraper import scrape_url
from agent import analyze_merchant_data
from database import init_db, get_db, AuditLog, MerchantSession, AsyncSessionLocal

app = FastAPI(title="RazorPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/api/analyze/stream")
async def analyze_merchant_stream(url: str, request: Request):
    async def event_generator():
        try:
            # Step 1: Initialize
            yield {"event": "status", "data": json.dumps({"step": "Initializing", "status": "running", "message": "Starting evaluation pipeline...", "data": None})}
            await asyncio.sleep(1)
            
            # Step 2: Scraping
            yield {"event": "status", "data": json.dumps({"step": "Scraping", "status": "running", "message": f"Extracting Digital Footprint & Visual Metadata for {url}...", "data": None})}
            scraped_data = await scrape_url(url)
            
            # Log scraping result
            async with AsyncSessionLocal() as db:
                audit = AuditLog(
                    merchant_url=url,
                    step="Scraping",
                    status="success" if not scraped_data.is_fallback else "fallback",
                    details=scraped_data.model_dump_json(),
                    is_failure_recovery=scraped_data.is_fallback
                )
                db.add(audit)
                await db.commit()

            yield {"event": "status", "data": json.dumps({"step": "Scraping", "status": "completed", "message": "Scraping complete.", "data": scraped_data.model_dump()})}
            await asyncio.sleep(1)

            # Step 3: Agentic Analysis
            yield {"event": "status", "data": json.dumps({"step": "Agentic Analysis", "status": "running", "message": "Running multi-modal analysis & classifying merchant model...", "data": None})}
            analysis_result = await analyze_merchant_data(scraped_data.model_dump())
            
            # Log Agentic Analysis
            async with AsyncSessionLocal() as db:
                from sqlalchemy import select
                audit = AuditLog(
                    merchant_url=url,
                    step="Agentic Analysis",
                    status="success",
                    details=analysis_result.model_dump_json()
                )
                db.add(audit)
                
                # Upsert session: update if URL already exists, or insert new
                stmt = select(MerchantSession).where(MerchantSession.merchant_url == url)
                res = await db.execute(stmt)
                existing_session = res.scalars().first()
                if existing_session:
                    existing_session.analysis_result = analysis_result.model_dump_json()
                    existing_session.created_at = datetime.datetime.utcnow()
                else:
                    session = MerchantSession(merchant_url=url, analysis_result=analysis_result.model_dump_json())
                    db.add(session)
                await db.commit()

            yield {"event": "status", "data": json.dumps({"step": "Agentic Analysis", "status": "completed", "message": "Analysis complete.", "data": analysis_result.model_dump()})}
            
            # Final Completion event
            yield {"event": "complete", "data": json.dumps({"message": "Pipeline completed successfully.", "url": url})}

        except Exception as e:
            # Handle and log catastrophic failure
            async with AsyncSessionLocal() as db:
                audit = AuditLog(
                    merchant_url=url,
                    step="Pipeline Execution",
                    status="error",
                    details=json.dumps({"error": str(e)}),
                    is_failure_recovery=True
                )
                db.add(audit)
                await db.commit()
            
            yield {"event": "error", "data": json.dumps({"error": str(e)})}
            
    return EventSourceResponse(event_generator())

@app.get("/api/results/{url:path}")
async def get_results(url: str):
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        # Get the latest session
        stmt = select(MerchantSession).where(MerchantSession.merchant_url == url).order_by(MerchantSession.created_at.desc())
        result = await db.execute(stmt)
        session = result.scalars().first()
        
        if session:
            return json.loads(session.analysis_result)
        return {"error": "Not found"}

@app.get("/api/audit/{url:path}")
async def get_audit_trail(url: str):
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        stmt = select(AuditLog).where(AuditLog.merchant_url == url).order_by(AuditLog.timestamp.asc())
        result = await db.execute(stmt)
        logs = result.scalars().all()
        
        return [{"id": log.id, "timestamp": log.timestamp.isoformat(), "step": log.step, "status": log.status, "details": log.details, "is_failure_recovery": log.is_failure_recovery} for log in logs]
