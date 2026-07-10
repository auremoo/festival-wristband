interface Props {
  label: string
  value: React.ReactNode
  hint?: string
  /** Tint the value in the accent color. */
  accent?: boolean
  icon?: React.ReactNode
}

export default function StatTile({ label, value, hint, accent, icon }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface-card p-4">
      <div className="flex items-center gap-1.5 text-text-muted">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-1.5 text-2xl font-black tabular-nums ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-text-muted">{hint}</p>}
    </div>
  )
}
