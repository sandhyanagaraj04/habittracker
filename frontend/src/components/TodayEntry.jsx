import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Check, Loader2, Save } from 'lucide-react'
import { saveEntry } from '../api'
import { LABEL_MAP } from '../utils/transform'

const today = format(new Date(), 'yyyy-MM-dd')

const SECTIONS = [
  {
    title: '😴 Sleep',
    fields: [
      { key: 'place',          type: 'text',   label: 'Place' },
      { key: 'wake_up_time',   type: 'time',   label: 'Wake Up Time' },
      { key: 'sleeping_time',  type: 'time',   label: 'Bedtime (previous night)' },
      { key: 'sleep_duration', type: 'text',   label: 'Sleep Duration (e.g. 7:30)' },
      { key: 'sleep_quality',  type: 'number', label: 'Sleep Quality (1–5)', min: 1, max: 5 },
    ],
  },
  {
    title: '🕉️ Sadhana',
    fields: [
      { key: 'upa_yoga',        type: 'yesno' },
      { key: 'yoga_namaskar',   type: 'yesno' },
      { key: 'surya_kriya',     type: 'yesno' },
      { key: 'asanas',          type: 'yesno' },
      { key: 'sck_1',           type: 'yesno' },
      { key: 'shambhavi_1',     type: 'yesno' },
      { key: 'ishanga',         type: 'yesno' },
      { key: 'naadi_shuddhi',   type: 'yesno' },
      { key: 'miracle_of_mind', type: 'yesno' },
      { key: 'shoonya_1',       type: 'yesno' },
      { key: 'shoonya_2',       type: 'yesno' },
      { key: 'sck_2',           type: 'yesno' },
      { key: 'shambhavi_2',     type: 'yesno' },
      { key: 'crash_course',    type: 'yesno' },
      { key: 'sukha_kriya',     type: 'yesno' },
      { key: 'bhairavi',        type: 'yesno' },
    ],
  },
  {
    title: '🙏 Spiritual Practices',
    fields: [
      { key: 'guru_pooja',      type: 'yesno' },
      { key: 'rayara_matha',    type: 'yesno' },
      { key: 'ashwat_count',    type: 'number', label: 'Ashwat Pradakshina Count', min: 0 },
      { key: 'aum_chanting',    type: 'yesno' },
      { key: 'hanuman_chalisa', type: 'yesno' },
      { key: 'hrhk',            type: 'yesno' },
      { key: 'aum_namo',        type: 'yesno' },
      { key: 'devi_stuti',      type: 'yesno' },
      { key: 'devi_dandam',     type: 'yesno' },
      { key: 'ekadashi',        type: 'yesno' },
    ],
  },
  {
    title: '🏋️ Fitness',
    fields: [
      { key: 'gym',          type: 'yesno' },
      { key: 'workout',      type: 'yesno' },
      { key: 'steps',        type: 'number', label: 'No. of Steps', min: 0 },
      { key: 'heart_points', type: 'number', label: 'Heart Points', min: 0 },
    ],
  },
  {
    title: '📚 Reading',
    fields: [
      { key: 'reading',         type: 'yesno' },
      { key: 'which_book',      type: 'text',   label: 'Which Book?' },
      { key: 'words_pages',     type: 'text',   label: 'Words / Pages' },
      { key: 'reading_minutes', type: 'number', label: 'Minutes Read', min: 0 },
    ],
  },
  {
    title: '🥗 Meals',
    fields: [
      { key: 'breakfast_food',  type: 'text', label: 'Breakfast — What I ate' },
      { key: 'breakfast_notes', type: 'text', label: 'Breakfast — Notes' },
      { key: 'lunch_food',      type: 'text', label: 'Lunch — What I ate' },
      { key: 'lunch_notes',     type: 'text', label: 'Lunch — Notes' },
      { key: 'snack_food',      type: 'text', label: 'Snack — What I ate' },
      { key: 'snack_notes',     type: 'text', label: 'Snack — Notes' },
      { key: 'dinner_food',     type: 'text', label: 'Dinner — What I ate' },
      { key: 'dinner_notes',    type: 'text', label: 'Dinner — Notes' },
    ],
  },
  {
    title: '🌿 Health & Wellness',
    fields: [
      { key: 'sunlight',       type: 'yesno' },
      { key: 'walk_breakfast', type: 'yesno' },
      { key: 'walk_lunch',     type: 'yesno' },
      { key: 'walk_dinner',    type: 'yesno' },
      { key: 'supplements',    type: 'yesno' },
      { key: 'writing',        type: 'yesno' },
    ],
  },
]

function YesNoToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-border text-xs font-medium">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-3 py-1.5 transition-all ${value === true
          ? 'bg-emerald-500/20 text-emerald-400 border-r border-emerald-500/20'
          : 'text-slate-500 hover:text-slate-300 border-r border-border'}`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 transition-all ${value === false
          ? 'bg-rose-500/20 text-rose-400'
          : 'text-slate-500 hover:text-slate-300'}`}
      >
        No
      </button>
    </div>
  )
}

export default function TodayEntry({ today: existingEntry, onSaved }) {
  const [form, setForm] = useState({ date: today })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (existingEntry) setForm({ ...existingEntry })
    else setForm({ date: today })
  }, [existingEntry])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await saveEntry(form)
      setSaved(true)
      onSaved()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Log Today</h1>
          <p className="text-slate-400 text-sm mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save to Sheet'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <Check size={14} /> Saved to Google Sheet successfully!
        </div>
      )}

      {SECTIONS.map(({ title, fields }) => (
        <div key={title} className="card space-y-4">
          <p className="font-semibold text-white text-sm">{title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, type, label, min, max }) => {
              const lbl = label ?? LABEL_MAP[key] ?? key

              if (type === 'yesno') {
                return (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <label className="text-sm text-slate-300">{lbl}</label>
                    <YesNoToggle value={form[key] ?? null} onChange={v => set(key, v)} />
                  </div>
                )
              }

              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500">{lbl}</label>
                  <input
                    type={type === 'number' ? 'number' : type === 'time' ? 'time' : 'text'}
                    value={form[key] ?? ''}
                    onChange={e => set(key, e.target.value)}
                    min={min}
                    max={max}
                    className="w-full"
                    placeholder={type === 'number' ? '0' : ''}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save to Google Sheet'}
        </button>
      </div>
    </form>
  )
}
