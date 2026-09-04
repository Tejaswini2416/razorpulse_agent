# ⚡ RazorPulse — Autonomous Context-Aware Merchant Onboarding Engine

> **Razorpay Buildathon 2026** | Agentic Commerce Track  
> An autonomous multi-modal agent that analyzes digital footprints, synthesizes Zero-Form KYC, calculates risk indices, and formulates hyper-targeted Razorpay product recommendations in real-time.

---

## 🌟 Executive Overview

Traditional merchant onboarding suffers from lengthy form-filling, high abandonment rates, and generic one-size-fits-all payment setups.

**RazorPulse** revolutionizes this flow by acting as an autonomous commerce agent:
1. **Input**: Accepts a merchant's website URL or social handle.
2. **Digital Footprint Scraping**: Extracts metadata, open graph tags, checkout signatures, terms, and tax identifiers with built-in failure recovery.
3. **Agentic Multi-Modal Analysis**: Employs LangChain + Groq (Llama 3.3 70B Versatile) to classify business categories, calculate algorithmic underwriting risk scores (0–100), and extract CIN/GSTIN clues.
4. **Targeted Product Suite Matching**: Recommends high-impact Razorpay products (Magic Checkout, Subscriptions & AutoPay, Payment Gateway, Invoicing, Capital) with ROI projections and conversion lift metrics.
5. **Real-Time SSE Streaming**: Delivers live reasoning steps straight to an executive glassmorphic dashboard via Server-Sent Events.

---

## 🏗️ Architecture & Tech Stack

```
razorpulse-agent/
├── backend/
│   ├── main.py             # FastAPI server with SSE streaming endpoints & CORS
│   ├── agent.py            # LangChain + Groq agentic synthesis & bounded logic
│   ├── scraper.py          # HTTPX + BeautifulSoup scraper with graceful fallback
│   ├── database.py         # SQLAlchemy async engine, SQLite, AuditLog & MerchantSession
│   ├── schemas.py          # Pydantic validation schemas (MerchantAnalysis, KYCData)
│   ├── config.py           # Pydantic Settings & environment variables
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Backend environment configuration
└── frontend/
    ├── app/
    │   ├── page.tsx        # Hero landing console with 1-click preset demos
    │   ├── layout.tsx      # Root layout with dark mode & Inter font
    │   ├── globals.css     # Tailwind utilities & fintech color palette
    │   └── dashboard/
    │       └── page.tsx    # Live SSE execution dashboard & analytics suite
    ├── components/
    │   ├── Navbar.tsx      # Glassmorphic navbar with live agent engine status
    │   ├── ScraperProgress.tsx # 3-step animated execution pipeline timeline
    │   ├── KycForm.tsx     # Zero-Form KYC auto-filled extraction viewer
    │   ├── ProductRecommendationCard.tsx # Targeted product suite cards with ROI & CTAs
    │   ├── AuditTrailViewer.tsx # Full JSON audit trace inspector
    │   └── ui/             # Tailwind glassmorphic design system (Tabs, Card, Badge, Input, Button)
    ├── lib/
    │   ├── api.ts          # EventSource client & REST API bindings
    │   └── utils.ts        # Class merging utilities (clsx + tailwind-merge)
    ├── .env.local          # Frontend environment configuration
    └── package.json        # Dependencies & scripts
```

### 💻 Technologies Used
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: FastAPI, Uvicorn, Python 3.11+, SSE-Starlette, Async SQLAlchemy, SQLite (aiosqlite)
- **AI & LLM**: LangChain, Groq API (`llama-3.3-70b-versatile`), Pydantic v2
- **Scraping**: HTTPX (async), BeautifulSoup4

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.0 or higher
- **Python** 3.10 or higher
- **Git**

---

### 2. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd razorpulse-agent\backend
   ```

2. (Recommended) Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install the required Python dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure your environment variables in `backend/.env`:
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_key_here
   DATABASE_URL=sqlite+aiosqlite:///./razorpulse.db
   ```
   > **Note**: If you do not have a Groq key, keep `GROQ_API_KEY=mock-groq-key`. The engine will automatically activate the **Synthetic Fallback Mode**, allowing you to test and demo the complete UI and pipeline without an API key!

5. Run the backend server:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
   - API will be accessible at: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```powershell
   cd razorpulse-agent\frontend
   ```

2. Install Node dependencies:
   ```powershell
   npm install
   ```

3. Ensure `frontend/.env.local` points to your backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Start the Next.js development server:
   ```powershell
   npm run dev
   ```
   - Access the web interface at: `http://localhost:3000`

---

## 🎯 Quick Preset Demo Scenarios

On the landing page (`http://localhost:3000`), click any of the 4 quick preset buttons to test specific agent behaviors:

| Preset Scenario | Target Profile | Recommended Products & Logic |
| :--- | :--- | :--- |
| **Fashion D2C Brand** | High cart dropouts, Shopify store | **Razorpay Magic Checkout** (+25% conversion lift), address pre-fill |
| **B2B SaaS Startup** | Recurring subscriptions, custom stack | **Razorpay Subscriptions & AutoPay**, Invoicing & Smart Collect |
| **Niche Artisan Store** | Instagram/social seller, no cart | **Payment Links**, **Payment Pages**, instant UPI checkout |
| **Broken / Invalid Store** | Unreachable domain or network timeout | **Failure Recovery Mode**: Graceful synthetic synthesis & audit recovery |

---

## ⚡ Core Features & Dashboard Capabilities

1. **Live Autonomous Agent Execution**
   - Real-time Server-Sent Events (SSE) streaming reasoning steps directly to the frontend.
   - 3-step animated progress cards with step indicators, pulsating loaders, and completion banners.
   - One-click **Re-run Agent** button.

2. **Executive Overview Tab**
   - **4 Metric Cards**: Merchant Entity, Checkout Tech, Basket Value (AOV), and Underwriting Risk Score (0–100).
   - **Interactive ROI Bar Chart**: Simulated conversion lift percentage vs. annual revenue saved (₹ in Lakhs) per Razorpay product.

3. **Zero-Form KYC Tab**
   - Auto-extracts legal registered name, GSTIN clues, and compliance doc presence (Privacy Policy, Terms of Service) directly from the footer and meta tags.
   - Verified status badges with legal validation indicators.

4. **Agentic Decision & Audit Trail Tab**
   - Complete transparency log with timestamps and JSON payload inspectors for every agent reasoning step and tool call.

5. **Failure Recovery Tab**
   - Dedicated fallback state monitor explaining how the system recovers from broken URLs, network timeouts, or rate limits without crashing.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analyze/stream?url=<url>` | SSE stream returning real-time progress steps and final payload |
| `GET` | `/api/results/{url}` | Fetches stored merchant analysis from SQLite |
| `GET` | `/api/audit/{url}` | Fetches complete execution audit trail for a given URL |
| `GET` | `/docs` | OpenAPI / Swagger interactive documentation |

---

## 🛡️ License

Built for the **Razorpay Buildathon 2026**. Distributed under the MIT License.
