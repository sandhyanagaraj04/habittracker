import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useMemo, useState } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { parseSleepDuration, SADHANA_KEYS, SPIRITUAL_KEYS, HEALTH_KEYS, LABEL_MAP, calcStreak } from '../utils/transform'
import { splitByQuarter, Q1_TOTAL_DAYS, q2ElapsedDays } from '../sheet'

function safeFormat(dateStr) {
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'MMM d') : dateStr
  } catch {
    return dateStr
  }
}

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

// ── Habit stats for a set of rows ─────────────────────────────────────────────
function habitStats(rows, totalDays, key) {
  const yes    = rows.filter(r => r[key] === true).length
  const no     = rows.filter(r => r[key] === false).length
  const noData = totalDays - yes - no
  return { yes, no, noData, totalDays }
}

// ── Generate ISO date list ─────────────────────────────────────────────────────
function genDateList(startISO, days) {
  const list = []
  const start = new Date(startISO + 'T00:00:00')
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    list.push(d.toISOString().slice(0, 10))
  }
  return list
}

const Q1_DATES = genDateList('2026-01-01', 90)

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

// ── 90-day row grid ───────────────────────────────────────────────────────────
function HabitRowGrid({ rows, totalDays, dateList, label }) {
  const [expanded, setExpanded] = useState(null)

  const dataByDate = useMemo(() => {
    const m = {}
    rows.forEach(r => { if (r.date) m[r.date] = r })
    return m
  }, [rows])

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="section-title mb-0">{label}</p>
        <p className="text-xs text-slate-500">{totalDays} days · {rows.length} logged</p>
      </div>

      {/* Legend */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-4 text-xs text-slate-500 border-b border-white/3">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Yes</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-500/70 inline-block" />No</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white/10 inline-block" />No data</span>
      </div>

      <div className="divide-y divide-white/3">
        {ALL_HABIT_KEYS.map(key => {
          const isOpen = expanded === key
          const stats  = habitStats(rows, totalDays, key)
          const rate   = totalDays ? Math.round((stats.yes / totalDays) * 100) : 0
          const streak = calcStreak(rows, key)

          return (
            <div key={key}>
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/2 transition-colors">
                <button
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className="text-slate-600 hover:text-slate-300 flex-shrink-0 text-xs w-3"
                  title="Toggle summary"
                >
                  {isOpen ? '▲' : '▼'}
                </button>

                <span className="text-xs text-slate-300 w-40 flex-shrink-0 truncate" title={LABEL_MAP[key] ?? key}>
                  {LABEL_MAP[key] ?? key}
                </span>

                <div className="flex gap-px overflow-x-auto flex-1 min-w-0 py-0.5">
                  {dateList.map(date => {
                    const row = dataByDate[date]
                    const v   = row ? row[key] : null
                    const cls = v === true
                      ? 'bg-emerald-500'
                      : v === false
                        ? 'bg-rose-500/70'
                        : 'bg-white/10'
                    return (
                      <span
                        key={date}
                        className={`flex-shrink-0 w-2 h-4 rounded-sm ${cls}`}
                        title={`${safeFormat(date)}: ${v === true ? 'Yes' : v === false ? 'No' : 'No data'}`}
                      />
                    )
                  })}
                </div>
              </div>

              {isOpen && (
                <div className="flex items-center gap-5 px-8 pb-2.5 pt-0.5 text-xs">
                  <span className="text-emerald-400 font-medium">✓ {stats.yes} yes</span>
                  <span className="text-rose-400">✗ {stats.no} no</span>
                  <span className="text-slate-600">— {stats.noData} no data</span>
                  <span className="text-saffron font-semibold">{rate}%</span>
                  <span className="text-slate-400">🔥 {streak}d streak</span>
                </div>
              )}
            </div>
          )
        })}
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

  const trendDates = useMemo(() => last30.map(r => r.date), [last30])

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

      <HabitRowGrid
        rows={last30}
        totalDays={last30.length || 30}
        dateList={trendDates}
        label="All Habits — Last 30 Days"
      />
    </div>
  )
}

// ── Main Analytics ────────────────────────────────────────────────────────────
export default function Analytics({ data }) {
  const [sub, setSub] = useState('overview')
  const { q1, q2 } = useMemo(() => splitByQuarter(data), [data])
  const q2Days = q2ElapsedDays()
  const q2Dates = useMemo(() => genDateList('2026-04-01', q2Days), [q2Days])

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
      {sub === 'q1' && (
        <HabitRowGrid
          rows={q1}
          totalDays={Q1_TOTAL_DAYS}
          dateList={Q1_DATES}
          label="Q1 (Jan–Mar) — 90 Days"
        />
      )}
      {sub === 'q2' && (
        <HabitRowGrid
          rows={q2}
          totalDays={q2Days}
          dateList={q2Dates}
          label={`Q2 (Apr–Jun) — ${q2Days} days elapsed`}
        />
      )}
      {sub === 'trends' && <Trends data={data} />}
    </div>
  )
}
