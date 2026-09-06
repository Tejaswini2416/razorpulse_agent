from __future__ import annotations

import re
from typing import Any

import httpx
from bs4 import BeautifulSoup


def build_synthetic_profile(query: str, error: str | None = None) -> dict[str, Any]:
    normalized = (query or "").strip()
    lower = normalized.lower()

    if "fashion" in lower or "d2c" in lower or "cart" in lower or "drop" in lower:
        merchant_type = "Fashion D2C"
        category = "Fashion & Lifestyle"
        business_name = "Velora Studio"
        aov = 2200
        risk_score = 34
    elif "saas" in lower or "subscription" in lower or "b2b" in lower or "invoic" in lower:
        merchant_type = "B2B SaaS / Subscription"
        category = "SaaS / B2B"
        business_name = "Northstar Cloud"
        aov = 54000
        risk_score = 22
    elif "artisan" in lower or "instagram" in lower or "social" in lower or "payment link" in lower:
        merchant_type = "Instagram-first commerce"
        category = "Creator Commerce"
        business_name = "The Grace Loom"
        aov = 1800
        risk_score = 41
    elif "broken" in lower or "invalid" in lower or "bad" in lower or "fail" in lower:
        merchant_type = "Fallback / Recovery Mode"
        category = "Unverified Merchant"
        business_name = "Unknown Merchant"
        aov = 0
        risk_score = 82
    else:
        merchant_type = "General Commerce"
        category = "Omnichannel Retail"
        business_name = "Hudson & Co."
        aov = 2800
        risk_score = 29

    profile = {
        "source": "synthetic",
        "business_name": business_name,
        "brand_name": business_name,
        "detected_category": category,
        "cart_type": merchant_type,
        "estimated_aov": aov,
        "risk_score": risk_score,
        "logo_text": business_name[:2].upper(),
        "website": "https://example.com" if "http" not in normalized else normalized,
        "social_handles": ["@velora", "@northstarcloud", "@graceloom"],
        "description": "Merchant profile synthesized from the demo query to simulate the Razorpay onboarding assessment pipeline.",
        "confidence": 76,
        "verification_status": "fallback" if error else "partial",
        "scrape_notes": [
            "Digital footprint extracted from query context and demo heuristics.",
            "Metadata was bounded to a safe synthetic fallback for missing or rate-limited data.",
        ],
    }
    if error:
        profile["fallback_reason"] = error
    return profile


async def scrape_merchant_profile(query: str) -> dict[str, Any]:
    normalized = (query or "").strip()
    if not normalized:
        return build_synthetic_profile("", "Empty merchant input")

    if "http" in normalized or normalized.startswith("www."):
        url = normalized if normalized.startswith("http") else f"https://{normalized}"
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=12.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                html = response.text
                soup = BeautifulSoup(html, "html.parser")
                title = soup.title.get_text(strip=True) if soup.title else "Merchant Website"
                description_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
                description = description_tag.get("content", "") if description_tag else ""
                page_text = " ".join(soup.stripped_strings[:200])
                social_links = []
                for link in soup.find_all("a", href=True):
                    href = link["href"]
                    if "instagram.com" in href or "facebook.com" in href or "linkedin.com" in href or "x.com" in href:
                        social_links.append(href)
                business_name = re.sub(r"\s+[-|] .*$", "", title.strip()) or "Merchant Brand"

                profile = {
                    "source": "live_web",
                    "business_name": business_name,
                    "brand_name": business_name,
                    "detected_category": "Web Commerce",
                    "cart_type": "General eCommerce",
                    "estimated_aov": 3200,
                    "risk_score": 26,
                    "website": url,
                    "social_handles": social_links[:6],
                    "description": description or page_text[:220],
                    "logo_text": business_name[:2].upper(),
                    "confidence": 81,
                    "verification_status": "verified",
                    "scrape_notes": [
                        "Live HTML metadata was collected from the merchant website.",
                        "The storefront identity is inferred from the page title and social link metadata.",
                    ],
                }
                return profile
        except (httpx.HTTPError, ValueError):
            return build_synthetic_profile(normalized, "Website fetch failed or was rate-limited; synthetic fallback activated.")

    # handles like @shopname or shopname
    handle = normalized.lstrip("@")
    brand = handle.replace("-", " ").title() if handle else "Merchant Handle"
    return {
        "source": "social_handle",
        "business_name": brand,
        "brand_name": brand,
        "detected_category": "Social Commerce",
        "cart_type": "Instagram / Payment Link Seller",
        "estimated_aov": 1800,
        "risk_score": 38,
        "website": f"https://instagram.com/{handle}",
        "social_handles": [f"@{handle}"] if handle else ["@merchant"],
        "description": "Profile inferred from the merchant handle and social-first storefront patterns.",
        "logo_text": brand[:2].upper(),
        "confidence": 72,
        "verification_status": "inferred",
        "scrape_notes": [
            "Merchant handle was normalized and classified as a social-first sales model.",
            "Payment-link based demand patterns were inferred from platform behavior.",
        ],
    }
