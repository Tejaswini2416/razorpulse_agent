"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, ArrowRight, BadgeCheck, FileText, RefreshCw, Shield, Sparkles } from "lucide-react";
import { AuditTrailViewer } from "@/components/AuditTrailViewer";
import { KycForm } from "@/components/KycForm";
import { ProductRecommendationCard } from "@/components/ProductRecommendationCard";
import { fetchRecentSessions, fetchAuditEntry } from "@/lib/api";

const demoData = [
  { name: "Cart", value: 76 },
  { name: "KYC", value: 82 },
  { name: "Risk", value: 48 },
  { name: "Upsell", value: 91 },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysis, setAnalysis] = useState<any>(null);
  const [auditTrace, setAuditTrace] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("data");
    const sessionId = params.get("session_id");

    if (raw) {
      try {
        setAnalysis(JSON.parse(raw));
      } catch {
        setAnalysis(null);
      }
    } else if (sessionId) {
      setLoading(true);
      fetchAuditEntry(sessionId)
        .then((entry) => {
          if (entry.analysis) setAnalysis(entry.analysis);
          if (entry.trace) setAuditTrace(entry.trace);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Auto-load most recent completed session from backend
      fetchRecentSessions()
        .then(async (sessions) => {
          if (sessions && sessions.length > 0) {
            const latest = sessions[0];
            const entry = await fetchAuditEntry(latest.session_id);
            if (entry.analysis) setAnalysis(entry.analysis);
            if (entry.trace) setAuditTrace(entry.trace);
          }
        })
        .catch(console.error);
    }
  }, []);


  const summary = useMemo(() => {
    const recs = analysis?.recommendations ?? [];
    const topRec = recs[0] ?? null;
    return {
      business: analysis?.business_name ?? "Velora Studio",
      category: analysis?.detected_category ?? "Fashion & Lifestyle",
      cartType: analysis?.cart_type ?? "Fashion D2C",
      aov: analysis?.estimated_aov ?? 2200,
      risk: analysis?.risk_score ?? 34,
      confidence: analysis?.confidence_score ?? 83,
      topRec,
    };
  }, [analysis]);

  const trace = [
    { event: "scrape", payload: { website: "https://mybrand.com", notes: ["Metadata collected", "Social handles detected"] } },
    { event: "llm_classification", payload: { business_name: summary.business, category: summary.category, cart_type: summary.cartType } },
    { event: "kyc_prefill", payload: { gstin: "GSTIN-VERIFY-REQD", legal_name: summary.business, compliance_checklist: ["PAN validation", "Bank verification"] } },
    { event: "recommendation_matrix", payload: { recommended_product: summary.topRec?.product_name ?? "Razorpay Magic Checkout", roi_projection: summary.topRec?.roi_projection ?? 31.8 } },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">RazorPulse</p>
          <h1 className="mt-2 text-3xl font-black text-white">Merchant Intelligence Dashboard</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2 font-medium text-white">
          Activate Product Suite <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ["Business", summary.business],
          ["Category", summary.category],
          ["Avg. Order", `₹${summary.aov.toLocaleString()}`],
          ["Risk Index", `${summary.risk}/100`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-3 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 flex gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2">
        {[
          ["overview", "Overview"],
          ["kyc", "Zero-Form KYC"],
          ["audit", "Agentic Decision & Audit Trail"],
          ["failure", "Failure Recovery Log"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-xl px-4 py-2 text-sm ${activeTab === key ? "bg-blue-600 text-white" : "text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center gap-2 text-blue-300">
                <BadgeCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Executive Summary</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{summary.business}</h2>
              <p className="mt-3 text-slate-300">
                Classified as a {summary.category.toLowerCase()} merchant with {summary.cartType.toLowerCase()} characteristics. The recommended product suite maximizes conversion while keeping the risk and repayment exposure bounded.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4">
                  <p className="text-xs uppercase text-slate-400">Conversion lift</p>
                  <p className="mt-2 text-2xl font-bold text-green-400">+{summary.topRec?.roi_projection ?? 31.8}%</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4">
                  <p className="text-xs uppercase text-slate-400">Risk Index</p>
                  <p className="mt-2 text-2xl font-bold text-yellow-300">{summary.risk}/100</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center gap-2 text-green-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Brand Visuals</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Brand", "Storefront", "Campaign"].map((tile, idx) => (
                  <div key={tile} className="flex h-28 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-blue-500/20 to-slate-900 text-sm font-semibold text-white">
                    {tile}
                    {idx === 0 ? "" : ""}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Activity className="h-4 w-4 text-blue-300" />
                <span className="text-sm font-medium">Risk & Growth Index</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer>
                  <AreaChart data={demoData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#0052FF" fill="#0052FF" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Shield className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium">Recommended Razorpay Stack</span>
              </div>
              <div className="space-y-4">
                {analysis?.recommendations && analysis.recommendations.length > 0 ? (
                  analysis.recommendations.map((rec: any, idx: number) => (
                    <ProductRecommendationCard key={`${rec.product_name}-${idx}`} recommendation={rec} />
                  ))
                ) : summary.topRec ? (
                  <ProductRecommendationCard recommendation={summary.topRec} />
                ) : (
                  <p className="text-sm text-slate-400">No active recommendations. Run an analysis from the merchant console.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "kyc" && (
        <div>
          <KycForm kyc={analysis?.kyc_prefill_data ?? {}} />
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <FileText className="h-4 w-4 text-blue-300" />
                <span className="text-sm font-medium">LLM & Pipeline Trace</span>
              </div>
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-300">
                {analysis?._latency_ms ? `${analysis._latency_ms}ms latency` : "Trace Active"}
              </span>
            </div>
            <AuditTrailViewer trace={auditTrace.length > 0 ? auditTrace : trace} />
          </div>
        </div>
      )}


      {activeTab === "failure" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Failure Recovery & Fallback Log</span>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <p>• Bad URL detected: system switched to synthetic fallback identity to preserve continuity.</p>
            <p>• Missing terms or rate-limited requests: graceful recovery mode activated after timeout threshold.</p>
            <p>• Groq API constraints: bounded fallback recommendations retained with explicit audit markers.</p>
          </div>
        </div>
      )}
    </main>
  );
}
