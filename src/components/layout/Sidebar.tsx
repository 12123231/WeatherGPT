import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, AlertTriangle, Map, Settings, CloudSun } from 'lucide-react';

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
    <aside
      className="hidden lg:flex lg:flex-col lg:w-20 xl:w-60 h-screen sticky top-0 z-20"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-3 px-4 xl:px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(99,179,237,0.3)', color: '#93c5fd' }}>
          <CloudSun size={20} />
        </div>
        <div className="hidden xl:block">
          <h1 className="text-base font-bold text-white leading-tight">WeatherGPT</h1>
          <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>AI Weather Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-2 xl:px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 justify-center xl:justify-start ${
                isActive ? 'text-blue-300' : 'hover:text-white/80'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(99,179,237,0.25)', color: '#93c5fd' }
              : { border: '1px solid transparent', color: 'rgba(255,255,255,0.5)' }
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden xl:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 xl:px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="hidden xl:flex items-center justify-between text-xs">
          <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>SIH 2026</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(99,179,237,0.25)' }}>MVP</span>
        </div>
        <p className="hidden xl:block text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Prototype Interface</p>
      </div>
    </aside>
  );
}