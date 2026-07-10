import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusIcon, TrashIcon, NoteIcon } from '../Icons'
import { useFestivals, uuid } from '../../contexts/FestivalsContext'
import { formatTimestamp } from '../../lib/format'
import type { Festival } from '../../lib/types'

export default function NotesTab({ festival }: { festival: Festival }) {
  const { t, i18n } = useTranslation()
  const { updateFestival } = useFestivals()
  const [text, setText] = useState('')

  const entries = [...festival.noteEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function add() {
    const value = text.trim()
    if (!value) return
    updateFestival(festival.id, (f) => ({
      ...f,
      noteEntries: [...f.noteEntries, { id: uuid(), text: value, createdAt: new Date().toISOString() }],
    }))
    setText('')
  }

  function remove(entryId: string) {
    updateFestival(festival.id, (f) => ({
      ...f,
      noteEntries: f.noteEntries.filter((n) => n.id !== entryId),
    }))
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Composer */}
      <div className="rounded-2xl border border-border bg-surface-card p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={t('notes.placeholder')}
          className="w-full resize-none rounded-xl border border-border bg-surface-alt p-3 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60"
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold uppercase tracking-wider text-on-accent disabled:opacity-40"
        >
          <PlusIcon size={16} />
          {t('notes.add')}
        </button>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="space-y-2.5">
          {entries.map((n) => (
            <div key={n.id} className="rounded-2xl border border-border bg-surface-card p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-accent">
                  {formatTimestamp(n.createdAt, i18n.language)}
                </span>
                <button onClick={() => remove(n.id)} className="p-1 text-text-muted hover:text-red-400">
                  <TrashIcon size={15} />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-text-primary">{n.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface-card/50 p-8 text-center">
          <NoteIcon size={24} className="mx-auto mb-2 text-text-muted" />
          <p className="text-sm text-text-secondary">{t('notes.empty')}</p>
        </div>
      )}
    </div>
  )
}
