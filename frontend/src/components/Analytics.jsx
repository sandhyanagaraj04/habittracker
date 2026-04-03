import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useMemo, useState } from 'react'
import { format, parseISO, isValid } from 'date-fns'

function safeFormat(dateStr) {
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'MMM d') : dateStr
  } catch {
    return dateStr
  }
}
import { parseSleepDuration, SADHANA_KEYS, SPIRITUAL_KEYS, HEALTH_KEYS, LABEL_MAP, calcStreak } from '../utils/transform'
import { splitByQuarter, Q1_TOTAL_DAYS, q2ElapsedDays } from '../sheet'

const TT = {
  contentStyle: { background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#f1f5f9' },
}

const ALL_HABIT_KEYS = [...SADHANA_KEYS, ...SPIRITUAL_KEYS, ...HEALTH_KEYS, 'reading']

// ── Time helpers ──────────────────────────────────────────────────────────────
function parseTimeToMins(t) {
  if (!t) return null
  const s = String(t).trim()
  const m = s.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i)
  if (!m) return null
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  const ap = (m[3] || '').toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  return h * 60 + min
}

function minsToTime(mins) {
  const h = Math.floor(mins / 60) % 24
  const m = Math.round(mins % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function avgWakeTime(rows) {
  const times = rows.map(r => parseTimeToMins(r.wake_up_time)).filter(t => t !== null)
  if (!times.length) return '—'
  return minsToTime(times.reduce((a, b) => a + b, 0) / times.length)
}

function avgSleepHours(rows) {
  const d = rows.map(r => parseSleepDuration(r.sleep_duration)).filter(v => v && v > 0)
  if (!d.length) return '—'
  return (d.reduce((a, b) => a + b, 0) / d.length).toFixed(1) + 'h'
}

// ── Habit stats for a quarter ─────────────────────────────────────────────────
function habitStats(rows, totalDays, key) {
  const yes      = rows.filter(r => r[key] === true).length
  const no       = rows.filter(r => r[key] === false).length
  const noData   = totalDays - yes - no
  return { yes, no, noData, totalDays }
}

// ── Sub-tab button ────────────────────────────────────────────────────────────
function SubTab({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
        ${active ? 'bg-saffron/15 text-saffron border border-saffron/25' : 'text-slate-400 hover:text-slate-200'}`}>
      {children}
    </button>
  )
}

// ── Habit stats table ─────────────────────────────────────────────────────────
function HabitTable({ rows, totalDays, label }) {
  return (
    <div className="card">
      <p className="section-title">{label} — Habit Breakdown ({totalDays} days total)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-border">
              <th className="text-left py-2 pr-4 font-medium">Habit</th>
              <th className="text-center py-2 px-3 font-medium text-emerald-400">Yes</th>
              <th className="text-center py-2 px-3 font-medium text-rose-400">No</th>
              <th className="text-center py-2 px-3 font-medium text-slate-500">No data</th>
              <th className="text-left py-2 pl-3 font-medium">Rate</th>
            </tr>
          </thead>
          <tbody>
            {ALL_HABIT_KEYS.map(key => {
              const { yes, no, noData } = habitStats(rows, totalDays, key)
              const rate = totalDays ? Math.round((yes / totalDays) * 100) : 0
              return (
                <tr key={key} className="border-b border-white/3 hover:bg-white/2">
                  <td className="py-2 pr-4 text-slate-300">{LABEL_MAP[key] ?? key}</td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-semibold">{yes}</td>
                  <td className="py-2 px-3 text-center text-rose-400">{no}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{noData}</td>
                  <td className="py-2 pl-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-saffron to-spirit rounded-full"
                          style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-saffron font-semibold w-8">{rate}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Overview cards ─────────────────────────────────────────────────────────────
function OverviewCards({ data }) {
  const { q1, q2 } = useMemo(() => splitByQuarter(data), [data])
  const q2Days = q2ElapsedDays()

  const wakeRows = data.filter(r => r.wake_up_time)
  const heartOver10 = data.filter(r => r.heart_points >= 10).length

  const cards = [
    { label: 'Days Logged', value: data.length, sub: `${Q1_TOTAL_DAYS + q2Days - data.length} days missing`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Wake Time', value: avgWakeTime(wakeRows), sub: `${wakeRows.length} days with data`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg Sleep', value: avgSleepHours(data), sub: `across ${data.filter(r => parseSleepDuration(r.sleep_duration)).length} days`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Heart Points ≥10', value: heartOver10, sub: `out of ${data.filter(r => r.heart_points > 0).length} active days`, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Q1 Days Logged', value: q1.length, sub: `${Q1_TOTAL_DAYS - q1.length} missing`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Q2 Days Logged', value: q2.length, sub: `${q2Days - q2.length} missing so far`, color: 'text-spirit', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map(({ label, value, sub, color, bg }) => (
        <div key={label} className="card-sm">
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-sm text-white mt-1">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ── Habit trend card ──────────────────────────────────────────────────────────
function HabitTrendCard({ label, last30, allData, habitKey }) {
  const streak = calcStreak(allData, habitKey)
  const rate   = allData.length
    ? Math.round(allData.filter(r => r[habitKey] === true).length / allData.length * 100)
    : 0

  return (
    <div className="card-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-tight">{label}</p>
        <span className="text-xs text-saffron font-semibold flex-shrink-0">🔥 {streak}d</span>
      </div>

      {/* Last 30 days dot grid */}
      <div className="flex flex-wrap gap-0.5">
        {last30.map((r, i) => {
          const v = r[habitKey]
          const color = v === true ? 'bg-emerald-500' : v === false ? 'bg-rose-500/50' : 'bg-white/10'
          return <span key={i} className={`w-2.5 h-2.5 rounded-sm ${color}`} title={r.date} />
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{allData.filter(r => r[habitKey] === true).length} yes · {allData.filter(r => r[habitKey] === false).length} no</span>
        <span className="text-saffron font-semibold">{rate}%</span>
      </div>
    </div>
  )
}

// ── Trends (last 30 days) ─────────────────────────────────────────────────────
function Trends({ data }) {
  const last30 = data.slice(-30)

  const sleepData = useMemo(() =>
    last30.map(r => ({
      date: safeFormat(r.date),
      duration: parseSleepDuration(r.sleep_duration),
      quality: r.sleep_quality,
    })).filter(r => r.duration),
    [last30])

  const fitnessData = useMemo(() =>
    last30.map(r => ({
      date: safeFormat(r.date),
      steps: r.steps || 0,
      heart: r.heart_points || 0,
    })).filter(r => r.steps > 0 || r.heart > 0),
    [last30])

  const sadhanaRadar = useMemo(() =>
    SADHANA_KEYS.map(k => ({
      subject: (LABEL_MAP[k] ?? k).replace(' (Session 1)', '').replace(' (Session 2)', ' 2'),
      value: last30.length ? Math.round(last30.filter(r => r[k] === true).length / last30.length * 100) : 0,
    })),
    [last30])


  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <p className="section-title">Sleep Duration — last 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="sleepG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 10]} unit="h" />
              <Tooltip {...TT} formatter={v => [`${v?.toFixed(1)}h`, 'Duration']} />
              <Area type="monotone" dataKey="duration" stroke="#6366f1" fill="url(#sleepG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="section-title">Sleep Quality — last 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="qualG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 5]} />
              <Tooltip {...TT} formatter={v => [`${v}/5`, 'Quality']} />
              <Area type="monotone" dataKey="quality" stroke="#a855f7" fill="url(#qualG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="section-title">Daily Steps — last 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fitnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip {...TT} formatter={v => [v?.toLocaleString(), 'Steps']} />
              <Bar dataKey="steps" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="section-title">Sadhana Completion — last 30 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={sadhanaRadar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
              <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip {...TT} formatter={v => [`${v}%`, 'Completion']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="section-title">All Habits — Last 30 Days (🟢 Yes · 🔴 No · ⬛ No data)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_HABIT_KEYS.map(k => (
            <HabitTrendCard
              key={k}
              habitKey={k}
              label={LABEL_MAP[k] ?? k}
              last30={last30}
              allData={data}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Analytics ────────────────────────────────────────────────────────────
export default function Analytics({ data }) {
  const [sub, setSub] = useState('overview')
  const { q1, q2 } = useMemo(() => splitByQuarter(data), [data])
  const q2Days = q2ElapsedDays()

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Your 2026 habit data</p>
        </div>
        <div className="flex gap-1 bg-bg-card border border-border rounded-xl p-1">
          <SubTab active={sub === 'overview'} onClick={() => setSub('overview')}>Overview</SubTab>
          <SubTab active={sub === 'q1'}       onClick={() => setSub('q1')}>Q1</SubTab>
          <SubTab active={sub === 'q2'}       onClick={() => setSub('q2')}>Q2</SubTab>
          <SubTab active={sub === 'trends'}   onClick={() => setSub('trends')}>Trends</SubTab>
        </div>
      </div>

      {sub === 'overview' && <OverviewCards data={data} />}
      {sub === 'q1'       && <HabitTable rows={q1} totalDays={Q1_TOTAL_DAYS} label="Q1 (Jan–Mar)" />}
      {sub === 'q2'       && <HabitTable rows={q2} totalDays={q2Days} label={`Q2 (Apr–Jun, ${q2Days} days elapsed)`} />}
      {sub === 'trends'   && <Trends data={data} />}
    </div>
  )
}
