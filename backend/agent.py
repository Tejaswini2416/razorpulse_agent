from __future__ import annotations

import json
import time
from typing import Any

from groq import AsyncGroq

try:
    from .config import settings
except (ImportError, ValueError):
    from config import settings



class GroqAgent:
    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.api_key = api_key or settings.groq_api_key
        self.model = model or settings.groq_model
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key and self.api_key != "demo-key" else None

    async def classify_merchant(self, scraped: dict[str, Any]) -> dict[str, Any]:
        prompt = f"""
You are a merchant classification engine for Razorpay onboarding.
Analyze this merchant profile and return a strict JSON object with:
- business_name
- detected_category
- cart_type
- estimated_aov
- risk_score
- confidence_score
- summary
- growth_levers
- kyc_prefill_data: {{"legal_name": string, "gstin": string, "business_email": string, "business_phone": string, "registered_address": string, "compliance_checklist": string[], "verification_status": string}}
- recommendations: array of product recommendations, each with product_name, category, match_score, roi_projection, annual_saved_revenue, rationale, confidence, explainability, guardrails, recommended, bounded_risk

Use only bounded, explainable, business-safe logic.

Profile JSON:
{json.dumps(scraped, indent=2)}
"""


        if not self.client:
            return self._fallback_classification(scraped)

        start = time.perf_counter()
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=1200,
            )
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            raw = response.choices[0].message.content
            payload = json.loads(raw)
            payload["_latency_ms"] = latency_ms
            payload["_source"] = "groq"
            return payload
        except Exception:
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            return self._fallback_classification(scraped, latency_ms=latency_ms)


    def _fallback_classification(self, scraped: dict[str, Any], latency_ms: float | None = None) -> dict[str, Any]:
        business_name = scraped.get("business_name") or "Merchant Brand"
        category = scraped.get("detected_category") or "General Commerce"
        cart_type = scraped.get("cart_type") or "General eCommerce"
        aov = int(scraped.get("estimated_aov") or 2500)
        risk_score = int(scraped.get("risk_score") or 30)
        if "Instagram" in cart_type or "social" in str(cart_type).lower():
            recommendations = [
                {
                    "product_name": "Razorpay Payment Pages / Payment Links",
                    "category": "Payments",
                    "match_score": 96,
                    "roi_projection": 18.2,
                    "annual_saved_revenue": 960000,
                    "rationale": "Social-first merchants benefit from instant payment collection with minimal checkout friction and link-based distribution.",
                    "confidence": 96,
                    "explainability": ["Social-first checkout pattern", "Direct monetization speed", "Lower drop-off risk"],
                    "guardrails": ["Limit checkout to supported payment methods", "Monitor failure rates and API uptime"],
                    "recommended": True,
                    "bounded_risk": "Low",
                }
            ]
        elif "SaaS" in cart_type or "Subscription" in cart_type or "B2B" in str(cart_type).lower():
            recommendations = [
                {
                    "product_name": "Razorpay Subscriptions & AutoPay",
                    "category": "Subscriptions",
                    "match_score": 93,
                    "roi_projection": 25.4,
                    "annual_saved_revenue": 2450000,
                    "rationale": "Recurring revenue cohorts are best served by automated subscription billing and smart dunning sequences.",
                    "confidence": 93,
                    "explainability": ["Recurring revenue model", "Higher retention potential", "Lower manual billing overhead"],
                    "guardrails": ["Validate billing cycles and retries", "Ensure compliant payment reminders"],
                    "recommended": True,
                    "bounded_risk": "Low",
                }
            ]
        elif "Fashion" in cart_type or "D2C" in cart_type:
            recommendations = [
                {
                    "product_name": "Razorpay Magic Checkout",
                    "category": "Checkout",
                    "match_score": 97,
                    "roi_projection": 31.8,
                    "annual_saved_revenue": 1850000,
                    "rationale": "High cart-abandonment fashion merchants gain from a faster, one-click conversion path across payment methods.",
                    "confidence": 97,
                    "explainability": ["High abandonment signal", "Checkout friction reduction", "Conversion uplift on repeat buyers"],
                    "guardrails": ["Track abandonment before and after rollout", "Keep payment method limits audit-friendly"],
                    "recommended": True,
                    "bounded_risk": "Low",
                }
            ]
        else:
            recommendations = [
                {
                    "product_name": "Razorpay Invoicing & Razorpay Capital",
                    "category": "B2B Finance",
                    "match_score": 88,
                    "roi_projection": 14.7,
                    "annual_saved_revenue": 1180000,
                    "rationale": "High-ticket transactions benefit from invoice automation and capital-linked working capital support.",
                    "confidence": 88,
                    "explainability": ["High ticket value", "Working capital need", "B2B invoice volume"],
                    "guardrails": ["Verify credit risk based on transaction history", "Use capped exposure thresholds"],
                    "recommended": True,
                    "bounded_risk": "Medium",
                }
            ]

        payload = {
            "business_name": business_name,
            "detected_category": category,
            "cart_type": cart_type,
            "estimated_aov": aov,
            "risk_score": risk_score,
            "confidence_score": 79,
            "summary": "Merchant profile was classified with a bounded synthetic fallback due to limited live verification or demo mode constraints.",
            "growth_levers": [
                "Reduce checkout friction",
                "Increase repeat-purchase absorption",
                "Lower payment-link failure risk",
            ],
            "kyc_prefill_data": {
                "legal_name": business_name,
                "gstin": "GSTIN-VERIFY-REQD",
                "business_email": "hello@merchant.example",
                "business_phone": "+91 98765 43210",
                "registered_address": "India",
                "compliance_checklist": [
                    "GST registration check",
                    "PAN validation",
                    "Bank account verification",
                    "Business address verification",
                ],
                "verification_status": "inferred",
            },
            "recommendations": recommendations,
            "failure_mode": "failed" in str(cart_type).lower() or risk_score > 75,
            "failure_reason": "Synthetic fallback engaged due to incomplete or invalid merchant data." if risk_score > 75 else None,
            "_latency_ms": latency_ms,
            "_source": "fallback",
        }
        return payload
