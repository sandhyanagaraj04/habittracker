import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { parseSleepDuration, SADHANA_KEYS, LABEL_MAP } from '../utils/transform'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#f1f5f9' },
}

export default function Analytics({ data, stats }) {
  const last30 = data.slice(-30)

  const sleepData = useMemo(() =>
    last30
      .map(r => ({
        date: r.date ? format(parseISO(r.date), 'MMM d') : '',
        duration: parseSleepDuration(r.sleep_duration),
        quality: r.sleep_quality,
      }))
      .filter(r => r.duration !== null),
    [last30]
  )

  const fitnessData = useMemo(() =>
    last30
      .map(r => ({
        date: r.date ? format(parseISO(r.date), 'MMM d') : '',
        steps: r.steps || 0,
        heart: r.heart_points || 0,
      }))
      .filter(r => r.steps > 0 || r.heart > 0),
    [last30]
  )

  const sadhanaRadar = useMemo(() =>
    SADHANA_KEYS.map(k => ({
      subject: LABEL_MAP[k]?.replace(' (Session 1)', '')?.replace(' (Session 2)', ' 2') ?? k,
      value: stats[k]?.rate ?? 0,
    })),
    [stats]
  )

  const topHabits = useMemo(() =>
    Object.entries(stats)
      .filter(([k]) => !k.startsWith('_') && stats[k]?.rate !== undefined)
      .sort((a, b) => b[1].rate - a[1].rate)
      .slice(0, 10)
      .map(([k, v]) => ({ name: LABEL_MAP[k] ?? k, rate: v.rate, streak: v.streak })),
    [stats]
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Trends and insights from your 2026 data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sleep Duration */}
        <div className="card">
          <p className="section-title">Sleep Duration (last 30 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 10]} unit="h" />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v?.toFixed(1)}h`, 'Duration']} />
              <Area type="monotone" dataKey="duration" stroke="#6366f1" fill="url(#sleepGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep Quality */}
        <div className="card">
          <p className="section-title">Sleep Quality Score (last 30 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 5]} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}/5`, 'Quality']} />
              <Area type="monotone" dataKey="quality" stroke="#a855f7" fill="url(#qualGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Steps */}
        <div className="card">
          <p className="section-title">Daily Steps (last 30 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fitnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [v?.toLocaleString(), 'Steps']} />
              <Bar dataKey="steps" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sadhana Radar */}
        <div className="card">
          <p className="section-title">Sadhana Completion Rate</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={sadhanaRadar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
              <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Completion']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top habits table */}
      <div className="card">
        <p className="section-title">Top 10 Habits by Completion Rate</p>
        <div className="space-y-2">
          {topHabits.map(({ name, rate, streak }) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-44 truncate">{name}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-saffron to-spirit rounded-full transition-all duration-500"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span className="text-xs text-saffron font-semibold w-10 text-right">{rate}%</span>
              <span className="text-xs text-slate-600 w-14 text-right">🔥 {streak}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
