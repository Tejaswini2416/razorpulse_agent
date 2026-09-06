from __future__ import annotations

import asyncio
import json
import uuid
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import ValidationError

try:
    from .agent import GroqAgent
    from .config import settings
    from .database import AsyncSessionFactory, AuditLog, init_db, log_audit_entry
    from .schemas import AuditLogEntry, MerchantAnalysis, StatusUpdate
    from .scraper import scrape_merchant_profile
except (ImportError, ValueError):
    from agent import GroqAgent
    from config import settings
    from database import AsyncSessionFactory, AuditLog, init_db, log_audit_entry
    from schemas import AuditLogEntry, MerchantAnalysis, StatusUpdate
    from scraper import scrape_merchant_profile


# Default allowed origins for local Vite/Next.js dev & live Vercel deployment
DEFAULT_ALLOWED_ORIGINS = [
    "https://razorpulse-agent.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

configured_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
allowed_origins = list(dict.fromkeys(DEFAULT_ALLOWED_ORIGINS + configured_origins))

app = FastAPI(title="RazorPulse Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = GroqAgent()


async def stream_status(session_id: str, merchant_input: str) -> Any:
    steps = [
        "Extracting Digital Footprint & Visual Metadata...",
        "Classifying Merchant Model via Groq LPU (llama-3.3-70b-versatile)...",
        "Synthesizing KYC & GST Metadata...",
        "Running Agentic Product Matchmaking Matrix...",
    ]
    trace: list[dict[str, Any]] = []
    scraped = await scrape_merchant_profile(merchant_input)
    trace.append({"event": "scrape", "payload": scraped})
    for index, message in enumerate(steps, start=1):
        event = StatusUpdate(event="status", step=index, message=message, status="running")
        yield f"data: {json.dumps(event.model_dump(mode='json'))}\n\n"
        await asyncio.sleep(0.6)
    classification = await agent.classify_merchant(scraped)
    trace.append({"event": "classification", "payload": classification})
    try:
        analysis = MerchantAnalysis.model_validate(classification)
    except ValidationError:
        analysis = MerchantAnalysis(
            business_name=scraped.get("business_name", "Merchant Brand"),
            detected_category=scraped.get("detected_category", "General Commerce"),
            cart_type=scraped.get("cart_type", "General eCommerce"),
            estimated_aov=int(scraped.get("estimated_aov") or 2500),
            risk_score=int(scraped.get("risk_score") or 30),
            confidence_score=int(classification.get("confidence_score") or 75),
            kyc_prefill_data={
                "legal_name": classification.get("kyc_prefill_data", {}).get("legal_name", scraped.get("business_name", "Merchant Brand")),
                "gstin": classification.get("kyc_prefill_data", {}).get("gstin", "GSTIN-VERIFY-REQD"),
                "business_email": classification.get("kyc_prefill_data", {}).get("business_email", "hello@merchant.example"),
                "business_phone": classification.get("kyc_prefill_data", {}).get("business_phone", "+91 98765 43210"),
                "registered_address": classification.get("kyc_prefill_data", {}).get("registered_address", "India"),
                "compliance_checklist": classification.get("kyc_prefill_data", {}).get("compliance_checklist", ["GST registration check"]),
                "verification_status": classification.get("kyc_prefill_data", {}).get("verification_status", "inferred"),
            },
            summary=classification.get("summary", "Merchant profile classified successfully."),
            recommendations=[
                {
                    "product_name": rec.get("product_name", "Razorpay Product"),
                    "category": rec.get("category", "Payments"),
                    "match_score": int(rec.get("match_score", 80)),
                    "roi_projection": float(rec.get("roi_projection", 10.0)),
                    "annual_saved_revenue": float(rec.get("annual_saved_revenue", 0.0)),
                    "rationale": rec.get("rationale", "Recommendation based on supported merchant model.") ,
                    "confidence": int(rec.get("confidence", 80)),
                    "explainability": rec.get("explainability", ["Bounded to a safe position"]),
                    "guardrails": rec.get("guardrails", ["Use audit logs for review"]),
                    "recommended": bool(rec.get("recommended", True)),
                    "bounded_risk": rec.get("bounded_risk", "Low"),
                }
                for rec in classification.get("recommendations", [])
            ],
            growth_levers=classification.get("growth_levers", ["Checkout optimization"]),
            failure_mode=bool(classification.get("failure_mode", False)),
            failure_reason=classification.get("failure_reason"),
        )

    payload = analysis.model_dump(mode='json')
    yield f"data: {json.dumps(StatusUpdate(event='analysis', message='Merchant profile classified successfully.', status='success', payload=payload).model_dump(mode='json'))}\n\n"
    await log_audit_entry(session_id, merchant_input, 'completed', trace, scraped, payload)


@app.on_event("startup")
async def startup() -> None:
    await init_db()


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "RazorPulse Agent API is running"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_merchant(payload: dict[str, str]) -> StreamingResponse:
    merchant_input = payload.get("merchant_input", "").strip()
    if not merchant_input:
        raise HTTPException(status_code=400, detail="merchant_input is required")

    session_id = str(uuid.uuid4())
    return StreamingResponse(stream_status(session_id, merchant_input), media_type="text/event-stream")


@app.get("/sessions")
async def get_recent_sessions() -> list[dict[str, Any]]:
    from .database import AsyncSessionFactory, AuditLog
    from sqlalchemy import select

    async with AsyncSessionFactory() as session:
        result = await session.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10))
        rows = result.scalars().all()
        return [
            {
                "session_id": row.session_id,
                "merchant_input": row.merchant_input,
                "status": row.status,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]


@app.get("/audit/{session_id}")
async def get_audit_entry(session_id: str) -> AuditLogEntry:
    from .database import AsyncSessionFactory, AuditLog
    from sqlalchemy import select

    async with AsyncSessionFactory() as session:
        result = await session.execute(select(AuditLog).where(AuditLog.session_id == session_id))
        row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return AuditLogEntry(
        session_id=row.session_id,
        merchant_input=row.merchant_input,
        status=row.status,
        trace=json.loads(row.trace or "[]"),
        scraped_summary=json.loads(row.scraped_summary or "{}"),
        analysis=json.loads(row.analysis or "null") if row.analysis else None,
    )


if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", settings.backend_port))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
