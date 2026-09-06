import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "RazorPulse",
  description: "Autonomous Context-Aware Merchant Onboarding & Agentic Commerce Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#02042B] text-white">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
