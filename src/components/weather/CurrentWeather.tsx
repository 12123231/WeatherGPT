import type { CurrentWeather as CurrentWeatherType, ForecastDay } from '../../types/weather';
import { getWeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatLastUpdated } from '../../utils/formatters';
import { MapPin, Clock, ArrowUp, ArrowDown } from 'lucide-react';

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

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden ${className}`}
    >
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Location & Timestamp */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {weather.location}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {weather.region}, {weather.country}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
          <Clock size={12} />
          <span>Updated {formatLastUpdated(weather.lastUpdated)}</span>
        </div>
      </div>

      {/* Main Temperature and Icon Display */}
      <div className="flex items-center justify-between my-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
              {formatTemp(weather.temperature)}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-base font-semibold text-slate-800">
              {weather.condition.main}
            </p>
            {weather.condition.description && (
              <p className="text-xs text-slate-500 capitalize">
                {weather.condition.description}
              </p>
            )}
          </div>
        </div>

        {/* Condition Icon */}
        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-2xl border border-slate-100 shadow-xs">
          <WeatherIcon className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600" />
        </div>
      </div>

      {/* Footer Details: Feels Like & High / Low */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 mt-6 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-slate-500 block">Feels Like</span>
          <span className="font-bold text-slate-800 text-sm">
            {formatTemp(weather.feelsLike)}
          </span>
        </div>

        {todayForecast ? (
          <>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-500 flex items-center gap-0.5">
                <ArrowUp size={12} className="text-rose-500" /> High
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {formatTemp(todayForecast.high)}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-slate-500 flex items-center gap-0.5">
                <ArrowDown size={12} className="text-blue-500" /> Low
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {formatTemp(todayForecast.low)}
              </span>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
            <span className="text-slate-500 block">Atmosphere</span>
            <span className="font-bold text-slate-800 text-sm">Stable</span>
          </div>
        )}
      </div>
    </div>
  );
}
