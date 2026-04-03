import { Flame } from 'lucide-react'
import { LABEL_MAP } from '../utils/transform'

export default function StreakCards({ stats, keys }) {
  const withStreak = keys
    .filter(k => stats[k] && stats[k].streak > 0)
    .sort((a, b) => stats[b].streak - stats[a].streak)
    .slice(0, 12)

  if (!withStreak.length) {
    return <p className="text-slate-600 text-sm">No active streaks yet. Start logging!</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {withStreak.map(key => {
        const s = stats[key]
        const heat = s.streak >= 30 ? 'from-amber-500 to-orange-600'
                   : s.streak >= 14 ? 'from-saffron to-amber-500'
                   : s.streak >= 7  ? 'from-orange-400 to-saffron'
                   :                  'from-orange-300/60 to-saffron/60'
        return (
          <div key={key} className="card-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${heat} flex items-center justify-center flex-shrink-0`}>
              <Flame size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white leading-none">{s.streak}d</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{LABEL_MAP[key] ?? key}</p>
              <p className="text-xs text-slate-600">{s.rate}% overall</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
