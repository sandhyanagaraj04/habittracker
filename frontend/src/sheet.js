import Papa from 'papaparse'

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

function normaliseRow(raw) {
  const entry = {}
  COLUMN_MAP.forEach(([key], i) => {
    entry[key] = raw[i] ?? ''
  })

  YES_NO_KEYS.forEach(k => {
    const v = String(entry[k] ?? '').trim().toLowerCase()
    entry[k] = v === 'yes' || v === 'y' || v === 'true' || v === '1' || v === '✓'
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

export async function fetchSheetData() {
  const res = await fetch('/sheet-data')
  if (!res.ok) throw new Error('Could not load sheet. Make sure it is set to public (Anyone with link → Viewer).')
  const text = await res.text()
  const { data } = Papa.parse(text, { skipEmptyLines: true })
  if (!data || data.length < 2) return []
  return data.slice(1).map(normaliseRow)
}

// Export a single entry as a CSV row in the exact sheet column order
export function exportRowAsCSV(entry, dateStr) {
  const values = COLUMN_MAP.map(([key]) => {
    if (key === 'date') return dateStr
    const val = entry[key]
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    return val ?? ''
  })

  const escaped = values.map(v => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  })

  return escaped.join(',')
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
