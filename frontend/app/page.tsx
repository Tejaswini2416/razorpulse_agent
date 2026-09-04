"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Search, AlertCircle, ShoppingBag, Briefcase, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleEvaluate = (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl) return;
    router.push(`/dashboard?url=${encodeURIComponent(finalUrl)}`);
  };

  const setPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    handleEvaluate(presetUrl);
  };

  return (
    <div className="min-h-screen bg-[#02042B] flex flex-col items-center justify-center p-6 text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b244d] via-[#02042B] to-[#010214]">
      <div className="w-full max-w-3xl space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0052FF]/15 border border-[#0052FF]/40 rounded-full shadow-[0_0_20px_rgba(0,82,255,0.3)] mb-2">
            <Zap className="h-4 w-4 text-[#00D4FF]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Next-Gen Agentic Commerce</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl text-white">
            Razor<span className="bg-gradient-to-r from-[#0052FF] to-[#00D4FF] bg-clip-text text-transparent">Pulse</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Autonomous context-aware merchant onboarding, instant zero-form KYC synthesis, and tailored Razorpay product intelligence.
          </p>
        </div>

        <Card className="bg-[#07172C]/85 border-[#0052FF]/30 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.7)]">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Evaluate Merchant</CardTitle>
            <CardDescription className="text-slate-400">
              Enter a website URL or social handle to begin the agentic multi-modal analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleEvaluate(); }} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="https://mybrand.com or @instagram_handle"
                  className="pl-10 h-12 bg-[#02042B] border-slate-700 text-white focus-visible:ring-[#0052FF]"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 bg-[#0052FF] hover:bg-[#0052FF]/80 text-white font-semibold px-8">
                Run Agent
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm font-medium text-slate-400">Quick Preset Demos:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 bg-[#02042B]/50 border-slate-700 hover:bg-[#0C2340] hover:text-white text-slate-300"
                  onClick={() => setPreset("https://fashion-d2c-demo.com")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4 text-[#10B981]" />
                  <div className="text-left">
                    <div className="font-semibold">Fashion D2C Brand</div>
                    <div className="text-xs text-slate-500">High Cart Drops</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 bg-[#02042B]/50 border-slate-700 hover:bg-[#0C2340] hover:text-white text-slate-300"
                  onClick={() => setPreset("https://b2b-saas-startup.com")}
                >
                  <Briefcase className="mr-2 h-4 w-4 text-[#0052FF]" />
                  <div className="text-left">
                    <div className="font-semibold">B2B SaaS Startup</div>
                    <div className="text-xs text-slate-500">Recurring Invoices</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 bg-[#02042B]/50 border-slate-700 hover:bg-[#0C2340] hover:text-white text-slate-300"
                  onClick={() => setPreset("https://instagram.com/niche_artisan")}
                >
                  <Share2 className="mr-2 h-4 w-4 text-pink-500" />
                  <div className="text-left">
                    <div className="font-semibold">Niche Artisan Store</div>
                    <div className="text-xs text-slate-500">Social / Payment Links</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 bg-[#02042B]/50 border-slate-700 hover:bg-[#0C2340] hover:text-white text-slate-300"
                  onClick={() => setPreset("https://broken-invalid-store.com")}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  <div className="text-left">
                    <div className="font-semibold">Broken / Invalid Store</div>
                    <div className="text-xs text-slate-500">Failure Recovery Mode</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
