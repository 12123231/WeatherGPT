import { useWeatherContext } from '../context/useWeatherContext';
import CurrentWeather from '../components/weather/CurrentWeather';
import MetricCards from '../components/weather/MetricCards';
import ForecastCard from '../components/weather/ForecastCard';
import LocationSearch from '../components/map/LocationSearch';
import ConnectionStatus from '../components/common/ConnectionStatus';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import RiskAlert from '../components/risk/RiskAlert';
import { formatCurrentDateTime } from '../utils/formatters';
import { RefreshCw, Bot, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    currentWeather,
    forecast,
    risks,
    selectedLocation,
    loading,
    error,
    setLocation,
    refresh,
    connectionStatus,
    lastSynced,
  } = useWeatherContext();

  const activeRisks = risks.filter((r) => r.isActive);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Weather Intelligence Dashboard
            </h2>
            <ConnectionStatus status={connectionStatus} lastSynced={lastSynced} />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {formatCurrentDateTime()} • Regional Sensor Matrix
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <LocationSearch
            selectedLocation={selectedLocation}
            onSelectLocation={setLocation}
            className="w-full sm:w-64"
          />

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh telemetry data"
            title="Refresh current meteorological data"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content / States */}
      {loading && !currentWeather ? (
        <LoadingState message="Connecting to weather telemetry network..." />
      ) : error && !currentWeather ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : currentWeather ? (
        <>
          {/* Main Weather Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Current Weather Card */}
            <div className="lg:col-span-2">
              <CurrentWeather
                weather={currentWeather}
                todayForecast={forecast[0]}
                className="h-full"
              />
            </div>

            {/* Quick AI Weather Assistant & Risk Summary Banner */}
            <div className="flex flex-col gap-4">
              {/* AI WeatherGPT Quick Card */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <Bot size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      WeatherGPT Assistant
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    Instant Meteorological Analysis
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Ask conversational questions regarding rain forecasts, heat stress, route safety, or outdoor conditions in {selectedLocation.name}.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Natural Language Ready</span>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-white transition-colors"
                  >
                    Open AI Chat <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Active Risk Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                      <ShieldAlert size={14} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Active Alerts ({activeRisks.length})
                    </h4>
                  </div>
                  <Link
                    to="/risk"
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {activeRisks.length > 0 ? (
                  <div className="my-auto">
                    <RiskAlert
                      risk={activeRisks[0]}
                      locationName={selectedLocation.name}
                      className="border-none shadow-none p-2 bg-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 my-auto">
                    No critical weather alerts recorded for {selectedLocation.name}.
                  </p>
                )}

                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-2 flex items-center justify-between">
                  <span>Advisory Level: {activeRisks.length > 0 ? 'Active' : 'Normal'}</span>
                  <span className="text-emerald-600 font-medium">Safe for transit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Row */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
              Current Telemetry Metrics
            </h3>
            <MetricCards weather={currentWeather} />
          </div>

          {/* 7-Day Forecast Row */}
          <div>
            <ForecastCard forecast={forecast} />
          </div>
        </>
      ) : null}
    </div>
  );
}
