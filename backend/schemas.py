from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class KYCData(BaseModel):
    gstin_clue: Optional[str] = Field(None, description="Extracted GSTIN or clues about it")
    registered_name: Optional[str] = Field(None, description="Registered legal name of the business")
    compliance_checklist: List[str] = Field(default_factory=list, description="List of detected compliance items like Privacy Policy, T&C")

class ProductRecommendation(BaseModel):
    product_name: str = Field(..., description="Name of the Razorpay product (e.g., Razorpay Magic Checkout, Payment Pages, Subscriptions)")
    rationale: str = Field(..., description="Explainable rationale for this recommendation")
    estimated_conversion_lift_percent: float = Field(..., description="Estimated conversion lift percentage", ge=0.0, le=30.0)
    annual_saved_revenue_inr: float = Field(..., description="Calculated annual saved revenue in INR", ge=0.0)
    confidence_score: float = Field(..., description="Confidence in this recommendation (0-100)", ge=0.0, le=100.0)
    
    @field_validator("confidence_score")
    def check_confidence(cls, v, info):
        # We can add custom validation if needed, e.g., high-tier products need high confidence
        return v
        
class MerchantAnalysis(BaseModel):
    business_name: str = Field(..., description="Extracted name of the business")
    detected_category: str = Field(..., description="Business category (e.g., Fashion D2C, B2B SaaS)")
    cart_type: str = Field(..., description="Cart platform used (e.g., Shopify, WooCommerce, Custom, None)")
    estimated_aov: float = Field(..., description="Estimated Average Order Value in INR")
    risk_score: int = Field(..., description="Calculated risk score (0-100), 0 being lowest risk", ge=0, le=100)
    kyc_prefill_data: KYCData
    recommended_products: List[ProductRecommendation]

class ScraperStatus(BaseModel):
    step: str
    status: str # "pending", "running", "completed", "failed"
    message: str
    data: Optional[dict] = None

class MerchantRequest(BaseModel):
    url: str
