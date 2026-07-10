import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'
import { DownloadIcon, UploadIcon, TrashIcon, TicketIcon, CheckIcon } from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { festivals, exportData, importData, resetAll } = useFestivals()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    document.title = `${t('nav.settings')} — Festival Wristband`
  }, [t])

  function download() {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `festival-wristband-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importData(String(reader.result))
      if (result.ok) setImportMsg({ ok: true, text: t('settings.importSuccess', { count: result.count }) })
      else setImportMsg({ ok: false, text: t('settings.importError') })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <PageShell title={t('settings.title')}>
      <div className="space-y-6 pb-4">
        {/* Data summary */}
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <TicketIcon size={16} />
            <span className="text-sm">{t('settings.stored', { count: festivals.length })}</span>
          </div>
        </div>

        {/* Language */}
        <section>
          <h2 className="pass-heading mb-2 text-xs tracking-wider text-text-muted">{t('settings.language')}</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-card divide-y divide-border">
            {languages.map((lang) => {
              const active = i18n.language.startsWith(lang.code)
              return (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`flex w-full items-center justify-between p-4 text-sm transition-colors hover:bg-surface-alt ${active ? 'text-accent' : 'text-text-primary'}`}
                >
                  <span>{lang.label}</span>
                  {active && <CheckIcon size={16} className="text-accent" />}
                </button>
              )
            })}
          </div>
        </section>

        {/* Data management */}
        <section>
          <h2 className="pass-heading mb-2 text-xs tracking-wider text-text-muted">{t('settings.data')}</h2>
          <div className="space-y-2.5">
            <button
              onClick={download}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-card p-4 text-left transition-colors hover:bg-surface-alt"
            >
              <DownloadIcon size={20} className="text-accent" />
              <div>
                <p className="text-sm font-medium text-text-primary">{t('settings.export')}</p>
                <p className="text-xs text-text-muted">{t('settings.exportDesc')}</p>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-card p-4 text-left transition-colors hover:bg-surface-alt"
            >
              <UploadIcon size={20} className="text-accent" />
              <div>
                <p className="text-sm font-medium text-text-primary">{t('settings.import')}</p>
                <p className="text-xs text-text-muted">{t('settings.importDesc')}</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="hidden" />

            {importMsg && (
              <p className={`text-xs ${importMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{importMsg.text}</p>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="pass-heading mb-2 text-xs tracking-wider text-text-muted">{t('settings.dangerZone')}</h2>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/20 p-4 text-left"
            >
              <TrashIcon size={20} className="text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">{t('settings.reset')}</p>
                <p className="text-xs text-text-muted">{t('settings.resetDesc')}</p>
              </div>
            </button>
          ) : (
            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-4">
              <p className="text-sm text-text-secondary">{t('settings.resetConfirm')}</p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm text-text-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    resetAll()
                    setConfirmReset(false)
                    setImportMsg(null)
                  }}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold uppercase tracking-wider text-white"
                >
                  {t('settings.reset')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section>
          <h2 className="pass-heading mb-2 text-xs tracking-wider text-text-muted">{t('settings.about')}</h2>
          <div className="rounded-2xl border border-border bg-surface-card p-4">
            <p className="text-sm text-text-primary">Festival Wristband v1.0</p>
            <p className="mt-1 text-xs text-text-muted">{t('settings.aboutDesc')}</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
