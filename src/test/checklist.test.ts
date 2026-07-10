import { describe, it, expect } from 'vitest'
import { createChecklist } from '../data/checklistTemplates'

describe('createChecklist', () => {
  it('produces keyed template items (kept language-agnostic for bilingual render)', () => {
    const items = createChecklist('camping')
    expect(items.length).toBeGreaterThan(10)
    for (const item of items) {
      expect(item.key).toBeTruthy()
      expect(item.label).toBeUndefined()
      expect(item.checked).toBe(false)
      expect(item.group).toBeTruthy()
    }
    expect(items.some((i) => i.key === 'tent')).toBe(true)
  })

  it('day template omits camping-only items', () => {
    const items = createChecklist('day')
    expect(items.some((i) => i.key === 'tent')).toBe(false)
  })

  it('urban template includes transport items', () => {
    const items = createChecklist('urban')
    expect(items.some((i) => i.key === 'transportPass')).toBe(true)
  })
})
