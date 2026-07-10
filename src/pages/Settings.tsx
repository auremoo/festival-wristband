import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'
import { DownloadIcon, UploadIcon, TrashIcon, TicketIcon, CheckIcon } from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'
import { loadDataSafeConfig, saveDataSafeConfig, exportData as pushExport, type DataSafeConfig } from '../lib/dataSafe'

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { festivals, importData, resetAll, exportPayload, setLanguage } = useFestivals()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [dataSafe, setDataSafe] = useState<DataSafeConfig>(() => loadDataSafeConfig())
  const [exportMsg, setExportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    document.title = `${t('nav.settings')} — Festival Wristband`
  }, [t])

  function updateDataSafe(patch: Partial<DataSafeConfig>) {
    setDataSafe((prev) => {
      const next = { ...prev, ...patch }
      saveDataSafeConfig(next)
      return next
    })
  }

  async function download() {
    setExporting(true)
    setExportMsg(null)
    const result = await pushExport(exportPayload())
    setExporting(false)
    if (result.mode === 'datasafe') {
      setExportMsg({ ok: true, text: t('settings.dataSafe.pushSuccess', { slug: result.result.slug, versions: result.result.versions }) })
    } else {
      setExportMsg(null)
    }
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
                  onClick={() => setLanguage(lang.code)}
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
              disabled={exporting}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-card p-4 text-left transition-colors hover:bg-surface-alt disabled:opacity-60"
            >
              <UploadIcon size={20} className="text-accent" />
              <div>
                <p className="text-sm font-medium text-text-primary">{t('settings.export')}</p>
                <p className="text-xs text-text-muted">
                  {dataSafe.url && dataSafe.apiKey && dataSafe.appName
                    ? t('settings.dataSafe.exportDescConfigured')
                    : t('settings.exportDesc')}
                </p>
              </div>
            </button>
            {exportMsg && (
              <p className={`text-xs ${exportMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{exportMsg.text}</p>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-card p-4 text-left transition-colors hover:bg-surface-alt"
            >
              <DownloadIcon size={20} className="text-accent" />
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

        {/* DataSafe */}
        <section>
          <h2 className="pass-heading mb-2 text-xs tracking-wider text-text-muted">{t('settings.dataSafe.title')}</h2>
          <div className="space-y-2.5 rounded-2xl border border-border bg-surface-card p-4">
            <p className="text-xs text-text-muted">{t('settings.dataSafe.desc')}</p>
            <div className="space-y-2">
              <label className="block text-xs text-text-secondary">
                {t('settings.dataSafe.url')}
                <input
                  type="url"
                  value={dataSafe.url}
                  onChange={(e) => updateDataSafe({ url: e.target.value })}
                  placeholder="https://mon-domaine/api/data-safe/ingest"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                />
              </label>
              <label className="block text-xs text-text-secondary">
                {t('settings.dataSafe.apiKey')}
                <input
                  type="password"
                  value={dataSafe.apiKey}
                  onChange={(e) => updateDataSafe({ apiKey: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                />
              </label>
              <label className="block text-xs text-text-secondary">
                {t('settings.dataSafe.appName')}
                <input
                  type="text"
                  value={dataSafe.appName}
                  onChange={(e) => updateDataSafe({ appName: e.target.value })}
                  placeholder="festival-wristband"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                />
              </label>
            </div>
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
