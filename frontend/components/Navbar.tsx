import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-black">
            RP
          </div>
          RazorPulse
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/">Merchant Console</Link>
          <Link href="/dashboard">Insights</Link>
          <Link href="/dashboard">Audit Trail</Link>
        </nav>
      </div>
    </header>
  );
}
