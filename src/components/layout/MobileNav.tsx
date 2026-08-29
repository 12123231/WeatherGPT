import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, AlertTriangle, Map, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { to: '/chat',      label: 'Chat',     icon: MessageSquare },
  { to: '/forecast',  label: 'Forecast', icon: Calendar },
  { to: '/risk',      label: 'Alerts',   icon: AlertTriangle },
  { to: '/map',       label: 'Map',      icon: Map },
  { to: '/settings',  label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 bg-[#0d1322]/90 backdrop-blur-2xl border-t border-white/[0.07]"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-sky-400 font-semibold'
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