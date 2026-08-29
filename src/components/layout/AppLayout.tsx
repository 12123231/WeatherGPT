import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { CloudSun } from 'lucide-react';

export default function AppLayout() {
  return (
    <div className="min-h-screen text-white flex flex-col lg:flex-row" style={{ background: '#0b0f1a' }}>
      {/* Mobile Top Header */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
        style={{ background: 'rgba(10,14,24,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(99,179,237,0.3)', color: '#93c5fd' }}>
            <CloudSun size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">WeatherGPT</h1>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>SIH 2026 Prototype</p>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}