import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeftIcon } from './Icons'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  headerContent?: React.ReactNode
  /** Show a back chevron in the header. */
  back?: boolean
  /** Optional element pinned to the top-right of the header (e.g. an action button). */
  right?: React.ReactNode
}

export default function PageShell({ title, subtitle, children, headerContent, back, right }: Props) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col" style={{ paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Hero gradient header — tinted by the live accent color */}
      <div className="noise-bg relative bg-gradient-to-b from-accent/12 via-surface to-surface px-4 pb-6 pt-6">
        <div className="relative z-10">
          <div className="mb-2 flex items-start justify-between gap-3">
            {back ? (
              <button
                onClick={() => navigate(-1)}
                className="-ml-2 flex items-center gap-1 rounded-lg py-1 pl-1 pr-2 text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                <ChevronLeftIcon size={18} />
                {t('common.back')}
              </button>
            ) : (
              <span />
            )}
            {right}
          </div>
          <h1 className="pass-heading text-3xl leading-none text-text-primary sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
          {headerContent}
        </div>
      </div>

      {/* Page content */}
      <div className="px-4 pt-4">{children}</div>
    </div>
  )
}
