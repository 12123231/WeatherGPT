import { NavLink } from 'react-router-dom';
import { Home, MapPin, Target, BarChart2, Settings, MessageSquare, RotateCw } from 'lucide-react';
import { useWeatherContext } from '../../context/useWeatherContext';
import { formatLastUpdated } from '../../utils/formatters';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/map',       label: 'Map & Radar', icon: MapPin },
  { to: '/risk',      label: 'Risk Alerts', icon: Target },
  { to: '/forecast',  label: 'Forecast', icon: BarChart2 },
  { to: '/chat',      label: 'AI Chat', icon: MessageSquare },
  { to: '/settings',  label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { refresh, loading, currentWeather } = useWeatherContext();

  return (
    <aside className="hidden lg:flex lg:flex-col items-center justify-between w-20 py-7 px-3 sticky top-0 h-screen z-30 shrink-0 select-none bg-transparent">
      {/* Top Brand / Spacer */}
      <div className="w-10 h-10" />

      {/* Main Navigation Stack */}
      <nav className="flex flex-col items-center gap-3.5 my-auto" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`
            }
          >
            {({ isActive }) => (
              <Icon
                size={20}
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-105 text-white' : 'text-slate-400'
                }`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Telemetry Status & Refresh Action */}
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={refresh}
          title="Refresh meteorological telemetry"
          aria-label="Refresh telemetry"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer mb-1"
        >
          <RotateCw
            size={16}
            className={`transition-transform ${loading ? 'animate-spin text-sky-400' : ''}`}
          />
        </button>
        <span className="text-[10px] text-slate-500 font-medium tracking-tight">Updated</span>
        <span className="text-[10px] text-slate-300 font-normal mt-0.5 whitespace-nowrap">
          {currentWeather ? formatLastUpdated(currentWeather.lastUpdated) : 'Just now'}
        </span>
      </div>
    </aside>
  );
}