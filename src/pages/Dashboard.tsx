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
import { RefreshCw, MessageSquare, ArrowRight, ShieldAlert, Radio } from 'lucide-react';
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative z-10">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.07] relative z-30">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Live Weather Telemetry
            </h2>
            <ConnectionStatus status={connectionStatus} lastSynced={lastSynced} />
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>{formatCurrentDateTime()}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Radio size={12} className="text-sky-400" /> Doppler Station Active
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-20">
          <LocationSearch
            selectedLocation={selectedLocation}
            onSelectLocation={setLocation}
            className="w-full sm:w-72"
          />

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh telemetry data"
            title="Refresh current meteorological data"
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white rounded-xl transition-all duration-150 shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-sky-400' : ''} />
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
              {/* AI Weather Assistant Quick Card */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-white/[0.07] transition-colors hover:border-white/[0.12]">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-400">
                      <MessageSquare size={16} />
                    </div>
                    <span className="text-xs font-semibold text-sky-300">
                      WeatherGPT Assistant
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">
                    Conversational Weather Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Ask natural questions regarding precipitation, heat stress, route safety, or outdoor conditions in {selectedLocation.name}.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ready</span>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Open AI Chat <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Active Risk Summary Card */}
              <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col justify-between border border-white/[0.07] relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] text-rose-400 flex items-center justify-center">
                      <ShieldAlert size={15} />
                    </div>
                    <h4 className="text-xs font-semibold text-white">
                      Hazard Alerts ({activeRisks.length})
                    </h4>
                  </div>
                  <Link
                    to="/risk"
                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    View All &rarr;
                  </Link>
                </div>

                {activeRisks.length > 0 ? (
                  <div className="my-auto py-1">
                    <RiskAlert
                      risk={activeRisks[0]}
                      locationName={selectedLocation.name}
                      className="border-none shadow-none p-0 bg-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 my-auto py-2 leading-relaxed">
                    No critical meteorological hazards or flash warnings recorded for {selectedLocation.name}.
                  </p>
                )}

                <div className="text-[10px] text-slate-400 border-t border-white/[0.06] pt-2.5 mt-2 flex items-center justify-between">
                  <span>Advisory Level: <strong className={activeRisks.length > 0 ? 'text-rose-400' : 'text-slate-300'}>{activeRisks.length > 0 ? 'Active' : 'Nominal'}</strong></span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Normal transit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Row */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Sensor Telemetry
              </h3>
              <span className="text-[11px] text-slate-400">Real-time Stream</span>
            </div>
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
