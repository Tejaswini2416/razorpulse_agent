type Recommendation = {
  product_name: string;
  category: string;
  match_score: number;
  roi_projection: number;
  annual_saved_revenue: number;
  rationale: string;
  confidence: number;
  explainability: string[];
  guardrails: string[];
  bounded_risk: string;
};

export function ProductRecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-blue-300">{recommendation.category}</p>
          <h3 className="text-xl font-semibold text-white">{recommendation.product_name}</h3>
        </div>
        <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-200">
          {recommendation.match_score}% match
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
          <p className="text-xs uppercase text-slate-400">ROI uplift</p>
          <p className="mt-2 text-2xl font-bold text-green-400">+{recommendation.roi_projection.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
          <p className="text-xs uppercase text-slate-400">Annual saved revenue</p>
          <p className="mt-2 text-xl font-bold text-white">₹{recommendation.annual_saved_revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
          <p className="text-xs uppercase text-slate-400">Bounded risk</p>
          <p className="mt-2 text-xl font-bold text-yellow-300">{recommendation.bounded_risk}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{recommendation.rationale}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Explainability</p>
          <ul className="space-y-1 text-sm text-slate-400">
            {recommendation.explainability.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Guardrails</p>
          <ul className="space-y-1 text-sm text-slate-400">
            {recommendation.guardrails.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
