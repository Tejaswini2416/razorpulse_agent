# RazorPulse — Full-Stack Setup Guide

## Project Structure
```
razorpulse-agent/
├── backend/
│   ├── .env                # Add your GROQ_API_KEY here
│   ├── requirements.txt
│   ├── __init__.py
│   ├── config.py
│   ├── schemas.py
│   ├── database.py
│   ├── scraper.py
│   ├── agent.py
│   └── main.py
└── frontend/
    ├── .env.local
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── dashboard/page.tsx
    ├── components/
    │   ├── Navbar.tsx
    │   ├── ScraperProgress.tsx
    │   ├── KycForm.tsx
    │   ├── ProductRecommendationCard.tsx
    │   └── AuditTrailViewer.tsx
    └── lib/api.ts
```

## Step 1: Configure Backend
Edit `backend/.env` and set your Groq API key:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

## Step 2: Run the Backend (Terminal 1)
```powershell
cd razorpulse-agent\backend
# Activate virtual env if using one
uvicorn main:app --reload --port 8000
```

## Step 3: Run the Frontend (Terminal 2)
```powershell
cd razorpulse-agent\frontend
npm run dev
```

## Step 4: Open in Browser
Visit: http://localhost:3000

## Features
- **Landing Page** — Input console with preset demo buttons
- **Agentic Pipeline** — Real-time SSE streaming progress
- **Overview Tab** — Executive summary, ROI bar chart, product recommendations
- **Zero-Form KYC Tab** — Auto-populated form with verified/inferred badges
- **Agentic Decision Tab** — Raw audit logs with JSON inspector
- **Failure Recovery Tab** — Fallback state viewer for broken URLs

## Mock Mode
If no Groq API key is set (default `mock-groq-key`), the system automatically
returns synthetic analysis data so you can demo the full UI without an API key.

## API Endpoints
- `GET /api/analyze/stream?url=<url>` — SSE stream for live analysis
- `GET /api/results/<url>` — Fetch persisted analysis result
- `GET /api/audit/<url>` — Fetch full audit trail
- `GET /docs` — FastAPI interactive docs
