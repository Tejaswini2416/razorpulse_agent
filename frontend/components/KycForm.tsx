type KycData = {
  legal_name?: string;
  gstin?: string;
  business_email?: string;
  business_phone?: string;
  registered_address?: string;
  compliance_checklist?: string[];
  verification_status?: string;
};

export function KycForm({ kyc }: { kyc: KycData }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Zero-Form KYC Prefill</h3>
        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-300">
          {kyc.verification_status || "inferred"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Legal name</span>
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" defaultValue={kyc.legal_name || ""} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>GSTIN</span>
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" defaultValue={kyc.gstin || ""} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Business email</span>
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" defaultValue={kyc.business_email || ""} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Business phone</span>
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" defaultValue={kyc.business_phone || ""} />
        </label>
        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Registered address</span>
          <textarea className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" defaultValue={kyc.registered_address || ""} rows={3} />
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm text-slate-300">Compliance checklist</p>
        <div className="flex flex-wrap gap-2">
          {(kyc.compliance_checklist || []).map((item) => (
            <span key={item} className="rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
