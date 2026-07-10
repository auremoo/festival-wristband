import { useTranslation } from 'react-i18next'
import { useFestivals } from '../contexts/FestivalsContext'

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const { setLanguage } = useFestivals()
  const current = i18n.language.startsWith('fr') ? 'fr' : 'en'

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            current === lang.code
              ? 'bg-accent text-on-accent'
              : 'bg-surface-card text-text-muted hover:text-text-primary'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
