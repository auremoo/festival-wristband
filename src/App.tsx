import { lazy, Suspense, Component, type ReactNode } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FestivalsProvider } from './contexts/FestivalsContext'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'

const FestivalList = lazy(() => import('./pages/FestivalList'))
const FestivalForm = lazy(() => import('./pages/FestivalForm'))
const FestivalDetail = lazy(() => import('./pages/FestivalDetail'))
const MapPage = lazy(() => import('./pages/Map'))
const History = lazy(() => import('./pages/History'))
const Settings = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="text-text-muted">…</span>
    </div>
  )
}

class PageErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    if (this.state.error) return <ErrorFallback onReset={() => this.setState({ error: false })} />
    return this.props.children
  }
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-text-secondary">{t('common.pageError')}</p>
      <button
        onClick={() => {
          onReset()
          window.location.reload()
        }}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent"
      >
        {t('common.reload')}
      </button>
    </div>
  )
}

export default function App() {
  return (
    <FestivalsProvider>
      <HashRouter>
        <main className="flex-1">
          <PageErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/festivals" element={<FestivalList />} />
                <Route path="/festivals/new" element={<FestivalForm />} />
                <Route path="/festivals/:id" element={<FestivalDetail />} />
                <Route path="/festivals/:id/edit" element={<FestivalForm />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </PageErrorBoundary>
        </main>
        <BottomNav />
      </HashRouter>
    </FestivalsProvider>
  )
}
