import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  loadDataSafeConfig,
  saveDataSafeConfig,
  restoreDataSafeConfigFromImport,
  exportData,
} from '../lib/dataSafe'
import type { StoredData } from '../lib/types'

const data: StoredData = { version: 1, festivals: [] }

beforeEach(() => {
  localStorage.clear()
})

describe('dataSafe config persistence', () => {
  it('round-trips url/apiKey/appName through localStorage', () => {
    saveDataSafeConfig({ url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' })
    expect(loadDataSafeConfig()).toEqual({ url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' })
  })

  it('defaults to empty strings when unset', () => {
    expect(loadDataSafeConfig()).toEqual({ url: '', apiKey: '', appName: '' })
  })
})

describe('restoreDataSafeConfigFromImport', () => {
  it('restores config found in an exported backup', () => {
    const backup = JSON.stringify({
      _datasafe: { url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' },
      _meta: { exportedAt: 'now', storage: ['localStorage'] },
      version: 1,
      festivals: [],
    })
    expect(restoreDataSafeConfigFromImport(backup)).toBe(true)
    expect(loadDataSafeConfig()).toEqual({ url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' })
  })

  it('is a no-op for a file with no _datasafe block', () => {
    expect(restoreDataSafeConfigFromImport(JSON.stringify({ version: 1, festivals: [] }))).toBe(false)
    expect(loadDataSafeConfig()).toEqual({ url: '', apiKey: '', appName: '' })
  })
})

describe('exportData', () => {
  beforeEach(() => {
    // jsdom doesn't implement these; stub for the local-download fallback path.
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POSTs the full config, including apiKey, when DataSafe is configured', async () => {
    saveDataSafeConfig({ url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, slug: 'fw', versions: 1 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await exportData(data)

    expect(result).toEqual({ mode: 'datasafe', result: { success: true, slug: 'fw', versions: 1 } })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://x/ingest')
    expect(init.headers.Authorization).toBe('Bearer secret')
    expect(init.headers['X-App-Name']).toBe('fw')
    const body = JSON.parse(init.body)
    expect(body._datasafe).toEqual({ url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' })
  })

  it('includes the _datasafe block in the local-download fallback when unconfigured', async () => {
    let capturedBlob: Blob | null = null
    const anchor = document.createElement('a')
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    vi.spyOn(anchor, 'click').mockImplementation(() => {})
    ;(URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock'
    })

    const result = await exportData(data)

    expect(result).toEqual({ mode: 'local' })
    expect(capturedBlob).not.toBeNull()
    const text = await capturedBlob!.text()
    const payload = JSON.parse(text)
    expect(payload._datasafe).toEqual({ url: '', apiKey: '', appName: '' })
  })

  it('falls back to local download and still includes apiKey when the DataSafe push fails', async () => {
    saveDataSafeConfig({ url: 'https://x/ingest', apiKey: 'secret', appName: 'fw' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    let capturedBlob: Blob | null = null
    ;(URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock'
    })
    const anchor = document.createElement('a')
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    vi.spyOn(anchor, 'click').mockImplementation(() => {})

    const result = await exportData(data)

    expect(result).toEqual({ mode: 'local' })
    const text = await capturedBlob!.text()
    const payload = JSON.parse(text)
    expect(payload._datasafe.apiKey).toBe('secret')
  })
})
