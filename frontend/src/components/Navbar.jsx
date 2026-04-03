import { LayoutDashboard, PenLine, BarChart2, History, Flame, TableProperties } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log',       label: 'Log Today', icon: PenLine },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'q2daily',   label: 'Q2 Daily',  icon: TableProperties },
  { id: 'history',   label: 'History',   icon: History },
]

export default function Navbar({ tab, setTab }) {
  return (
    <nav className="w-56 flex-shrink-0 border-r border-border flex flex-col bg-bg-card/50">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron to-spirit flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">Sadhana</p>
            <p className="text-xs text-slate-500 leading-tight">Tracker 2026</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-saffron/10 text-saffron border border-saffron/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-bg-hover'}`}>
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-slate-600 leading-relaxed">
          Powered by<br />
          <span className="text-slate-500">Google Sheets</span>
        </p>
      </div>
    </nav>
  )
}
