import type { CurrentWeather as CurrentWeatherType, ForecastDay } from '../../types/weather';
import { getWeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatLastUpdated } from '../../utils/formatters';
import { MapPin, Clock, ArrowUp, ArrowDown, Activity, Sparkles } from 'lucide-react';

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  todayForecast?: ForecastDay;
  className?: string;
}

export default function CurrentWeather({
  weather,
  todayForecast,
  className = '',
}: CurrentWeatherProps) {
  const WeatherIcon = getWeatherIcon(weather.condition.icon);

  // Icon glow palette
  const getIconAura = () => {
    const icon = (weather.condition.icon || '').toLowerCase();
    if (icon.includes('sun')) return 'from-amber-500/30 to-orange-600/10 text-amber-400 border-amber-400/30 shadow-amber-500/20';
    if (icon.includes('storm') || icon.includes('lightning')) return 'from-indigo-500/30 to-purple-600/15 text-indigo-300 border-indigo-400/30 shadow-indigo-500/20';
    if (icon.includes('rain')) return 'from-sky-500/30 to-blue-600/15 text-sky-300 border-sky-400/30 shadow-sky-500/20';
    return 'from-slate-500/20 to-slate-700/10 text-slate-300 border-slate-400/20 shadow-slate-500/10';
  };

  const auraStyle = getIconAura();

  return (
    <div
      className={`glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:border-white/15 ${className}`}
    >
      {/* Ambient Internal Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Location Badge & Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-inner">
            <MapPin size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
                {weather.location}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full">
                {weather.country}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {weather.region} • Regional Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium glass-pill px-3 py-1.5 rounded-full shadow-xs">
            <Clock size={12} className="text-blue-400" />
            <span>{formatLastUpdated(weather.lastUpdated)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-400/25 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </div>
        </div>
      </div>

      {/* Main Temperature & Weather Display Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-4 relative z-10">
        <div>
          {/* Large Temperature with High / Low Pills (Inspired by Reference 1) */}
          <div className="flex items-baseline gap-4">
            <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-sm">
              {formatTemp(weather.temperature)}
            </span>

            {todayForecast && (
              <div className="flex flex-col gap-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1 bg-white/[0.06] border border-white/10 text-slate-200 px-2.5 py-0.5 rounded-lg">
                  <span className="text-rose-400 font-bold">H</span> {formatTemp(todayForecast.high)}
                </span>
                <span className="flex items-center gap-1 bg-white/[0.06] border border-white/10 text-slate-300 px-2.5 py-0.5 rounded-lg">
                  <span className="text-sky-400 font-bold">L</span> {formatTemp(todayForecast.low)}
                </span>
              </div>
            )}
          </div>

          {/* Condition Heading (Inspired by Reference 1) */}
          <div className="mt-3 space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {weather.condition.description
                ? weather.condition.description.charAt(0).toUpperCase() + weather.condition.description.slice(1)
                : weather.condition.main}
            </h3>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-400" />
              <span>Current atmospheric state: </span>
              <strong className="text-slate-200">{weather.condition.main}</strong>
            </p>
          </div>
        </div>

        {/* Condition Icon Glowing Capsule */}
        <div className={`flex flex-col items-center justify-center p-5 sm:p-6 bg-gradient-to-br ${auraStyle} rounded-3xl border shadow-xl backdrop-blur-xl shrink-0 group transition-transform duration-300 hover:scale-105`}>
          <WeatherIcon className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_16px_rgba(255,255,255,0.2)]" />
        </div>
      </div>

      {/* Footer Metrics Row: Feels Like, High, Low, Atmosphere Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10 mt-6 text-xs relative z-10">
        <div className="glass-pill p-3 rounded-2xl">
          <span className="text-slate-400 block text-[11px] font-medium">Feels Like</span>
          <span className="font-extrabold text-white text-base mt-0.5 block">
            {formatTemp(weather.feelsLike)}
          </span>
        </div>

        {todayForecast ? (
          <>
            <div className="glass-pill p-3 rounded-2xl">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
                <ArrowUp size={12} className="text-rose-400" /> Peak High
              </span>
              <span className="font-extrabold text-white text-base mt-0.5 block">
                {formatTemp(todayForecast.high)}
              </span>
            </div>

            <div className="glass-pill p-3 rounded-2xl">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
                <ArrowDown size={12} className="text-sky-400" /> Base Low
              </span>
              <span className="font-extrabold text-white text-base mt-0.5 block">
                {formatTemp(todayForecast.low)}
              </span>
            </div>
          </>
        ) : (
          <div className="glass-pill p-3 rounded-2xl col-span-2">
            <span className="text-slate-400 block text-[11px] font-medium">Thermal Range</span>
            <span className="font-extrabold text-white text-base mt-0.5 block">Stable Gradient</span>
          </div>
        )}

        <div className="glass-pill p-3 rounded-2xl">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
            <Activity size={12} className="text-emerald-400" /> Status
          </span>
          <span className="font-extrabold text-emerald-300 text-base mt-0.5 block">
            Optimal
          </span>
        </div>
      </div>
    </div>
  );
}
