# ⚡ RazorPulse Agent

> **Autonomous Merchant Intelligence, Zero-Form KYC Prefill & Real-Time Product Recommendation System** powered by Groq LPU (`llama-3.3-70b-versatile`), FastAPI, and Next.js.
link: https://razorpulse-agent.vercel.app/
---

## 🌟 Overview

RazorPulse Agent streamlines merchant onboarding by transforming simple URLs or digital handles into structured merchant intelligence profiles:
- 🔍 **Digital Footprint & Cart Scraper**: Extracts metadata, cart platforms (Shopify/WooCommerce/Custom), brand assets, and estimated AOV.
- ⚡ **Groq LPU Intelligence**: Classifies business model cohorts, risk scoring, and growth levers with explainable guardrails.
- 📋 **Zero-Form KYC Prefill**: Synthesizes verified legal name, GSTIN, contact details, and compliance checklist.
- 🎯 **Razorpay Stack Matchmaking**: Bounded product recommendations with projected ROI and annual saved revenue uplift.
- 📡 **Real-Time SSE Streaming**: Live step-by-step pipeline execution streamed directly to the Next.js frontend.
- 🛡️ **Audit Trail Persistence**: Transactional logging of all decision traces in SQLite/PostgreSQL.

---

## 🏗️ Architecture

```
razorpulse-agent/
├── backend/                  # FastAPI Application
│   ├── agent.py              # Groq LLM Agent & fallback classification engine
│   ├── config.py             # App configuration & settings (Pydantic Settings)
│   ├── database.py           # Async SQLAlchemy SQLite / PostgreSQL audit logs
│   ├── main.py               # REST & SSE endpoints (/analyze, /sessions, /audit)
│   ├── schemas.py            # Pydantic data schemas & validation models
│   ├── scraper.py            # Web & social signal scraper
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js 15 App Router Frontend
│   ├── app/
│   │   ├── dashboard/        # Merchant intelligence & audit dashboard
│   │   ├── globals.css       # Global Tailwind styles & dark mode
│   │   ├── layout.tsx        # App layout with navigation
│   │   └── page.tsx          # Merchant console & live analysis trigger
│   ├── components/           # Reusable UI components
│   │   ├── AuditTrailViewer.tsx
│   │   ├── KycForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductRecommendationCard.tsx
│   │   └── ScraperProgress.tsx
│   ├── lib/
│   │   └── api.ts            # API client with SSE async generator & fetch helpers
│   └── package.json          # Node dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Groq API Key (optional for live LLM mode, built-in fallback heuristic available)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Python 3.11)
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and insert your GROQ_API_KEY

# Start backend server
uvicorn main:app --reload --port 8000
```

> **Backend runs on:** `http://localhost:8000`  
> **API Documentation:** `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

> **Frontend runs on:** `http://localhost:3000`

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `POST` | `/analyze` | SSE stream analyzing merchant URL / handle |
| `GET` | `/sessions` | List recent analysis sessions |
| `GET` | `/audit/{session_id}` | Retrieve complete audit trail for a session |

---

## 🛡️ Resilience & Guardrails

- **Groq API Fallbacks**: Graceful fallback to deterministic pattern-based heuristics if API rate limits (HTTP 429) or connection issues occur.
- **Fail-Safe Scraping**: Domain heuristics and TLD-level feature extraction if merchant sites block bot traffic.
- **Explainability**: Every product recommendation comes with explicit explainability vectors and bounded risk levels.

---
## 📄 License

MIT
