import { format, parseISO, isValid } from 'date-fns'

export const SADHANA_KEYS = [
  'upa_yoga', 'yoga_namaskar', 'surya_kriya', 'asanas',
  'sck_1', 'shambhavi_1', 'ishanga', 'naadi_shuddhi', 'miracle_of_mind',
  'shoonya_1', 'shoonya_2', 'sck_2', 'shambhavi_2', 'crash_course',
  'sukha_kriya', 'bhairavi',
]

export const SPIRITUAL_KEYS = [
  'guru_pooja', 'rayara_matha', 'ashwat_count',
  'aum_chanting', 'hanuman_chalisa', 'hrhk',
  'aum_namo', 'devi_stuti', 'devi_dandam', 'ekadashi',
]

export const FITNESS_KEYS = ['gym', 'workout']

export const HEALTH_KEYS = [
  'sunlight', 'walk_breakfast', 'walk_lunch', 'walk_dinner',
  'supplements', 'writing',
]

export const YESNO_ALL = [
  ...SADHANA_KEYS,
  ...SPIRITUAL_KEYS,
  ...FITNESS_KEYS,
  ...HEALTH_KEYS,
  'reading',
]

export const LABEL_MAP = {
  upa_yoga:        'Upa Yoga',
  yoga_namaskar:   'Yoga Namaskar',
  surya_kriya:     'Surya Kriya',
  asanas:          'Asanas',
  sck_1:           'SCK (Session 1)',
  shambhavi_1:     'Shambhavi 1',
  ishanga:         'Ishanga 7%',
  naadi_shuddhi:   'Naadi Shuddhi',
  miracle_of_mind: 'Miracle of Mind',
  shoonya_1:       'Shoonya 1',
  shoonya_2:       'Shoonya 2',
  sck_2:           'SCK (Session 2)',
  shambhavi_2:     'Shambhavi 2',
  crash_course:    'Crash Course',
  sukha_kriya:     'Sukha Kriya',
  bhairavi:        'Bhairavi Sadhana',
  guru_pooja:      'Guru Pooja',
  rayara_matha:    'Rayara Matha Visit',
  ashwat_count:    'Ashwat Pradakshina',
  aum_chanting:    'Aum Chanting',
  hanuman_chalisa: 'Hanuman Chalisa',
  hrhk:            'HRHK',
  aum_namo:        'Aum Namo Bhagavate',
  devi_stuti:      'Devi Stuti',
  devi_dandam:     'Devi Dandam',
  ekadashi:        'Ekadashi',
  gym:             'Gym',
  workout:         'Workout',
  steps:           'Steps',
  heart_points:    'Heart Points',
  sunlight:        '☀️ 10 min Sunlight',
  walk_breakfast:  'Walk after Breakfast',
  walk_lunch:      'Walk after Lunch',
  walk_dinner:     'Walk after Dinner',
  supplements:     'Supplements',
  writing:         '✍️ 15 min Writing',
  reading:         'Reading a Book',
  which_book:      'Which Book?',
  words_pages:     'Words / Pages',
  reading_minutes: 'Minutes',
  breakfast_food:  'Breakfast',
  lunch_food:      'Lunch',
  snack_food:      'Snack',
  dinner_food:     'Dinner',
  breakfast_notes: 'Breakfast Notes',
  lunch_notes:     'Lunch Notes',
  snack_notes:     'Snack Notes',
  dinner_notes:    'Dinner Notes',
  sleep_quality:   'Sleep Quality',
  sleep_duration:  'Sleep Duration',
  wake_up_time:    'Wake Up Time',
  sleeping_time:   'Bedtime',
  place:           'Place',
}

export function fmtDate(dateStr) {
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'dd MMM yyyy') : dateStr
  } catch {
    return dateStr
  }
}

export function calcStreak(data, key) {
  let streak = 0
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][key]) streak++
    else break
  }
  return streak
}

export function completionRate(data, keys) {
  if (!data.length) return 0
  const total = data.length * keys.length
  const done = data.reduce((acc, row) => acc + keys.filter(k => row[k]).length, 0)
  return Math.round((done / total) * 100)
}

export function parseSleepDuration(raw) {
  if (!raw) return null
  const s = String(raw).trim()
  // "7:30" or "7.5" or "7h 30m" or "7"
  const hm = s.match(/^(\d+)[h:](\d+)/)
  if (hm) return parseFloat(hm[1]) + parseFloat(hm[2]) / 60
  const dec = parseFloat(s)
  return isNaN(dec) ? null : dec
}
