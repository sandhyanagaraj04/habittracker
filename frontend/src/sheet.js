import Papa from 'papaparse'
import { parse as dateParse, isValid } from 'date-fns'

// Internal key → original sheet column header (in exact column order)
export const COLUMN_MAP = [
  ['date',            ''],
  ['place',           'Place'],
  ['wake_up_time',    'Wake up time'],
  ['sleeping_time',   'Sleeping time'],
  ['sleep_duration',  'Sleep duration'],
  ['sleep_quality',   'Sleep quality'],
  ['guru_pooja',      'Guru Pooja'],
  ['rayara_matha',    'Rayara Matha visit'],
  ['ashwat_count',    'Ashwat vruksha pradakshina count'],
  ['upa_yoga',        'Upa Yoga'],
  ['yoga_namaskar',   'Yoga Namaskar'],
  ['surya_kriya',     'Surya Kriya'],
  ['asanas',          'Asanas'],
  ['sck_1',           'SCK'],
  ['shambhavi_1',     'Shambhavi 1'],
  ['ishanga',         'Ishanga 7%'],
  ['naadi_shuddhi',   'Naadi Shuddhi'],
  ['miracle_of_mind', 'Miracle of Mind'],
  ['shoonya_1',       'Shoonya 1'],
  ['shoonya_2',       'Shoonya 2'],
  ['sck_2',           'SCK'],
  ['shambhavi_2',     'Shambhavi 2'],
  ['crash_course',    'Crash Course'],
  ['sukha_kriya',     'Sukha Kriya'],
  ['aum_chanting',    'Aum chanting'],
  ['hanuman_chalisa', 'Hanuman Chalisa'],
  ['hrhk',            'HRHK'],
  ['gym',             'Gym'],
  ['workout',         'Workout'],
  ['steps',           'No. of steps'],
  ['heart_points',    'No. of heart points'],
  ['aum_namo',        'Aum namo bhagavate vasudevaya'],
  ['devi_stuti',      'Devi Stuti'],
  ['devi_dandam',     'Devi Dandam'],
  ['reading',         'Reading a book'],
  ['which_book',      'If yes, which book?'],
  ['words_pages',     'How many words and pages?'],
  ['reading_minutes', 'How many minutes?'],
  ['breakfast_food',  'Breakfast'],
  ['lunch_food',      'Lunch'],
  ['snack_food',      'Snack'],
  ['dinner_food',     'Dinner'],
  ['breakfast_notes', 'Breakfast'],
  ['lunch_notes',     'Lunch'],
  ['snack_notes',     'Snack'],
  ['dinner_notes',    'Dinner'],
  ['bhairavi',        'Bhairavi Sadhana'],
  ['sunlight',        '10 mins of sunlight?'],
  ['walk_breakfast',  'Walk for 10 mins after breakfast?'],
  ['walk_lunch',      'Walk for 10 mins after lunch?'],
  ['walk_dinner',     'Walk for 10 mins after dinner?'],
  ['supplements',     'Took Supplements?'],
  ['ekadashi',        'Ekadashi'],
  ['writing',         '15 mins of writing by hand'],
]

export const KEYS = COLUMN_MAP.map(([k]) => k)

export const YES_NO_KEYS = new Set([
  'guru_pooja','rayara_matha','upa_yoga','yoga_namaskar','surya_kriya','asanas',
  'sck_1','shambhavi_1','ishanga','naadi_shuddhi','miracle_of_mind',
  'shoonya_1','shoonya_2','sck_2','shambhavi_2','crash_course','sukha_kriya',
  'aum_chanting','hanuman_chalisa','hrhk','gym','workout',
  'aum_namo','devi_stuti','devi_dandam','reading',
  'bhairavi','sunlight','walk_breakfast','walk_lunch','walk_dinner',
  'supplements','ekadashi','writing',
])

export const NUMERIC_KEYS = new Set(['ashwat_count','steps','heart_points','reading_minutes','sleep_quality'])

const QUALITY_MAP = { good:4, great:5, ok:3, bad:2, poor:1, excellent:5 }

