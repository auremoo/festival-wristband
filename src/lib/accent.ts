// Dynamic accent-color injection. Setting `--color-accent` on :root cascades to
// every Tailwind `accent` utility (including opacity tints, which Tailwind 4
// compiles to color-mix on the variable). We also derive a readable foreground
// (`--color-on-accent`) so buttons stay legible on any festival color.

const NEUTRAL_ACCENT = '#e7e5e4' // warm off-white — used when no festival is active
const NEUTRAL_ON_ACCENT = '#0a0a0a'

/** Parse a #rgb / #rrggbb hex string into 0-255 channels. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

/** Relative luminance (0-255 scale, perceptual weights). */
function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b
}

/** Pick black or white text for maximum contrast against a background color. */
export function contrastText(hex: string): string {
  return luminance(hex) > 140 ? '#0a0a0a' : '#ffffff'
}

/**
 * Apply an accent color globally. Pass a festival's hex to theme the whole UI,
 * or null to fall back to the neutral warm-white accent.
 */
export function applyAccent(hex: string | null): void {
  const root = document.documentElement
  const color = hex && hexToRgb(hex) ? hex : NEUTRAL_ACCENT
  const onAccent = hex && hexToRgb(hex) ? contrastText(hex) : NEUTRAL_ON_ACCENT
  root.style.setProperty('--color-accent', color)
  root.style.setProperty('--color-on-accent', onAccent)
}
