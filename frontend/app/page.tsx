"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCheck, Globe, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { analyzeMerchant } from "@/lib/api";
import { ScraperProgress } from "@/components/ScraperProgress";

const presets = [
  { label: "Fashion D2C Brand (High Cart Drops)", value: "Fashion D2C brand with high cart abandonment and checkout friction" },
  { label: "B2B SaaS Startup (Recurring Invoices)", value: "B2B SaaS startup with recurring invoices and subscription billing" },
  { label: "Niche Artisan Store (Instagram-First / Payment Links)", value: "Instagram-first artisan store selling custom products via payment links" },
  { label: "Broken / Invalid Store (To prove Failure Recovery & Fallback Mode)", value: "Broken / invalid store" },
];

const defaultSteps = [
  { label: "Extracting Digital Footprint & Visual Metadata...", done: false, current: true },
  { label: "Classifying Merchant Model via Groq LPU (llama-3.3-70b-versatile)...", done: false, current: false },
  { label: "Synthesizing KYC & GST Metadata...", done: false, current: false },
  { label: "Running Agentic Product Matchmaking Matrix...", done: false, current: false },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState(presets[0].value);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [steps, setSteps] = useState(defaultSteps);

  const handlePreset = (value: string) => {
    setInput(value);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setStatus("Starting merchant intelligence run...");
    setSteps(defaultSteps);
    try {
      const stream = await analyzeMerchant(input);
      let stepIndex = 0;
      const finalStatus: Record<string, unknown> = {};
      for await (const event of stream.events()) {
        if (event.event === "status" && typeof event.step === "number") {
          stepIndex = event.step - 1;
          setStatus(event.message);
          setSteps((prev) =>
            prev.map((step, idx) => ({
              ...step,
              done: idx < stepIndex,
              current: idx === stepIndex,
            }))
          );
        }

        if (event.event === "analysis") {
          finalStatus.analysis = event.payload;
          setStatus("Analysis complete. Redirecting to dashboard...");
          setTimeout(() => {
            router.push(`/dashboard?data=${encodeURIComponent(JSON.stringify(event.payload))}`);
          }, 700);
        }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected failure occurred.");
      setSteps((prev) => prev.map((step, idx) => ({ ...step, done: idx === prev.length - 1, current: false })));
    } finally {
      setLoading(false);
    }
  };

  const stepCount = useMemo(() => steps.filter((step) => step.done).length, [steps]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-glow">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
            <Sparkles className="h-3.5 w-3.5" /> AI Growth & Agentic Commerce Engine
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Autonomous merchant onboarding that turns intent into revenue.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            RazorPulse scans digital footprints, classifies the merchant model, and recommends the highest-ROI Razorpay stack with bounded, explainable guardrails.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-200">Merchant URL or Instagram handle</label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none ring-0 placeholder:text-slate-500"
                placeholder="https://mybrand.com or @mybrand"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Running" : "Analyze Merchant"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.value)}
                className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-blue-500/50 hover:bg-slate-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Execution status</h2>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-300">{stepCount}/4</span>
            </div>
            <p className="mt-3 min-h-[48px] text-sm text-slate-300">{status || "Awaiting merchant input..."}</p>
            <div className="mt-5">
              <ScraperProgress steps={steps} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Bounded Decisioning</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><CheckCheck className="mt-0.5 h-4 w-4 text-green-400" /> Explainable ROI & risk thresholds</li>
              <li className="flex items-start gap-2"><CheckCheck className="mt-0.5 h-4 w-4 text-green-400" /> Auditable LLM traces and JSON schema outputs</li>
              <li className="flex items-start gap-2"><CheckCheck className="mt-0.5 h-4 w-4 text-green-400" /> Graceful fallback when scraping or Groq fails</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 text-green-300">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">Live Data Sources</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">Website scraping, social brand metadata, merchant heuristics, and product-match reasoning stitched together in one decision engine.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
