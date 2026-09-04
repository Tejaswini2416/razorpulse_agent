"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScraperStatus, MerchantAnalysis, analyzeMerchantStream, fetchResults } from "@/lib/api";
import { ScraperProgress } from "@/components/ScraperProgress";
import { KycForm } from "@/components/KycForm";
import { ProductRecommendationCard } from "@/components/ProductRecommendationCard";
import { AuditTrailViewer } from "@/components/AuditTrailViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  ArrowLeft, Building2, ShoppingCart, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Shield, RefreshCw
} from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") || "";

  const [statuses, setStatuses] = useState<ScraperStatus[]>([
    { step: "Initializing", status: "pending", message: "Awaiting pipeline start..." },
    { step: "Scraping", status: "pending", message: "Awaiting digital footprint extraction..." },
    { step: "Agentic Analysis", status: "pending", message: "Awaiting multi-modal analysis..." },
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysis, setAnalysis] = useState<MerchantAnalysis | null>(null);
  const [scraperData, setScraperData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!url) return;

    const cleanup = analyzeMerchantStream(
      url,
      (status) => {
        setStatuses((prev) => {
          const next = [...prev];
          const idx = next.findIndex((s) => s.step === status.step);
          if (idx >= 0) {
            next[idx] = status;
          } else {
            next.push(status);
          }
          // Update previous steps to completed if a newer one starts
          if (status.status === "running") {
            for (let i = 0; i < idx; i++) {
              if (next[i].status === "pending") {
                next[i] = { ...next[i], status: "completed" };
              }
            }
          }
          if (status.step === "Scraping" && status.status === "completed" && status.data) {
            setScraperData(status.data);
          }
          if (status.step === "Agentic Analysis" && status.status === "completed" && status.data) {
            setAnalysis(status.data as unknown as MerchantAnalysis);
          }
          return next;
        });
      },
      async () => {
        setIsComplete(true);
        // Fetch full results if not set from SSE
        try {
          const result = await fetchResults(url);
          setAnalysis(result);
        } catch {
          // analysis already set via SSE status event
        }
      },
      (err) => {
        setIsError(true);
        setErrorMessage(err);
        setStatuses((prev) =>
          prev.map((s) =>
            s.status === "running" ? { ...s, status: "failed", message: err } : s
          )
        );
      }
    );

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const chartData = analysis?.recommended_products.map((p) => ({
    name: p.product_name.replace("Razorpay ", ""),
    lift: p.estimated_conversion_lift_percent,
    revenue: p.annual_saved_revenue_inr / 100000,
    confidence: p.confidence_score,
  })) || [];


  return (
    <div className="min-h-screen bg-[#02042B] text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#071d3a] via-[#02042B] to-[#010214]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Console
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Merchant Intelligence <span className="bg-gradient-to-r from-[#0052FF] to-[#00D4FF] bg-clip-text text-transparent">Engine</span>
              </h1>
              <p className="text-slate-400 text-sm font-mono truncate max-w-lg mt-0.5">{url}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isComplete && (
              <Badge className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 px-3.5 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] rounded-full text-xs font-semibold">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Pipeline Complete
              </Badge>
            )}
            {isError && !isComplete && (
              <Badge className="bg-red-500/15 text-red-400 border border-red-500/40 px-3.5 py-1.5 shadow-[0_0_15px_rgba(239,68,68,0.25)] rounded-full text-xs font-semibold">
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Fallback Mode Active
              </Badge>
            )}
          </div>
        </div>

        {/* Live Pipeline Execution */}
        <Card className="border-[#0052FF]/30 bg-[#07172C]/85 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isComplete ? "bg-[#10B981]" : "bg-[#0052FF] animate-ping"}`} />
                  Live Autonomous Agent Execution
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-0.5">
                  Real-time multi-modal footprint synthesis & compliance verification
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsComplete(false);
                  setIsError(false);
                  setErrorMessage("");
                  setAnalysis(null);
                  setStatuses([
                    { step: "Initializing", status: "running", message: "Starting evaluation pipeline..." },
                    { step: "Scraping", status: "pending", message: "Awaiting digital footprint extraction..." },
                    { step: "Agentic Analysis", status: "pending", message: "Awaiting multi-modal analysis..." },
                  ]);
                  window.location.reload();
                }}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-run Agent
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ScraperProgress statuses={statuses} isComplete={isComplete} />
          </CardContent>
        </Card>

        {/* Main Tabs — only show after analysis */}
        {(isComplete || analysis) && analysis && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#07172C]/90 p-1.5 border border-[#0052FF]/30 rounded-xl">
              <TabsTrigger value="overview">Executive Overview</TabsTrigger>
              <TabsTrigger value="kyc">Zero-Form KYC</TabsTrigger>
              <TabsTrigger value="audit">Agentic Decision</TabsTrigger>
              <TabsTrigger value="recovery">Failure Recovery</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-b from-[#0C2340]/90 to-[#07172C]/90 border-[#0052FF]/30 hover:border-[#0052FF]/60 hover:shadow-[0_0_25px_rgba(0,82,255,0.2)] transition-all">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#0052FF]" /> Merchant Entity
                      </span>
                      <Badge variant="outline" className="text-[#00D4FF] border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[10px]">
                        {analysis.detected_category}
                      </Badge>
                    </div>
                    <div className="text-white font-extrabold text-xl tracking-tight truncate">{analysis.business_name}</div>
                    <div className="text-slate-400 text-xs">Identified via Meta Graph & Footer</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-b from-[#0C2340]/90 to-[#07172C]/90 border-[#0052FF]/30 hover:border-[#0052FF]/60 hover:shadow-[0_0_25px_rgba(0,82,255,0.2)] transition-all">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-[#0052FF]" /> Checkout Tech
                      </span>
                      <Badge variant="outline" className="text-purple-400 border-purple-400/40 bg-purple-400/10 text-[10px]">
                        {analysis.cart_type}
                      </Badge>
                    </div>
                    <div className="text-white font-extrabold text-xl tracking-tight">{analysis.cart_type}</div>
                    <div className="text-slate-400 text-xs">Cart platform stack signature</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-b from-[#0C2340]/90 to-[#07172C]/90 border-[#0052FF]/30 hover:border-[#0052FF]/60 hover:shadow-[0_0_25px_rgba(0,82,255,0.2)] transition-all">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" /> Basket Value (AOV)
                      </span>
                      <Badge variant="outline" className="text-[#10B981] border-[#10B981]/40 bg-[#10B981]/10 text-[10px]">
                        Live Projection
                      </Badge>
                    </div>
                    <div className="text-white font-extrabold text-xl tracking-tight">₹{analysis.estimated_aov.toLocaleString("en-IN")}</div>
                    <div className="text-slate-400 text-xs">Estimated order value index</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-b from-[#0C2340]/90 to-[#07172C]/90 border-[#0052FF]/30 hover:border-[#0052FF]/60 hover:shadow-[0_0_25px_rgba(0,82,255,0.2)] transition-all">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-blue-400" /> Underwriting Risk
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          analysis.risk_score < 20
                            ? "text-[#10B981] border-[#10B981]/40 bg-[#10B981]/10"
                            : analysis.risk_score < 50
                            ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
                            : "text-red-400 border-red-400/40 bg-red-400/10"
                        }`}
                      >
                        {analysis.risk_score < 20 ? "Low Risk" : analysis.risk_score < 50 ? "Moderate" : "High Risk"}
                      </Badge>
                    </div>
                    <div className={`font-extrabold text-xl tracking-tight ${analysis.risk_score < 20 ? "text-[#10B981]" : analysis.risk_score < 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {analysis.risk_score} <span className="text-slate-500 text-sm font-normal">/ 100</span>
                    </div>
                    <div className="text-slate-400 text-xs">Instant algorithmic risk score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {/* Charts */}
              <Card className="border-[#0052FF]/30 bg-gradient-to-br from-[#0C2340]/90 via-[#07172C]/90 to-[#02042B]/90 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#0052FF]" /> Razorpay Product ROI Projection
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs">
                        Simulated conversion lift % vs. estimated annual incremental revenue (₹ in Lakhs)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-sm bg-[#0052FF]" /> Lift %
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" /> Revenue Saved (₹L)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#07172C", border: "1px solid rgba(0,82,255,0.5)", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.8)" }}
                          labelStyle={{ color: "#fff", fontWeight: "bold" }}
                          itemStyle={{ color: "#10B981", fontSize: 12 }}
                        />
                        <Bar dataKey="lift" fill="#0052FF" name="Conversion Lift %" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="revenue" fill="#10B981" name="Revenue Saved (₹L)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Product Recommendations */}
              <ProductRecommendationCard data={analysis} />
            </TabsContent>

            {/* KYC TAB */}
            <TabsContent value="kyc" className="mt-6">
              <KycForm data={analysis} />
            </TabsContent>

            {/* AUDIT TAB */}
            <TabsContent value="audit" className="mt-6">
              <AuditTrailViewer url={url} />
            </TabsContent>

            {/* FAILURE RECOVERY TAB */}
            <TabsContent value="recovery" className="mt-6">
              <Card className="bg-[#0C2340]/80 border-[#0052FF]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-yellow-400" /> Failure Recovery & Fallback Log
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Dedicated view showing how the system handles broken URLs, rate-limits, and scraper failures.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {scraperData?.is_fallback ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-yellow-400">Scraper Fallback Activated</div>
                          <div className="text-sm text-slate-300 mt-1">
                            The original URL could not be fetched. The system automatically switched to synthetic fallback mode to ensure analysis continuity.
                          </div>
                          {scraperData?.error && (
                            <pre className="mt-3 p-3 bg-[#010216] text-red-400 text-xs rounded-md overflow-x-auto">
                              {scraperData.error}
                            </pre>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg space-y-2">
                        <div className="font-semibold text-[#10B981] flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Fallback Resolution
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                          <li>Identified URL pattern and keyword signals from the URL path.</li>
                          <li>Generated synthetic merchant profile using keyword-rule fallback engine.</li>
                          <li>Ran Agentic Analysis on synthetic data with reduced confidence scores.</li>
                          <li>All fallback events logged to audit trail for full traceability.</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[#0C2340] rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-2 font-mono">SYNTHETIC FALLBACK DATA:</div>
                        <pre className="text-xs text-[#10B981] overflow-x-auto">
                          {JSON.stringify({ title: scraperData?.title, meta_description: scraperData?.meta_description, is_fallback: true }, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#10B981]">No Failures Detected</div>
                        <div className="text-sm text-slate-300 mt-1">
                          The scraper successfully reached the target URL. No fallback mechanisms were triggered.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pipeline error */}
                  {isError && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-red-400">Pipeline Exception Caught</div>
                        <div className="text-sm text-slate-300 mt-1">
                          A critical error occurred during the agent pipeline. The error has been logged to the audit trail and the system has attempted graceful recovery.
                        </div>
                        <pre className="mt-3 p-3 bg-[#010216] text-red-400 text-xs rounded-md overflow-x-auto">
                          {errorMessage}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#02042B] flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
