import { useMemo } from 'react'
import { parseISO, isValid, format, eachDayOfInterval, startOfYear, endOfYear, getDay } from 'date-fns'
import { SADHANA_KEYS, HEALTH_KEYS, SPIRITUAL_KEYS } from '../utils/transform'

const ALL_HABIT_KEYS = [...SADHANA_KEYS, ...HEALTH_KEYS, ...SPIRITUAL_KEYS]

function getColor(rate) {
  if (rate === 0)   return 'bg-white/5 border-border'
  if (rate < 0.33)  return 'bg-saffron/20 border-saffron/10'
  if (rate < 0.66)  return 'bg-saffron/50 border-saffron/30'
  return 'bg-saffron border-saffron/60'
}

export default function HabitHeatmap({ data }) {
  const dataMap = useMemo(() => {
    const map = {}
    for (const row of data) {
      if (!row.date) continue
      const completed = ALL_HABIT_KEYS.filter(k => row[k]).length
      map[row.date] = completed / ALL_HABIT_KEYS.length
    }
    return map
  }, [data])

  const year = 2026
  const days = useMemo(() =>
    eachDayOfInterval({ start: new Date(year, 0, 1), end: new Date(year, 11, 31) }),
    []
  )

  // Group into weeks (columns), each week starts on Sunday
  const weeks = useMemo(() => {
    const result = []
    let week = []
    const firstDay = getDay(days[0])
    // pad start
    for (let i = 0; i < firstDay; i++) week.push(null)
    for (const d of days) {
      week.push(d)
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null)
      result.push(week)
    }
    return result
  }, [days])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAYS   = ['S','M','T','W','T','F','S']

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 ml-6">
          {weeks.map((week, wi) => {
            const first = week.find(Boolean)
            if (!first) return <div key={wi} className="w-3" />
            const isFirst = first.getDate() <= 7
            return (
              <div key={wi} className="w-3 text-center">
                {isFirst && (
                  <span className="text-xs text-slate-600 absolute -translate-x-1/2">
                    {MONTHS[first.getMonth()]}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAYS.map((d, i) => (
              <div key={i} className="w-4 h-3 text-xs text-slate-700 flex items-center justify-end">{d}</div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="w-3 h-3" />
                const key = format(day, 'yyyy-MM-dd')
                const rate = dataMap[key] ?? -1
                const title = rate >= 0
                  ? `${key}: ${Math.round(rate * 100)}%`
                  : `${key}: no data`
                return (
                  <div
                    key={di}
                    title={title}
                    className={`w-3 h-3 rounded-sm border ${rate < 0 ? 'bg-white/3 border-white/5' : getColor(rate)} cursor-default transition-opacity hover:opacity-80`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
