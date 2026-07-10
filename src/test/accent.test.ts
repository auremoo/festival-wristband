import { describe, it, expect } from 'vitest'
import { hexToRgb, contrastText } from '../lib/accent'

describe('accent', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses 3-digit hex', () => {
    expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('rejects invalid hex', () => {
    expect(hexToRgb('nope')).toBeNull()
  })

  it('picks white text on dark colors', () => {
    expect(contrastText('#c1121f')).toBe('#ffffff') // Hellfest red
    expect(contrastText('#8b2fc9')).toBe('#ffffff') // violet
  })

  it('picks dark text on light colors', () => {
    expect(contrastText('#e7e5e4')).toBe('#0a0a0a') // warm white
    expect(contrastText('#eab308')).toBe('#0a0a0a') // bright yellow
  })
})
