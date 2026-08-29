import type { CurrentWeather as CurrentWeatherType, ForecastDay } from '../../types/weather';
import { WeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatLastUpdated } from '../../utils/formatters';
import { MapPin, Clock, ArrowUp, ArrowDown, Activity } from 'lucide-react';

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
  // Subtle weather condition accent colors
  const getIconColor = () => {
    const icon = (weather.condition.icon || '').toLowerCase();
    if (icon.includes('sun')) return 'text-amber-400';
    if (icon.includes('storm') || icon.includes('lightning')) return 'text-indigo-400';
    if (icon.includes('rain')) return 'text-sky-400';
    return 'text-slate-300';
  };

  const conditionText = weather.condition.description
    ? weather.condition.description.charAt(0).toUpperCase() + weather.condition.description.slice(1)
    : weather.condition.main;

  return (
    <div
      className={`glass-panel rounded-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Top Bar: Location & Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center">
            <MapPin size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none">
                {weather.location}
              </h2>
              <span className="text-[11px] font-medium text-slate-400">
                {weather.country}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {weather.region}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            <span>{formatLastUpdated(weather.lastUpdated)}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </div>

      {/* Main Temperature & Weather Display Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-5 relative z-10">
        <div>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl sm:text-7xl font-light text-white tracking-tighter">
              {formatTemp(weather.temperature)}
            </span>

            {todayForecast && (
              <div className="flex flex-col gap-1 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <ArrowUp size={12} className="text-rose-400" />
                  <span className="text-slate-400">H:</span> {formatTemp(todayForecast.high)}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowDown size={12} className="text-sky-400" />
                  <span className="text-slate-400">L:</span> {formatTemp(todayForecast.low)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1">
            <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              {conditionText}
            </h3>
            <p className="text-xs text-slate-400">
              Atmospheric condition: <span className="text-slate-300 font-medium">{weather.condition.main}</span>
            </p>
          </div>
        </div>

        {/* Condition Icon */}
        <div className="flex items-center justify-center p-5 rounded-2xl bg-white/[0.025] border border-white/[0.05] shrink-0">
          <WeatherIcon
            icon={weather.condition.icon}
            className={`w-20 h-20 sm:w-22 sm:h-22 ${getIconColor()}`}
          />
        </div>
      </div>

      {/* Sub-Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/[0.07] mt-6 text-xs relative z-10">
        <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
          <span className="text-slate-400 block text-[11px] font-medium">Feels Like</span>
          <span className="font-semibold text-white text-base mt-1 block">
            {formatTemp(weather.feelsLike)}
          </span>
        </div>

        {todayForecast ? (
          <>
            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
                <ArrowUp size={12} className="text-rose-400" /> High
              </span>
              <span className="font-semibold text-white text-base mt-1 block">
                {formatTemp(todayForecast.high)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
                <ArrowDown size={12} className="text-sky-400" /> Low
              </span>
              <span className="font-semibold text-white text-base mt-1 block">
                {formatTemp(todayForecast.low)}
              </span>
            </div>
          </>
        ) : (
          <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05] col-span-2">
            <span className="text-slate-400 block text-[11px] font-medium">Thermal State</span>
            <span className="font-semibold text-white text-base mt-1 block">Nominal</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
            <Activity size={12} className="text-emerald-400" /> Status
          </span>
          <span className="font-semibold text-emerald-400 text-base mt-1 block">
            Optimal
          </span>
        </div>
      </div>
    </div>
  );
}
