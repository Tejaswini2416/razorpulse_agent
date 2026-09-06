import { motion } from "framer-motion";
import { CheckCircle2, LoaderCircle } from "lucide-react";

export type ProgressStep = { label: string; done: boolean; current: boolean };

export function ScraperProgress({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      {steps.map((step, index) => (
        <div key={`${step.label}-${index}`} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : step.current ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: "linear" }}
              >
                <LoaderCircle className="h-4 w-4 text-blue-400" />
              </motion.div>
            ) : (
              <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            )}
          </div>
          <p className={`text-sm ${step.current ? "text-blue-200" : step.done ? "text-green-300" : "text-slate-400"}`}>
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}
