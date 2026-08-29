import { useWeatherContext } from '../context/useWeatherContext';
import ForecastCard from '../components/weather/ForecastCard';
import LocationSearch from '../components/map/LocationSearch';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { getWeatherIcon } from '../utils/weatherIcons';
import { formatTemp, formatRainProbability, formatWind } from '../utils/formatters';
import { mockHourlyForecast } from '../data/mockForecast';
import { Calendar, Clock, Droplets, Wind, Thermometer } from 'lucide-react';

export default function ForecastPage() {
  const {
    forecast,
    selectedLocation,
    loading,
    error,
    setLocation,
    refresh,
  } = useWeatherContext();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative z-10">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-5 border border-white/10 relative z-30">
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-xl font-black text-white tracking-tight">
              Extended Meteorological Forecast
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Multi-period atmospheric projections & precipitation probabilities for <strong className="text-slate-200">{selectedLocation.name}</strong>
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
          {/* Primary 7-Day Forecast */}
          <ForecastCard forecast={forecast} />

          {/* Today's 24h / Hourly Trend Section */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-inner">
                  <Clock size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Hourly Telemetry Outlook (Today)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time atmospheric trajectory throughout the day
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                24h Window
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {mockHourlyForecast.map((hour, idx) => {
                const Icon = getWeatherIcon(hour.condition.icon);
                return (
                  <div
                    key={idx}
                    className="glass-pill p-4 rounded-2xl flex flex-col items-center justify-between text-center gap-2 hover:bg-white/[0.1] hover:border-white/20 transition-all duration-200 group hover:-translate-y-0.5"
                  >
                    <span className="text-xs font-bold text-slate-400">
                      {hour.time}
                    </span>

                    <div className="p-2 rounded-xl bg-white/[0.04] group-hover:scale-110 transition-transform duration-200">
                      <Icon size={24} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    </div>

                    <div className="text-base font-black text-white">
                      {formatTemp(hour.temperature)}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                      <Droplets size={11} />
                      <span>{formatRainProbability(hour.rainProbability)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Daily Breakdown Table */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-inner">
                <Calendar size={17} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Comprehensive Daily Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">
                  Detailed humidity, wind dynamics, and temperature variance
                </p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.08]">
              {forecast.map((day) => {
                const Icon = getWeatherIcon(day.condition.icon);
                return (
                  <div
                    key={day.date}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors hover:bg-white/[0.02] px-2 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-[150px]">
                      <div className="p-2 rounded-xl bg-white/[0.04]">
                        <Icon size={20} className="text-blue-400 shrink-0" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white block">
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

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300">
                      <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-lg">
                        <Thermometer size={13} className="text-rose-400" />
                        <span>High: <strong className="text-white">{formatTemp(day.high)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-lg">
                        <Thermometer size={13} className="text-sky-400" />
                        <span>Low: <strong className="text-white">{formatTemp(day.low)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-lg">
                        <Droplets size={13} className="text-blue-400" />
                        <span>Rain: <strong className="text-sky-300">{formatRainProbability(day.rainProbability)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-lg">
                        <Wind size={13} className="text-teal-400" />
                        <span>Wind: <strong className="text-teal-300">{formatWind(day.windSpeed, 'km/h')}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
