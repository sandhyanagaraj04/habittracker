import { useEffect, useState } from 'react'
import { fetchQ2Daily } from '../sheet'
import { RefreshCw } from 'lucide-react'

export default function Q2Daily() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { headers: h, rows: r } = await fetchQ2Daily()
      setHeaders(h)
      setRows(r)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 max-w-full mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Q2 Daily</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} rows · {headers.length} columns</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-1.5 text-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="card text-center space-y-2">
          <p className="text-rose-400">{error}</p>
          <button className="btn-primary" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="card text-center text-slate-500 py-10">No data available.</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  {headers.map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-slate-400 font-medium bg-bg-card sticky top-0">
                      {h || `Col ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    {headers.map((_, ci) => {
                      const val = row[ci] ?? ''
                      const isYes = /^yes$/i.test(val)
                      const isNo  = /^no$/i.test(val)
                      return (
                        <td key={ci} className="px-4 py-2.5">
                          {isYes
                            ? <span className="text-emerald-400 font-medium">✓ Yes</span>
                            : isNo
                              ? <span className="text-rose-400">✗ No</span>
                              : <span className="text-slate-300">{val}</span>
                          }
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
