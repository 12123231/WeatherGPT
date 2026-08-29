import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, AlertTriangle, Map, Settings, CloudSun, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/chat',      label: 'AI Chat',     icon: MessageSquare },
  { to: '/forecast',  label: 'Forecast',    icon: Calendar },
  { to: '/risk',      label: 'Risk Alerts', icon: AlertTriangle },
  { to: '/map',       label: 'Map',         icon: Map },
  { to: '/settings',  label: 'Settings',    icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-20 xl:w-64 h-screen sticky top-0 z-20 bg-slate-950/60 backdrop-blur-2xl border-r border-white/10 shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 xl:px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-600/25 border border-blue-400/30 text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
          <CloudSun size={22} />
        </div>
        <div className="hidden xl:block">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">WeatherGPT</h1>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded-full border border-blue-400/30">
              <Sparkles size={8} /> v2.0
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">AI Weather Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 xl:px-3 py-5 space-y-1.5 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 justify-center xl:justify-start group ${
                isActive
                  ? 'bg-blue-500/20 text-white border border-blue-400/35 shadow-lg shadow-blue-500/10 backdrop-blur-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'text-slate-400'
                  }`}
                />
                <span className="hidden xl:inline">{label}</span>
                {isActive && (
                  <span className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Footer Status */}
      <div className="px-3 xl:px-6 py-4 border-t border-white/10">
        <div className="hidden xl:flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400">SIH 2026 Engine</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            ONLINE
          </span>
        </div>
        <p className="hidden xl:block text-[11px] mt-1 text-slate-400">Atmospheric Telemetry Active</p>
      </div>
    </aside>
  );
}