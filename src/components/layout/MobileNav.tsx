import { NavLink } from 'react-router-dom';
import { Home, MapPin, Target, BarChart2, MessageSquare, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Home',     icon: Home },
  { to: '/map',       label: 'Map',      icon: MapPin },
  { to: '/risk',      label: 'Alerts',   icon: Target },
  { to: '/forecast',  label: 'Forecast', icon: BarChart2 },
  { to: '/chat',      label: 'AI Chat',  icon: MessageSquare },
  { to: '/settings',  label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 bg-[#1c1d21]/95 backdrop-blur-2xl border-t border-white/[0.08]"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon size={18} className="mb-0.5" />
            <span className="text-[10px] tracking-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}