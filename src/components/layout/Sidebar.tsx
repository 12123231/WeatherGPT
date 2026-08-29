import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, AlertTriangle, Map, Settings, CloudSun } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/chat',      label: 'AI Chat',     icon: MessageSquare },
  { to: '/forecast',  label: 'Forecast',    icon: Calendar },
  { to: '/risk',      label: 'Risk Alerts', icon: AlertTriangle },
  { to: '/map',       label: 'Map & Radar', icon: Map },
  { to: '/settings',  label: 'Settings',    icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-20 xl:w-60 h-screen sticky top-0 z-20 bg-[#0d1322]/80 backdrop-blur-2xl border-r border-white/[0.07] shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 xl:px-5 py-5 border-b border-white/[0.07]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sky-400 shrink-0">
          <CloudSun size={20} />
        </div>
        <div className="hidden xl:block min-w-0">
          <h1 className="text-sm font-bold text-white tracking-tight leading-none">WeatherGPT</h1>
          <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">Intelligence Matrix</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 xl:px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 justify-center xl:justify-start ${
                isActive
                  ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.035] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="hidden xl:inline">{label}</span>
                {isActive && (
                  <span className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Telemetry Status */}
      <div className="px-3 xl:px-5 py-4 border-t border-white/[0.07]">
        <div className="hidden xl:flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Doppler Telemetry</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </div>
    </aside>
  );
}