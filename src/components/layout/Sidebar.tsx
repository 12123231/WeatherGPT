import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Map,
  Settings,
  CloudSun,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/forecast', label: 'Forecast', icon: Calendar },
  { to: '/risk', label: 'Risk Alerts', icon: AlertTriangle },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-xs">
          <CloudSun size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">WeatherGPT</h1>
          <p className="text-xs text-slate-500 font-medium">AI Weather Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">SIH 2026</span>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">MVP</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Prototype Interface</p>
      </div>
    </aside>
  );
}
