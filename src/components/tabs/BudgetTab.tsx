import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusIcon, TrashIcon } from '../Icons'
import { useFestivals, uuid } from '../../contexts/FestivalsContext'
import { totalBudget } from '../../lib/festival'
import { formatMoney, formatDay } from '../../lib/format'
import type { BudgetCategory, Festival } from '../../lib/types'

const CATEGORIES: BudgetCategory[] = ['tickets', 'accommodation', 'transport', 'food', 'merch', 'misc']

const CAT_COLOR: Record<BudgetCategory, string> = {
  tickets: '#ef4444',
  accommodation: '#8b5cf6',
  transport: '#3b82f6',
  food: '#22c55e',
  merch: '#f59e0b',
  misc: '#6b7280',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function BudgetTab({ festival }: { festival: Festival }) {
  const { t, i18n } = useTranslation()
  const { updateFestival } = useFestivals()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BudgetCategory>('tickets')
  const [date, setDate] = useState(todayISO())

  const spent = totalBudget(festival)
  const target = festival.budgetTarget
  const pct = target ? Math.min(100, Math.round((spent / target) * 100)) : 0
  const over = target ? spent - target : 0

  const byCategory = useMemo(() => {
    const totals = new Map<BudgetCategory, number>()
    for (const e of festival.budget) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
    }
    return CATEGORIES.map((c) => ({ category: c, amount: totals.get(c) ?? 0 })).filter((c) => c.amount > 0)
  }, [festival.budget])

  const sortedEntries = useMemo(
    () => [...festival.budget].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [festival.budget],
  )

  function add() {
    const value = parseFloat(amount.replace(',', '.'))
    if (!label.trim() || !Number.isFinite(value) || value <= 0) return
    updateFestival(festival.id, (f) => ({
      ...f,
      budget: [...f.budget, { id: uuid(), label: label.trim(), amount: value, category, date }],
    }))
    setLabel('')
    setAmount('')
  }

  function remove(entryId: string) {
    updateFestival(festival.id, (f) => ({ ...f, budget: f.budget.filter((e) => e.id !== entryId) }))
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Total */}
      <div className="rounded-2xl border border-border bg-surface-card p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{t('budget.total')}</p>
        <p className="pass-heading mt-1 text-4xl text-accent">{formatMoney(spent, i18n.language)}</p>
        {target ? (
          <>
            <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: over > 0 ? '#ef4444' : 'var(--color-accent)' }}
              />
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {over > 0
                ? t('budget.over', { amount: formatMoney(over, i18n.language) })
                : t('budget.remaining', {
                    amount: formatMoney(target - spent, i18n.language),
                    target: formatMoney(target, i18n.language),
                  })}
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-text-muted">{t('budget.noTarget')}</p>
        )}
      </div>

      {/* Breakdown */}
      {byCategory.length > 0 && (
        <div>
          <h3 className="pass-heading mb-2 text-xs tracking-widest text-text-muted">{t('budget.breakdown')}</h3>
          <div className="space-y-2.5 rounded-2xl border border-border bg-surface-card p-4">
            {byCategory.map(({ category: c, amount: a }) => (
              <div key={c}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT_COLOR[c] }} />
                    {t(`budget.cat.${c}`)}
                  </span>
                  <span className="font-semibold tabular-nums text-text-primary">{formatMoney(a, i18n.language)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                  <div className="h-full rounded-full" style={{ width: `${(a / spent) * 100}%`, background: CAT_COLOR[c] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add entry */}
      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <h3 className="pass-heading mb-3 text-xs tracking-widest text-text-muted">{t('budget.addEntry')}</h3>
        <div className="space-y-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('budget.label')}
            className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-3 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('budget.amount')}
              inputMode="decimal"
              className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-3 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-3 text-base text-text-primary outline-none focus:border-accent/60"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                  category === c ? 'text-white' : 'border border-border text-text-muted'
                }`}
                style={category === c ? { background: CAT_COLOR[c] } : undefined}
              >
                {t(`budget.cat.${c}`)}
              </button>
            ))}
          </div>
          <button
            onClick={add}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold uppercase tracking-wider text-on-accent"
          >
            <PlusIcon size={16} />
            {t('common.add')}
          </button>
        </div>
      </div>

      {/* Entries */}
      {sortedEntries.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card divide-y divide-border">
          {sortedEntries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3.5">
              <span className="h-8 w-1 rounded-full" style={{ background: CAT_COLOR[e.category] }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{e.label}</p>
                <p className="text-[11px] text-text-muted">
                  {t(`budget.cat.${e.category}`)}
                  {e.date ? ` · ${formatDay(e.date, i18n.language)}` : ''}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-text-primary">{formatMoney(e.amount, i18n.language)}</span>
              <button onClick={() => remove(e.id)} className="p-1 text-text-muted hover:text-red-400">
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-text-muted">{t('budget.empty')}</p>
      )}
    </div>
  )
}
