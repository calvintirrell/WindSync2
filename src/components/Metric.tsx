export default function Metric({ label, value, flag }: { label: string; value: number; flag?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
        {flag && value > 0 && <span className="ml-2 text-base">{flag}</span>}
      </p>
    </div>
  )
}