// Handles multiple date formats Google Sheets may export:
// DD/MM/YYYY, MM/DD/YYYY, D/M/YYYY, YYYY-MM-DD, "Jan 1, 2026", "1-Jan-2026", etc.
const DATE_FORMATS = [
  'dd/MM/yyyy',   // 01/01/2026  ← user's format
  'd/M/yyyy',     // 1/1/2026
  'MM/dd/yyyy',   // 01/01/2026 (US)
  'yyyy-MM-dd',   // 2026-01-01
  'MMM d, yyyy',  // Jan 1, 2026
  'MMMM d, yyyy', // January 1, 2026
  'd MMM yyyy',   // 1 Jan 2026
  'd-MMM-yyyy',   // 1-Jan-2026
  'dd-MM-yyyy',   // 01-01-2026
]
const REF = new Date(2026, 0, 1)

function parseDateToISO(str) {
  const s = String(str ?? '').trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s  // already ISO
  for (const fmt of DATE_FORMATS) {
    const d = dateParse(s, fmt, REF)
    if (isValid(d)) return d.toISOString().slice(0, 10)
  }
  return s  // return as-is if unparseable
}

function normaliseRow(raw) {
  const entry = {}
  COLUMN_MAP.forEach(([key], i) => {
    entry[key] = raw[i] ?? ''
  })

  // Normalise date to ISO YYYY-MM-DD regardless of sheet export format
  entry.date = parseDateToISO(entry.date)

  // null = no data entered, true = Yes, false = No
  YES_NO_KEYS.forEach(k => {
    const v = String(entry[k] ?? '').trim().toLowerCase()
    if (!v) entry[k] = null
    else entry[k] = v === 'yes' || v === 'y' || v === 'true' || v === '1' || v === '✓'
  })

  NUMERIC_KEYS.forEach(k => {
    if (k === 'sleep_quality') {
      const s = String(entry[k] ?? '').trim().toLowerCase()
      entry[k] = QUALITY_MAP[s] ?? (parseFloat(s) || null)
    } else {
      entry[k] = parseFloat(String(entry[k] ?? '').replace(',', '')) || 0
    }
  })

  return entry
}

async function fetchTab(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not load sheet. Make sure it is set to public (Anyone with link → Viewer).')
  const text = await res.text()
  const { data } = Papa.parse(text, { skipEmptyLines: true })
  if (!data || data.length < 2) return []
  return data.slice(1).map(normaliseRow)
}

export async function fetchSheetData() {
  const [q1, q2] = await Promise.all([
    fetchTab('/sheet-q1'),
    fetchTab('/sheet-q2'),
  ])
  return [...q1, ...q2]
    .filter(r => r.date)
    .sort((a, b) => (a.date > b.date ? 1 : -1))
}

// Returns { headers, rows } as raw strings for generic display
export async function fetchQ2Daily() {
  const res = await fetch('/sheet-q2-daily')
  if (!res.ok) return { headers: [], rows: [] }
  const text = await res.text()
  const { data } = Papa.parse(text, { skipEmptyLines: true })
  if (!data || data.length < 1) return { headers: [], rows: [] }
  return { headers: data[0], rows: data.slice(1) }
}

// Q1: Jan–Mar, Q2: Apr–Jun  (dates are already ISO YYYY-MM-DD after normaliseRow)
export function splitByQuarter(data) {
  return {
    q1: data.filter(r => r.date >= '2026-01-01' && r.date <= '2026-03-31'),
    q2: data.filter(r => r.date >= '2026-04-01' && r.date <= '2026-06-30'),
  }
}

export const Q1_TOTAL_DAYS = 90   // Jan(31) + Feb(28) + Mar(31)

export function q2ElapsedDays() {
  const start = new Date('2026-04-01')
  const today = new Date()
  return Math.max(1, Math.min(91, Math.floor((today - start) / 86400000) + 1))
}

// Export a single entry as a CSV row in the exact sheet column order
export function exportRowAsCSV(entry, dateStr) {
  const values = COLUMN_MAP.map(([key]) => {
    if (key === 'date') return dateStr
    const val = entry[key]
    if (val === null || val === undefined) return ''
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    return val
  })
  return values.map(v => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s
  }).join(',')
}

export function downloadCSV(csvRow, dateStr) {
  const headers = COLUMN_MAP.map(([, h]) => h).join(',')
  const blob = new Blob([headers + '\n' + csvRow], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `habit-${dateStr}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
