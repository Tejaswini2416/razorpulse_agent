from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class KycPrefillData(BaseModel):
    model_config = ConfigDict(extra="allow")

    legal_name: str = ""
    gstin: str = ""
    business_email: str = ""
    business_phone: str = ""
    registered_address: str = ""
    compliance_checklist: list[str] = Field(default_factory=list)
    verification_status: str = "inferred"


class ProductRecommendation(BaseModel):
    model_config = ConfigDict(extra="allow")

    product_name: str
    category: str
    match_score: int = Field(..., ge=0, le=100)
    roi_projection: float = Field(..., ge=0)
    annual_saved_revenue: float = Field(..., ge=0)
    rationale: str
    confidence: int = Field(..., ge=0, le=100)
    explainability: list[str]
    guardrails: list[str]
    recommended: bool = True
    bounded_risk: str = "Low"


class MerchantAnalysis(BaseModel):
    model_config = ConfigDict(extra="allow")

    business_name: str
    detected_category: str
    cart_type: str
    estimated_aov: int = Field(..., ge=0)
    risk_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    kyc_prefill_data: KycPrefillData
    summary: str
    recommendations: list[ProductRecommendation]
    growth_levers: list[str]
    failure_mode: bool = False
    failure_reason: str | None = None


class StatusUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")

    event: str
    step: int | None = None
    message: str
    status: Literal["running", "success", "warning", "failed"] = "running"
    payload: dict[str, Any] | None = None


class AuditLogEntry(BaseModel):
    model_config = ConfigDict(extra="allow")

    session_id: str
    merchant_input: str
    status: str
    trace: list[dict[str, Any]]
    scraped_summary: dict[str, Any]
    analysis: MerchantAnalysis | None = None
