import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { ScraperStatus } from "@/lib/api";

export function ScraperProgress({
  statuses,
  isComplete
}: {
  statuses: ScraperStatus[];
  isComplete: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statuses.map((status, index) => {
          const isFinished = status.status === "completed";
          const isCurrent = status.status === "running";
          const isErr = status.status === "failed";

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                isFinished
                  ? "bg-[#10B981]/10 border-[#10B981]/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : isCurrent
                  ? "bg-[#0052FF]/15 border-[#0052FF]/60 shadow-[0_0_25px_rgba(0,82,255,0.3)] ring-1 ring-[#0052FF]"
                  : isErr
                  ? "bg-red-500/10 border-red-500/40"
                  : "bg-[#02042B]/60 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Step 0{index + 1}
                </span>
                <div>
                  {isFinished ? (
                    <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  ) : isErr ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#00D4FF]" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-600" />
                  )}
                </div>
              </div>
              <div className="font-bold text-white text-sm tracking-tight">{status.step}</div>
              <div className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {status.message}
              </div>
            </div>
          );
        })}
      </div>

      {isComplete && (
        <div className="flex items-center justify-between p-3.5 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl mt-4 text-[#10B981]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
            <div>
              <div className="font-bold text-sm text-white">Full Digital Footprint Synthesized</div>
              <div className="text-xs text-slate-300">All classification models, KYC heuristics, and Razorpay product mappings complete.</div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#10B981]/20 rounded-full border border-[#10B981]/40">
            Ready for Merchant Review
          </span>
        </div>
      )}
    </div>
  );
}
