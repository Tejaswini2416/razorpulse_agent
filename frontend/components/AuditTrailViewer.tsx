type AuditTrailItem = {
  event?: string;
  payload?: Record<string, unknown>;
};

export function AuditTrailViewer({ trace }: { trace: AuditTrailItem[] }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      {trace.map((item, index) => (
        <div key={`${item.event || "log"}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-blue-300">{item.event || "event"}</p>
            <span className="text-xs text-slate-500">#{index + 1}</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-300">
            {JSON.stringify(item.payload ?? item, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
