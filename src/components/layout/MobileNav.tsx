import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Map,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/forecast', label: 'Forecast', icon: Calendar },
  { to: '/risk', label: 'Alerts', icon: AlertTriangle },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Icon size={20} className="mb-0.5" />
            <span className="text-[10px] tracking-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
