// DataSafe backup: pushes a full JSON export to a personal DataSafe (PRP) endpoint
// when configured, otherwise falls back to a local file download.
import { CURRENT_DATA_VERSION, type StoredData } from './types'

export interface DataSafeConfig {
  url: string
  apiKey: string
  appName: string
}

export interface DataSafePushResult {
  success: true
  slug: string
  versions: number
}

export type ExportResult =
  | { mode: 'datasafe'; result: DataSafePushResult }
  | { mode: 'local' }

const DATASAFE_CONFIG_KEY = 'festival-wristband-datasafe-config'

export function loadDataSafeConfig(): DataSafeConfig {
  try {
    const raw = localStorage.getItem(DATASAFE_CONFIG_KEY)
    if (!raw) return { url: '', apiKey: '', appName: '' }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      url: typeof parsed.url === 'string' ? parsed.url : '',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      appName: typeof parsed.appName === 'string' ? parsed.appName : '',
    }
  } catch {
    return { url: '', apiKey: '', appName: '' }
  }
}

export function saveDataSafeConfig(config: DataSafeConfig): void {
  localStorage.setItem(DATASAFE_CONFIG_KEY, JSON.stringify(config))
}

function isConfigured(config: DataSafeConfig): boolean {
  return Boolean(config.url && config.apiKey && config.appName)
}

function buildPayload(data: StoredData, config: DataSafeConfig) {
  return {
    _datasafe: {
      apiKey: config.apiKey,
      url: config.url,
      appName: config.appName,
    },
    _meta: {
      exportedAt: new Date().toISOString(),
      storage: ['localStorage'],
    },
    version: CURRENT_DATA_VERSION,
    festivals: data.festivals,
    settings: data.settings,
  }
}

function downloadLocally(payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `festival-wristband-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Exports all app data (currently: the single localStorage festival store).
 * Pushes to DataSafe when configured; falls back to a local JSON download
 * on missing config or on any network/request failure.
 */
export async function exportData(data: StoredData): Promise<ExportResult> {
  const config = loadDataSafeConfig()
  const payload = buildPayload(data, config)

  if (isConfigured(config)) {
    try {
      const res = await fetch(config.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Name': config.appName,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`DataSafe push failed with status ${res.status}`)
      const result = (await res.json()) as DataSafePushResult
      return { mode: 'datasafe', result }
    } catch (err) {
      console.error('DataSafe push failed, falling back to local export.', err)
      downloadLocally(payload)
      return { mode: 'local' }
    }
  }

  downloadLocally(payload)
  return { mode: 'local' }
}
