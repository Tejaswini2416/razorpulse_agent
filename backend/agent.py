import json
# pyrefly: ignore [missing-import]
from langchain_groq import ChatGroq
# pyrefly: ignore [missing-import]
from langchain_core.prompts import ChatPromptTemplate
from schemas import MerchantAnalysis
from config import settings

def get_groq_llm():
    # Use the specified model and configure for JSON output
    # Llama 3.3 70b versatile
    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=2048,
        model_kwargs={"response_format": {"type": "json_object"}}
    )
    return llm

system_prompt = """
You are RazorPulse, an elite autonomous context-aware merchant onboarding and agentic commerce engine.
Your task is to analyze scraped data from a merchant's digital footprint and synthesize it into a strict JSON object that matches our schema.

Requirements:
- Classify the merchant and calculate a risk score (0-100).
- Synthesize KYC data, finding GSTIN clues and registered names.
- Recommend Razorpay products based on their profile.
- Bounded logic:
  - If cart abandonment is an issue, recommend Magic Checkout.
  - If Instagram/Social seller, recommend Payment Pages / Payment Links.
  - If Subscription/SaaS, recommend Subscriptions & AutoPay.
  - If B2B, recommend Invoicing & Capital.
  - CAP conversion lift estimates at 30%. Never exceed 30.0 for `estimated_conversion_lift_percent`.
  - Only suggest high-tier products (Capital, Magic Checkout) if you have high confidence (> 80).

You must respond with ONLY a JSON object that strictly adheres to the following schema structure:
{{
  "business_name": "string",
  "detected_category": "string",
  "cart_type": "string",
  "estimated_aov": float,
  "risk_score": int (0-100),
  "kyc_prefill_data": {{
    "gstin_clue": "string or null",
    "registered_name": "string or null",
    "compliance_checklist": ["item1", "item2"]
  }},
  "recommended_products": [
    {{
      "product_name": "string",
      "rationale": "string",
      "estimated_conversion_lift_percent": float (<= 30.0),
      "annual_saved_revenue_inr": float,
      "confidence_score": float (0-100)
    }}
  ]
}}
"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("user", "Scraped Data:\n{scraped_data}")
])

async def analyze_merchant_data(scraped_data: dict) -> MerchantAnalysis:
    # If the user hasn't provided a valid key, mock the response to ensure the UI can be built and tested
    if not settings.groq_api_key or settings.groq_api_key in ["mock-groq-key", "your_groq_api_key_here", "gsk_your_actual_key_here"] or not settings.groq_api_key.startswith("gsk_"):
        return mock_analysis(scraped_data)
        
    try:
        llm = get_groq_llm()
        chain = prompt_template | llm
        
        response = await chain.ainvoke({"scraped_data": json.dumps(scraped_data)})
        # response.content is a JSON string
        result_dict = json.loads(response.content)
        
        # Enforce Pydantic validation (this will catch any out-of-bounds values like >30% lift)
        return MerchantAnalysis(**result_dict)
    except Exception as err:
        print(f"LLM analysis error: {err}. Falling back to mock analysis.")
        return mock_analysis(scraped_data)

def mock_analysis(scraped_data: dict) -> MerchantAnalysis:
    url = scraped_data.get("url", "")
    
    if "fashion" in url.lower() or "d2c" in url.lower():
        return MerchantAnalysis(
            business_name="Mock Fashion Brand",
            detected_category="Fashion D2C",
            cart_type="Shopify",
            estimated_aov=2500.0,
            risk_score=15,
            kyc_prefill_data={"gstin_clue": "27AADCB2230M1Z2", "registered_name": "Mock Fashion Pvt Ltd", "compliance_checklist": ["Privacy Policy"]},
            recommended_products=[
                {
                    "product_name": "Razorpay Magic Checkout",
                    "rationale": "High cart abandonment detected for Shopify D2C brand.",
                    "estimated_conversion_lift_percent": 25.0,
                    "annual_saved_revenue_inr": 1500000.0,
                    "confidence_score": 95.0
                }
            ]
        )
    elif "saas" in url.lower() or "b2b" in url.lower():
         return MerchantAnalysis(
            business_name="Mock SaaS Startup",
            detected_category="B2B SaaS",
            cart_type="Custom",
            estimated_aov=10000.0,
            risk_score=5,
            kyc_prefill_data={"gstin_clue": "29ABCDE1234F1Z5", "registered_name": "Mock Tech Solutions", "compliance_checklist": ["Terms of Service"]},
            recommended_products=[
                {
                    "product_name": "Razorpay Subscriptions & AutoPay",
                    "rationale": "Recurring revenue model detected.",
                    "estimated_conversion_lift_percent": 15.0,
                    "annual_saved_revenue_inr": 500000.0,
                    "confidence_score": 90.0
                }
            ]
        )
    else:
        return MerchantAnalysis(
            business_name="Generic Store",
            detected_category="E-commerce",
            cart_type="WooCommerce",
            estimated_aov=1500.0,
            risk_score=25,
            kyc_prefill_data={"gstin_clue": None, "registered_name": None, "compliance_checklist": []},
            recommended_products=[
                {
                    "product_name": "Razorpay Payment Gateway",
                    "rationale": "Standard ecommerce setup requires a reliable payment gateway.",
                    "estimated_conversion_lift_percent": 10.0,
                    "annual_saved_revenue_inr": 100000.0,
                    "confidence_score": 99.0
                }
            ]
        )
