import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, PlusIcon, TrashIcon } from '../Icons'
import { useFestivals, uuid } from '../../contexts/FestivalsContext'
import { createChecklist } from '../../data/checklistTemplates'
import type { ChecklistItem, Festival } from '../../lib/types'

const GROUP_ORDER = ['essentials', 'camping', 'comfort', 'transport', 'urban', 'custom']

export default function ChecklistTab({ festival }: { festival: Festival }) {
  const { t } = useTranslation()
  const { updateFestival } = useFestivals()
  const [newItem, setNewItem] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const checked = festival.checklist.filter((c) => c.checked).length
  const total = festival.checklist.length
  const pct = total ? Math.round((checked / total) * 100) : 0

  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>()
    for (const item of festival.checklist) {
      const g = item.group ?? 'custom'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    }
    return [...map.entries()].sort(
      (a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]),
    )
  }, [festival.checklist])

  function toggle(itemId: string) {
    updateFestival(festival.id, (f) => ({
      ...f,
      checklist: f.checklist.map((c) => (c.id === itemId ? { ...c, checked: !c.checked } : c)),
    }))
  }

  function remove(itemId: string) {
    updateFestival(festival.id, (f) => ({
      ...f,
      checklist: f.checklist.filter((c) => c.id !== itemId),
    }))
  }

  function add() {
    const label = newItem.trim()
    if (!label) return
    updateFestival(festival.id, (f) => ({
      ...f,
      checklist: [...f.checklist, { id: uuid(), label, checked: false, group: 'custom' }],
    }))
    setNewItem('')
  }

  function reset() {
    updateFestival(festival.id, (f) => ({ ...f, checklist: createChecklist(f.type) }))
    setConfirmReset(false)
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Progress */}
      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {t('checklist.progress', { checked, total })}
          </span>
          <span className="text-sm font-black tabular-nums text-accent">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={t('checklist.addPlaceholder')}
          className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-3 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60"
        />
        <button
          onClick={add}
          className="flex shrink-0 items-center justify-center rounded-xl bg-accent px-4 text-on-accent"
          aria-label={t('common.add')}
        >
          <PlusIcon size={20} />
        </button>
      </div>

      {/* Groups */}
      {grouped.map(([group, items]) => (
        <div key={group}>
          <h3 className="pass-heading mb-2 text-xs tracking-widest text-text-muted">
            {t(`checklist.groups.${group}`)}
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-card divide-y divide-border">
            {items.map((item) => {
              const label = item.key ? t(`checklist.items.${item.key}`) : (item.label ?? '')
              return (
                <div key={item.id} className="flex items-center gap-3 p-3.5">
                  <button
                    onClick={() => toggle(item.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      item.checked ? 'border-accent bg-accent text-on-accent' : 'border-border text-transparent'
                    }`}
                    aria-label={label}
                  >
                    <CheckIcon size={15} />
                  </button>
                  <span className={`flex-1 text-sm ${item.checked ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                    {label}
                  </span>
                  <button onClick={() => remove(item.id)} className="p-1 text-text-muted hover:text-red-400">
                    <TrashIcon size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {total === 0 && (
        <p className="py-6 text-center text-sm text-text-muted">{t('checklist.empty')}</p>
      )}

      {/* Reset */}
      {!confirmReset ? (
        <button
          onClick={() => setConfirmReset(true)}
          className="w-full rounded-xl border border-border py-3 text-xs font-semibold uppercase tracking-wider text-text-muted"
        >
          {t('checklist.reset')}
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-surface-card p-4 text-center">
          <p className="text-sm text-text-secondary">{t('checklist.resetConfirm')}</p>
          <div className="mt-3 flex gap-3">
            <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-text-secondary">
              {t('common.cancel')}
            </button>
            <button onClick={reset} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-bold text-on-accent">
              {t('checklist.reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
