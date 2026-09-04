import Link from "next/link";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#02042B]/85 backdrop-blur-xl px-6 py-3.5 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#00D4FF] shadow-[0_0_20px_rgba(0,82,255,0.6)] group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Razor<span className="bg-gradient-to-r from-[#0052FF] to-[#00D4FF] bg-clip-text text-transparent">Pulse</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Agent Engine Online
          </div>
          <Link href="/" className="text-slate-300 hover:text-white transition-colors text-xs sm:text-sm font-medium">New Scan</Link>
          <a href="https://razorpay.com" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors text-xs sm:text-sm font-medium">Razorpay Docs</a>
        </div>
      </div>
    </nav>
  );
}
