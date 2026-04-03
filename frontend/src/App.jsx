import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import TodayEntry from './components/TodayEntry'
import Analytics from './components/Analytics'
import History from './components/History'
import { fetchAllData, fetchStats, fetchAuthStatus } from './api'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [data, setData]       = useState([])
  const [stats, setStats]     = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [authed, setAuthed]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { authenticated } = await fetchAuthStatus()
      setAuthed(authenticated)
      if (authenticated) {
        const [d, s] = await Promise.all([fetchAllData(), fetchStats()])
        setData(d)
        setStats(s)
      }
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
              <p className="text-slate-500 text-sm">Loading your data…</p>
            </div>
          </div>
        )}

        {!loading && authed === false && (
          <div className="flex items-center justify-center h-full">
            <div className="card max-w-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-spirit flex items-center justify-center mx-auto text-2xl">🔗</div>
              <h2 className="text-lg font-bold text-white">Connect Google Sheets</h2>
              <p className="text-slate-400 text-sm">Sign in with your Google account to load your 2026 habit data.</p>
              <a href="http://localhost:8000/auth/login" className="btn-primary inline-block">
                Sign in with Google
              </a>
              <p className="text-xs text-slate-600">After signing in, come back here and refresh.</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="card max-w-md text-center">
              <p className="text-rose-400 font-medium mb-2">Failed to load data</p>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button className="btn-primary" onClick={load}>Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {tab === 'dashboard' && <Dashboard data={data} stats={stats} today={today} />}
            {tab === 'log'       && <TodayEntry today={today} onSaved={load} />}
            {tab === 'analytics' && <Analytics data={data} stats={stats} />}
            {tab === 'history'   && <History data={data} />}
          </>
        )}
      </main>
    </div>
  )
}
