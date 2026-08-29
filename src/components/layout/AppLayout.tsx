import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { CloudSun } from 'lucide-react';
import { useWeatherContext } from '../../context/useWeatherContext';

export default function AppLayout() {
  const { currentWeather } = useWeatherContext();

  const getAtmosphereConfig = () => {
    if (!currentWeather) {
      return {
        theme: 'default',
        glowClass: 'weather-glow-night',
        ambientOrb1: 'from-sky-500/8 via-indigo-950/5 to-transparent',
        ambientOrb2: 'from-blue-600/6 via-slate-950/10 to-transparent',
      };
    }

    const icon = (currentWeather.condition?.icon || '').toLowerCase();
    const main = (currentWeather.condition?.main || '').toLowerCase();

    if (icon.includes('storm') || icon.includes('lightning') || main.includes('thunder') || main.includes('storm')) {
      return {
        theme: 'storm',
        glowClass: 'weather-glow-storm',
        ambientOrb1: 'from-indigo-600/10 via-purple-950/8 to-transparent',
        ambientOrb2: 'from-violet-500/8 via-slate-950/20 to-transparent',
      };
    }

    if (icon.includes('rain') || icon.includes('drizzle') || main.includes('rain') || main.includes('drizzle')) {
      return {
        theme: 'rain',
        glowClass: 'weather-glow-rain',
        ambientOrb1: 'from-sky-500/10 via-blue-950/8 to-transparent',
        ambientOrb2: 'from-cyan-500/8 via-slate-950/20 to-transparent',
      };
    }

    if (icon.includes('sun') || main.includes('clear') || main.includes('sunny')) {
      return {
        theme: 'sunny',
        glowClass: 'weather-glow-sun',
        ambientOrb1: 'from-amber-500/10 via-orange-950/6 to-transparent',
        ambientOrb2: 'from-amber-400/6 via-slate-950/15 to-transparent',
      };
    }

    if (icon.includes('cloud') || main.includes('cloud') || main.includes('mist') || main.includes('fog') || main.includes('haze')) {
      return {
        theme: 'cloudy',
        glowClass: 'weather-glow-cloud',
        ambientOrb1: 'from-slate-500/10 via-slate-800/8 to-transparent',
        ambientOrb2: 'from-blue-400/5 via-slate-950/15 to-transparent',
      };
    }

    return {
      theme: 'night',
      glowClass: 'weather-glow-night',
      ambientOrb1: 'from-indigo-600/8 via-slate-900/10 to-transparent',
      ambientOrb2: 'from-blue-700/6 via-slate-950/15 to-transparent',
    };
  };

  const atmosphere = getAtmosphereConfig();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row relative bg-[#0b0f19] overflow-x-hidden selection:bg-sky-500/25 selection:text-sky-200">
      {/* Refined Atmospheric Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Atmospheric Ambient Glow Layer */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${atmosphere.glowClass}`} />

        {/* Ambient Organic Atmosphere Orbs */}
        <div
          className={`absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-br ${atmosphere.ambientOrb1} blur-[140px] animate-atmosphere pointer-events-none`}
        />
        <div
          className={`absolute top-1/3 -left-40 w-[550px] h-[550px] rounded-full bg-gradient-to-tr ${atmosphere.ambientOrb2} blur-[120px] animate-atmosphere pointer-events-none`}
          style={{ animationDelay: '-12s' }}
        />
      </div>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 bg-[#0b0f19]/85 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sky-400">
            <CloudSun size={17} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-none">WeatherGPT</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentWeather ? `${currentWeather.location} • ${currentWeather.temperature}°C` : 'Meteorological Intelligence'}
            </p>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 relative z-10 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}