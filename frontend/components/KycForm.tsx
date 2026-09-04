import { MerchantAnalysis } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function KycForm({ data }: { data: MerchantAnalysis }) {
  return (
    <Card className="bg-gradient-to-b from-[#0C2340]/90 to-[#07172C]/90 border-[#0052FF]/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#10B981]" /> Zero-Form Autonomous KYC Extraction
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              Data points extracted and legally cross-referenced directly from the merchant digital footprint.
            </CardDescription>
          </div>
          <Badge className="bg-[#0052FF]/20 text-[#00D4FF] border border-[#0052FF]/40 px-3 py-1 text-xs">
            Auto-Prefilled
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Registered Legal Business Name</Label>
            <div className="relative">
              <Input 
                value={data.kyc_prefill_data.registered_name || ""} 
                readOnly 
                className="bg-[#02042B] border-[#0052FF]/30 text-white pl-4 pr-10 h-11 rounded-xl font-medium focus-visible:ring-[#0052FF]"
              />
              {data.kyc_prefill_data.registered_name ? (
                <CheckCircle2 className="absolute right-3.5 top-3 h-5 w-5 text-[#10B981]" />
              ) : (
                <AlertTriangle className="absolute right-3.5 top-3 h-5 w-5 text-yellow-500" />
              )}
            </div>
            {!data.kyc_prefill_data.registered_name ? (
              <p className="text-xs text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Inferred: No explicit CIN/Name discovered on homepage.
              </p>
            ) : (
              <p className="text-xs text-[#10B981] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified against terms and company filings.
              </p>
            )}
          </div>
          
          <div className="space-y-2.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">GSTIN Clues / Detected Tax ID</Label>
            <div className="relative">
              <Input 
                value={data.kyc_prefill_data.gstin_clue || "Pending Verification"} 
                readOnly 
                className="bg-[#02042B] border-[#0052FF]/30 text-white pl-4 pr-10 h-11 rounded-xl font-medium focus-visible:ring-[#0052FF]"
              />
              {data.kyc_prefill_data.gstin_clue ? (
                <CheckCircle2 className="absolute right-3.5 top-3 h-5 w-5 text-[#10B981]" />
              ) : (
                <AlertTriangle className="absolute right-3.5 top-3 h-5 w-5 text-yellow-500" />
              )}
            </div>
            {data.kyc_prefill_data.gstin_clue ? (
              <p className="text-xs text-[#10B981] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Extracted from checkout invoices & footer policy.
              </p>
            ) : (
              <p className="text-xs text-slate-400">Merchant will provide at final OTP verification step.</p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-5 border-t border-white/5">
          <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Compliance Checklist & Policies Detected</Label>
          <div className="flex flex-wrap gap-2.5 mt-2">
            {data.kyc_prefill_data.compliance_checklist.length > 0 ? (
              data.kyc_prefill_data.compliance_checklist.map((item, idx) => (
                <Badge key={idx} variant="outline" className="bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> {item}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-medium">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> No Compliance Docs Detected
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
