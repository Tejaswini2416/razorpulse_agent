import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RazorPulse — Autonomous Merchant Onboarding Engine",
  description:
    "AI-powered merchant onboarding and agentic commerce engine for Razorpay. Classifies merchants, synthesizes KYC, and recommends the right Razorpay product suite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#02042B] antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
