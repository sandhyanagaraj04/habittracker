import { format } from 'date-fns'
import { Footprints, Heart, Moon, Star, TrendingUp, CheckCircle2, Circle } from 'lucide-react'
import StreakCards from './StreakCards'
import HabitHeatmap from './HabitHeatmap'
import { SADHANA_KEYS, SPIRITUAL_KEYS, HEALTH_KEYS, LABEL_MAP, completionRate } from '../utils/transform'

export default function Dashboard({ data, stats, today }) {
  const todayStr = format(new Date(), 'EEEE, d MMMM yyyy')
  const sadhanaRate = completionRate(data, SADHANA_KEYS)
  const totalDays = data.length

  const statCards = [
    {
      label: 'Total Days Logged',
      value: totalDays,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Avg Steps',
      value: stats._fitness?.avg_steps?.toLocaleString() ?? '—',
      icon: Footprints,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Avg Heart Points',
      value: stats._fitness?.avg_heart_points ?? '—',
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Avg Sleep Quality',
      value: stats._sleep?.avg_quality ? `${stats._sleep.avg_quality}/5` : '—',
      icon: Moon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Sadhana Completion',
      value: `${sadhanaRate}%`,
      icon: Star,
      color: 'text-saffron',
      bg: 'bg-saffron/10',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning 🙏</h1>
          <p className="text-slate-400 text-sm mt-1">{todayStr}</p>
        </div>
        {today && (
          <div className="card-sm flex items-center gap-2 text-sm">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-slate-300">Today logged</span>
          </div>
        )}
        {!today && (
          <div className="card-sm flex items-center gap-2 text-sm">
            <Circle size={14} className="text-amber-400" />
            <span className="text-slate-300">Today not yet logged</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

      {/* Today's snapshot */}
      {today && (
        <div className="card">
          <p className="section-title">Today's Sadhana</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SADHANA_KEYS.map(key => (
              <div
                key={key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                  ${today[key]
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                    : 'bg-white/3 text-slate-600 border border-white/5'
                  }`}
              >
                <span>{today[key] ? '✓' : '○'}</span>
                {LABEL_MAP[key]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaks */}
      <div>
        <p className="section-title">Current Streaks</p>
        <StreakCards stats={stats} keys={[...SADHANA_KEYS, ...SPIRITUAL_KEYS, ...HEALTH_KEYS]} />
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title mb-0">Habit Activity — 2026</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-white/5 border border-border inline-block" />
            <span>None</span>
            <span className="w-3 h-3 rounded-sm bg-saffron/40 inline-block" />
            <span>Partial</span>
            <span className="w-3 h-3 rounded-sm bg-saffron inline-block" />
            <span>Full</span>
          </div>
        </div>
        <HabitHeatmap data={data} />
      </div>

      {/* Today's health */}
      {today && (
        <div className="card">
          <p className="section-title">Health & Wellness Today</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HEALTH_KEYS.map(key => (
              <div
                key={key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                  ${today[key]
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                    : 'bg-white/3 text-slate-600 border border-white/5'
                  }`}
              >
                <span>{today[key] ? '✓' : '○'}</span>
                {LABEL_MAP[key]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
