import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import WeatherAtmosphere from '../common/WeatherAtmosphere';
import { CloudSun } from 'lucide-react';
import { useWeatherContext } from '../../context/useWeatherContext';

export default function AppLayout() {
  const { currentWeather } = useWeatherContext();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row relative bg-[#18191c] overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Centralized Dynamic Weather Mood Atmosphere */}
      <WeatherAtmosphere />

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 bg-[#1c1d21]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.08] text-white">
            <CloudSun size={17} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-none">WeatherGPT</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentWeather ? `${currentWeather.location} • ${currentWeather.temperature}°` : 'Meteorological Intelligence'}
            </p>
          </div>
        </div>
      </header>

      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full pb-20 lg:pb-6 pr-0 lg:pr-6 pt-0 lg:pt-5 relative z-10 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
