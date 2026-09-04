import { MerchantAnalysis } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShieldCheck, Zap } from "lucide-react";

export function ProductRecommendationCard({ data }: { data: MerchantAnalysis }) {
  const recs = data.recommended_products;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#0052FF]/15 via-[#0C2340]/60 to-[#02042B] rounded-2xl border border-[#0052FF]/30 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#0052FF]/20 rounded-xl border border-[#0052FF]/40">
            <ShieldCheck className="h-7 w-7 text-[#00D4FF]" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Autonomous Decision Engine</div>
            <div className="text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
              Targeted Razorpay Product Stack
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Risk Benchmark:</span>
          {data.risk_score < 20 ? (
            <Badge className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 px-3 py-1 font-semibold">Low Risk Underwriting</Badge>
          ) : data.risk_score < 50 ? (
            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-3 py-1 font-semibold">Moderate Review</Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 font-semibold">High Scrutiny</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recs.map((rec, i) => (
          <Card key={i} className="bg-gradient-to-b from-[#0C2340]/90 to-[#07172C]/90 border-[#0052FF]/30 hover:border-[#0052FF]/70 relative overflow-hidden flex flex-col justify-between shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all group">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#0052FF] to-[#00D4FF] text-white text-[11px] px-3.5 py-1 font-bold rounded-bl-xl shadow-md">
              {rec.confidence_score}% Agent Confidence
            </div>
            
            <div>
              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-white text-xl flex items-center gap-2 group-hover:text-[#00D4FF] transition-colors">
                  <div className="p-1.5 rounded-lg bg-[#0052FF]/20 text-[#0052FF]">
                    <Zap className="h-5 w-5 text-[#00D4FF]" />
                  </div>
                  {rec.product_name}
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm mt-2 leading-relaxed">
                  {rec.rationale}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#02042B]/70 border border-white/5 mt-2">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Est. Conversion Lift</div>
                    <div className="text-2xl font-black text-[#10B981] flex items-center gap-1">
                      <TrendingUp className="h-5 w-5" /> +{rec.estimated_conversion_lift_percent}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Annual Revenue Saved</div>
                    <div className="text-2xl font-black text-white">
                      ₹{rec.annual_saved_revenue_inr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            <CardFooter className="pt-4 pb-5">
              <Button className="w-full bg-gradient-to-r from-[#0052FF] to-[#0040CC] hover:from-[#1E6BFF] hover:to-[#0052FF] text-white font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(0,82,255,0.4)] transition-all">
                Activate {rec.product_name.replace("Razorpay ", "")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
