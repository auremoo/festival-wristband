import { describe, it, expect } from 'vitest'
import { parseData, exportJSON } from '../lib/storage'

describe('storage parsing', () => {
  it('normalizes a minimal festival and fills defaults', () => {
    const data = parseData(JSON.stringify({ festivals: [{ id: 'a', name: 'Hellfest' }] }))
    expect(data.festivals).toHaveLength(1)
    const f = data.festivals[0]
    expect(f.type).toBe('camping')
    expect(f.attended).toBe(false)
    expect(Array.isArray(f.checklist)).toBe(true)
    expect(Array.isArray(f.noteEntries)).toBe(true)
    expect(f.budgetTarget).toBeNull()
  })

  it('accepts a bare array of festivals', () => {
    const data = parseData(JSON.stringify([{ id: 'a', name: 'X' }]))
    expect(data.festivals).toHaveLength(1)
  })

  it('drops entries without id or name', () => {
    const data = parseData(JSON.stringify({ festivals: [{ name: 'no id' }, { id: 'ok', name: 'Y' }] }))
    expect(data.festivals).toHaveLength(1)
    expect(data.festivals[0].name).toBe('Y')
  })

  it('throws on non-JSON', () => {
    expect(() => parseData('not json')).toThrow()
  })

  it('round-trips through export', () => {
    const original = parseData(JSON.stringify({ festivals: [{ id: 'a', name: 'X', accentColor: '#c1121f' }] }))
    const reparsed = parseData(exportJSON(original))
    expect(reparsed.festivals[0].accentColor).toBe('#c1121f')
  })

  it('round-trips the language setting', () => {
    const data = parseData(JSON.stringify({ festivals: [], settings: { language: 'fr' } }))
    expect(data.settings?.language).toBe('fr')
    const reparsed = parseData(exportJSON(data))
    expect(reparsed.settings?.language).toBe('fr')
  })

  it('preserves keyed checklist items on import', () => {
    const data = parseData(
      JSON.stringify({ festivals: [{ id: 'a', name: 'X', checklist: [{ id: 'c1', key: 'tent', checked: true, group: 'camping' }] }] }),
    )
    expect(data.festivals[0].checklist[0].key).toBe('tent')
  })
})
