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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5"
      style={{ background: 'rgba(10,14,24,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'text-blue-300' : 'text-white/40 hover:text-white/70'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'rgba(59,130,246,0.18)' }
              : {}
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