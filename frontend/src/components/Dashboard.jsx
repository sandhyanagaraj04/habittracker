import { format } from 'date-fns'
import { Footprints, Heart, Moon, Star, CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import StreakCards from './StreakCards'
import HabitHeatmap from './HabitHeatmap'
import { SADHANA_KEYS, SPIRITUAL_KEYS, HEALTH_KEYS, LABEL_MAP, completionRate, calcStreak } from '../utils/transform'

function buildStats(data) {
  const stats = {}
  const allKeys = [...SADHANA_KEYS, ...SPIRITUAL_KEYS, ...HEALTH_KEYS, 'reading']
  for (const key of allKeys) {
    const values = data.map(r => r[key])
    const completed = values.filter(Boolean).length
    stats[key] = {
      total: values.length,
      completed,
      rate: values.length ? Math.round(completed / values.length * 100) : 0,
      streak: calcStreak(data, key),
    }
  }
  return stats
}

export default function Dashboard({ data, today, onRefresh }) {
  const stats = buildStats(data)
  const todayStr = format(new Date(), 'EEEE, d MMMM yyyy')
  const sadhanaRate = completionRate(data, SADHANA_KEYS)

  const sleepRows = data.filter(r => r.sleep_quality)
  const avgQuality = sleepRows.length
    ? (sleepRows.reduce((s, r) => s + r.sleep_quality, 0) / sleepRows.length).toFixed(1)
    : null

  const stepRows = data.filter(r => r.steps > 0)
  const avgSteps = stepRows.length
    ? Math.round(stepRows.reduce((s, r) => s + r.steps, 0) / stepRows.length)
    : 0

  const statCards = [
    { label: 'Days Logged',      value: data.length,                         icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Steps',        value: avgSteps.toLocaleString(),            icon: Footprints,   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { label: 'Avg Sleep Quality',value: avgQuality ? `${avgQuality}/5` : '—', icon: Moon,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
    { label: 'Sadhana Rate',     value: `${sadhanaRate}%`,                   icon: Star,         color: 'text-saffron',     bg: 'bg-saffron/10' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning 🙏</h1>
          <p className="text-slate-400 text-sm mt-1">{todayStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {today
            ? <div className="card-sm flex items-center gap-2 text-sm"><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-slate-300">Today logged</span></div>
            : <div className="card-sm flex items-center gap-2 text-sm"><Circle size={14} className="text-amber-400" /><span className="text-slate-300">Today not yet logged</span></div>
          }
          <button onClick={onRefresh} className="btn-ghost flex items-center gap-1.5 text-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-sm flex flex-col gap-3">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {today && (
        <div className="card">
          <p className="section-title">Today's Sadhana</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SADHANA_KEYS.map(key => (
              <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                ${today[key] ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-white/3 text-slate-600 border border-white/5'}`}>
                <span>{today[key] ? '✓' : '○'}</span>{LABEL_MAP[key]}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="section-title">Current Streaks</p>
        <StreakCards stats={stats} keys={[...SADHANA_KEYS, ...SPIRITUAL_KEYS, ...HEALTH_KEYS]} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title mb-0">Habit Activity — 2026</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-white/5 border border-border inline-block" />None
            <span className="w-3 h-3 rounded-sm bg-saffron/40 inline-block" />Partial
            <span className="w-3 h-3 rounded-sm bg-saffron inline-block" />Full
          </div>
        </div>
        <HabitHeatmap data={data} />
      </div>

      {today && (
        <div className="card">
          <p className="section-title">Health & Wellness Today</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HEALTH_KEYS.map(key => (
              <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                ${today[key] ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-white/3 text-slate-600 border border-white/5'}`}>
                <span>{today[key] ? '✓' : '○'}</span>{LABEL_MAP[key]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
