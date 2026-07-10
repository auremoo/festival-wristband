// Locale-aware formatting helpers. Locale is passed in from the caller
// (i18n.language) so output follows the active UI language.

function toLocale(lang: string): string {
  return lang.startsWith('fr') ? 'fr-FR' : 'en-GB'
}

/** "19–21 Jun 2026" style range, collapsing shared month/year. */
export function formatDateRange(start: string, end: string, lang: string): string {
  if (!start) return ''
  const locale = toLocale(lang)
  const s = new Date(start + 'T12:00:00')
  const e = end ? new Date(end + 'T12:00:00') : s
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  const sameDay = start === end || !end

  const dayMonthYear = (d: Date) =>
    d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })

  if (sameDay) return dayMonthYear(s)
  if (sameMonth) {
    const startDay = s.toLocaleDateString(locale, { day: 'numeric' })
    return `${startDay}–${dayMonthYear(e)}`
  }
  const startPart = s.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  return `${startPart} – ${dayMonthYear(e)}`
}

export function formatDay(iso: string, lang: string): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString(toLocale(lang), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatMonthYear(iso: string, lang: string): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString(toLocale(lang), {
    month: 'long',
    year: 'numeric',
  })
}

export function formatTimestamp(iso: string, lang: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString(toLocale(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Compact money, no forced currency symbol beyond €. */
export function formatMoney(amount: number, lang: string): string {
  return new Intl.NumberFormat(toLocale(lang), {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/** A stable pseudo-serial for the wristband look, derived from the festival id. */
export function wristbandSerial(id: string, edition: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const block = (clean.slice(0, 4) || '0000').padEnd(4, '0')
  const block2 = (clean.slice(4, 8) || '0000').padEnd(4, '0')
  return `FW·${edition || '----'}·${block}·${block2}`
}
