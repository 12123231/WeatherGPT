import { useWeatherContext } from '../context/useWeatherContext';
import ForecastCard from '../components/weather/ForecastCard';
import LocationSearch from '../components/map/LocationSearch';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { WeatherIcon } from '../utils/weatherIcons';
import { formatTemp, formatRainProbability, formatWind } from '../utils/formatters';
import { mockHourlyForecast } from '../data/mockForecast';
import { Calendar, Clock, Droplets, Wind, Thermometer } from 'lucide-react';

export default function ForecastPage() {
  const {
    forecast,
    hourlyForecast,
    selectedLocation,
    loading,
    error,
    setLocation,
    refresh,
  } = useWeatherContext();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative z-10">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.07] relative z-30">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Extended Meteorological Forecast
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atmospheric projections & precipitation probabilities for <strong className="text-slate-200 font-medium">{selectedLocation.name}</strong>
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-72 relative z-20"
        />
      </div>

      {loading && forecast.length === 0 ? (
        <LoadingState message="Calculating predictive meteorological forecast..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          {/* Primary 3-Day Forecast */}
          <ForecastCard forecast={forecast} />

          {/* Today's 24h / Hourly Trend Section */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.07] space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Hourly Telemetry Outlook (Today)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time atmospheric trajectory throughout the day
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                24-Hour Cycle
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast : mockHourlyForecast).slice(0, 6).map((hour, idx) => (
                <div
                  key={`${hour.time}-${idx}`}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-between text-center gap-2 hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors"
                >
                  <span className="text-xs font-medium text-slate-400">
                    {hour.time}
                  </span>

                  <div className="p-1 rounded-lg">
                    <WeatherIcon icon={hour.condition.icon} size={22} className="text-sky-400" />
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {formatTemp(hour.temperature)}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-sky-400 font-medium">
                    <Droplets size={10} />
                    <span>{formatRainProbability(hour.rainProbability)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Daily Breakdown Table */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.07] space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.07]">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Detailed Daily Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">
                  Humidity, wind velocity, and temperature metrics
                </p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {forecast.map((day) => (
                <div
                  key={day.date}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div className="p-1.5 rounded-lg bg-white/[0.04]">
                      <WeatherIcon icon={day.condition.icon} size={18} className="text-sky-400 shrink-0" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block">
                        {day.day}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {day.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 text-slate-300 font-medium">
                    {day.condition.description || day.condition.main}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-300">
                    <div className="flex items-center gap-1">
                      <Thermometer size={12} className="text-rose-400" />
                      <span className="text-slate-400">High:</span> <strong className="text-white font-semibold">{formatTemp(day.high)}</strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <Thermometer size={12} className="text-sky-400" />
                      <span className="text-slate-400">Low:</span> <strong className="text-white font-semibold">{formatTemp(day.low)}</strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <Droplets size={12} className="text-sky-400" />
                      <span className="text-slate-400">Rain:</span> <strong className="text-sky-300 font-medium">{formatRainProbability(day.rainProbability)}</strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <Wind size={12} className="text-teal-400" />
                      <span className="text-slate-400">Wind:</span> <strong className="text-teal-300 font-medium">{formatWind(day.windSpeed, 'km/h')}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
