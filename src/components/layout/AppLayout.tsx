import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { CloudSun, Sparkles } from 'lucide-react';
import { useWeatherContext } from '../../context/useWeatherContext';

export default function AppLayout() {
  const { currentWeather } = useWeatherContext();

  const getAtmosphereConfig = () => {
    if (!currentWeather) {
      return {
        theme: 'default',
        glowClass: 'weather-glow-night',
        primaryColor: 'rgba(59, 130, 246, 0.12)',
        accentColor: 'rgba(99, 102, 241, 0.08)',
        ambientOrb1: 'from-blue-600/15 via-indigo-900/10 to-transparent',
        ambientOrb2: 'from-sky-500/10 via-slate-900/20 to-transparent',
      };
    }

    const icon = (currentWeather.condition?.icon || '').toLowerCase();
    const main = (currentWeather.condition?.main || '').toLowerCase();

    if (icon.includes('storm') || icon.includes('lightning') || main.includes('thunder') || main.includes('storm')) {
      return {
        theme: 'storm',
        glowClass: 'weather-glow-storm',
        primaryColor: 'rgba(139, 92, 246, 0.18)',
        accentColor: 'rgba(99, 102, 241, 0.15)',
        ambientOrb1: 'from-indigo-600/20 via-purple-900/15 to-transparent',
        ambientOrb2: 'from-violet-500/15 via-slate-950/40 to-transparent',
      };
    }

    if (icon.includes('rain') || icon.includes('drizzle') || main.includes('rain') || main.includes('drizzle')) {
      return {
        theme: 'rain',
        glowClass: 'weather-glow-rain',
        primaryColor: 'rgba(56, 189, 248, 0.16)',
        accentColor: 'rgba(37, 99, 235, 0.12)',
        ambientOrb1: 'from-sky-600/20 via-blue-900/15 to-transparent',
        ambientOrb2: 'from-cyan-500/15 via-slate-950/30 to-transparent',
      };
    }

    if (icon.includes('sun') || main.includes('clear') || main.includes('sunny')) {
      return {
        theme: 'sunny',
        glowClass: 'weather-glow-sun',
        primaryColor: 'rgba(245, 158, 11, 0.16)',
        accentColor: 'rgba(234, 88, 12, 0.10)',
        ambientOrb1: 'from-amber-500/20 via-orange-950/15 to-transparent',
        ambientOrb2: 'from-amber-400/12 via-indigo-950/20 to-transparent',
      };
    }

    if (icon.includes('cloud') || main.includes('cloud') || main.includes('mist') || main.includes('fog') || main.includes('haze')) {
      return {
        theme: 'cloudy',
        glowClass: 'weather-glow-cloud',
        primaryColor: 'rgba(148, 163, 184, 0.14)',
        accentColor: 'rgba(71, 85, 105, 0.10)',
        ambientOrb1: 'from-slate-500/18 via-slate-800/15 to-transparent',
        ambientOrb2: 'from-blue-400/10 via-slate-950/30 to-transparent',
      };
    }

    return {
      theme: 'night',
      glowClass: 'weather-glow-night',
      primaryColor: 'rgba(99, 102, 241, 0.15)',
      accentColor: 'rgba(30, 27, 75, 0.2)',
      ambientOrb1: 'from-indigo-600/15 via-slate-900/20 to-transparent',
      ambientOrb2: 'from-blue-700/12 via-slate-950/30 to-transparent',
    };
  };

  const atmosphere = getAtmosphereConfig();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col lg:flex-row relative bg-[#070b14] overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Dynamic Weather Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep Atmospheric Base Gradient */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${atmosphere.glowClass}`} />

        {/* Ambient Organic Light Orbs (Floating Atmospheric Mood) */}
        <div
          className={`absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${atmosphere.ambientOrb1} blur-[120px] animate-atmosphere pointer-events-none`}
        />
        <div
          className={`absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr ${atmosphere.ambientOrb2} blur-[100px] animate-atmosphere pointer-events-none`}
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="absolute -bottom-40 right-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-t from-blue-950/20 to-transparent blur-[110px] pointer-events-none"
        />

        {/* Subtle Spatial Mesh Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 bg-slate-950/75 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 shadow-inner">
            <CloudSun size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-white tracking-tight">WeatherGPT</h1>
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded-full border border-blue-400/30">
                <Sparkles size={9} /> AI
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              {currentWeather ? `${currentWeather.location} • ${currentWeather.temperature}°C` : 'Intelligence Matrix'}
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