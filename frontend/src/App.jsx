import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import TodayEntry from './components/TodayEntry'
import Analytics from './components/Analytics'
import History from './components/History'
import Q2Daily from './components/Q2Daily'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchSheetData } from './sheet'

export default function App() {
  const [tab, setTab]         = useState('dashboard')
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchSheetData())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const today = data.find(r => r.date === new Date().toISOString().slice(0, 10)) || null

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar tab={tab} setTab={setTab} />

      <main className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading your sheet…</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="card max-w-md text-center space-y-3">
              <p className="text-2xl">🔒</p>
              <p className="text-white font-semibold">Sheet not accessible</p>
              <p className="text-slate-400 text-sm">{error}</p>
              <p className="text-slate-500 text-xs">
                Open your Google Sheet → Share → <strong className="text-slate-300">Anyone with the link → Viewer</strong>
              </p>
              <button className="btn-primary" onClick={load}>Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <ErrorBoundary key={tab}>
            {tab === 'dashboard' && <Dashboard data={data} today={today} onRefresh={load} />}
            {tab === 'log'       && <TodayEntry today={today} />}
            {tab === 'analytics' && <Analytics data={data} />}
            {tab === 'q2daily'   && <Q2Daily />}
            {tab === 'history'   && <History data={data} />}
          </ErrorBoundary>
        )}
      </main>
    </div>
  )
}
