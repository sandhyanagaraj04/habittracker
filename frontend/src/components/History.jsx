import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SADHANA_KEYS, SPIRITUAL_KEYS, HEALTH_KEYS, LABEL_MAP } from '../utils/transform'

const HABIT_KEYS = [...SADHANA_KEYS, ...SPIRITUAL_KEYS, ...HEALTH_KEYS]

export default function History({ data }) {
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')

  const sorted = useMemo(() =>
    [...data]
      .filter(r => r.date)
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .filter(r =>
        !search ||
        r.date.includes(search) ||
        (r.place ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.which_book ?? '').toLowerCase().includes(search.toLowerCase())
      ),
    [data, search]
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-slate-400 text-sm mt-1">{data.length} days logged</p>
        </div>
        <input
          type="text"
          placeholder="Search date, place, book…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-60"
        />
      </div>

      <div className="space-y-2">
        {sorted.map(row => {
          const isOpen = expanded === row.date
          const done = HABIT_KEYS.filter(k => row[k]).length
          const pct = Math.round((done / HABIT_KEYS.length) * 100)
          const dateLabel = (() => {
            try { return format(parseISO(row.date), 'EEE, d MMM yyyy') }
            catch { return row.date }
          })()

          return (
            <div key={row.date} className="card p-0 overflow-hidden">
              {/* Row header */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-hover transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : row.date)}
              >
                <div className="flex-1 flex items-center gap-4">
                  <span className="font-medium text-sm text-white w-40">{dateLabel}</span>
                  {row.place && (
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                      {row.place}
                    </span>
                  )}
                  {row.sleep_duration && (
                    <span className="text-xs text-indigo-400">
                      💤 {row.sleep_duration}
                    </span>
                  )}
                  {row.steps > 0 && (
                    <span className="text-xs text-blue-400">
                      👣 {row.steps.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 w-36">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-saffron to-spirit rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                </div>

                {isOpen
                  ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" />
                  : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
                }
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-border px-5 py-4 space-y-4">
                  {/* Habits grid */}
                  <div>
                    <p className="section-title">Habits</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {HABIT_KEYS.map(k => (
                        <div
                          key={k}
                          className={`text-xs px-2 py-1 rounded-md ${
                            row[k]
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/3 text-slate-700'
                          }`}
                        >
                          {row[k] ? '✓' : '○'} {LABEL_MAP[k] ?? k}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meals */}
                  {(row.breakfast_food || row.lunch_food || row.dinner_food) && (
                    <div>
                      <p className="section-title">Meals</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[['breakfast_food','Breakfast'],['lunch_food','Lunch'],['snack_food','Snack'],['dinner_food','Dinner']].map(([k, lbl]) =>
                          row[k] ? (
                            <div key={k} className="bg-white/3 rounded-lg px-3 py-2">
                              <span className="text-slate-500">{lbl}: </span>
                              <span className="text-slate-300">{row[k]}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reading */}
                  {row.reading && row.which_book && (
                    <div>
                      <p className="section-title">Reading</p>
                      <p className="text-sm text-slate-300">
                        📚 {row.which_book}
                        {row.reading_minutes > 0 && ` — ${row.reading_minutes} mins`}
                        {row.words_pages && ` — ${row.words_pages}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate-600">No entries found.</div>
        )}
      </div>
    </div>
  )
}
