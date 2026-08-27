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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Extended Meteorological Forecast
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Multi-period atmospheric projections & precipitation probabilities for {selectedLocation.name}
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-64"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hourly Telemetry Outlook (Today)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time atmospheric trajectory throughout the day
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {mockHourlyForecast.map((hour, idx) => {
                const Icon = getWeatherIcon(hour.condition.icon);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-between text-center gap-2 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-500">
                      {hour.time}
                    </span>

                    <Icon size={24} className="text-blue-600 my-1" />

                    <div className="text-base font-extrabold text-slate-900">
                      {formatTemp(hour.temperature)}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                      <Droplets size={11} />
                      <span>{formatRainProbability(hour.rainProbability)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Daily Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Comprehensive Daily Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">
                  Detailed humidity, wind, and temperature variance
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {forecast.map((day) => {
                const Icon = getWeatherIcon(day.condition.icon);
                return (
                  <div
                    key={day.date}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <Icon size={20} className="text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {day.day}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {day.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 text-slate-600 font-medium">
                      {day.condition.description || day.condition.main}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Thermometer size={14} className="text-rose-500" />
                        <span>High: <strong>{formatTemp(day.high)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Thermometer size={14} className="text-blue-500" />
                        <span>Low: <strong>{formatTemp(day.low)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Droplets size={14} className="text-blue-500" />
                        <span>Rain: <strong>{formatRainProbability(day.rainProbability)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Wind size={14} className="text-teal-500" />
                        <span>Wind: <strong>{formatWind(day.windSpeed, 'km/h')}</strong></span>
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
