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
import { RefreshCw, Bot, ArrowRight, ShieldAlert, Sparkles, Compass } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-5 border border-white/10 relative z-30">
        {/* Ambient Subtle Accent Glow (contained in inner underlay) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">
              Atmospheric Telemetry Dashboard
            </h2>
            <ConnectionStatus status={connectionStatus} lastSynced={lastSynced} />
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>{formatCurrentDateTime()}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Compass size={12} className="text-blue-400" /> Doppler Grid Monitored
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
            className="p-2.5 glass-pill hover:bg-white/[0.12] text-slate-200 hover:text-white rounded-2xl transition-all duration-200 shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin text-blue-400' : ''} />
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
              {/* AI WeatherGPT Quick Card (Dark Glass Neon Capsule) */}
              <div className="glass-panel-card rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden border border-blue-500/20 shadow-xl group transition-all duration-300 hover:border-blue-400/40">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/25 transition-colors duration-500" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
                      <Bot size={17} />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                      <Sparkles size={11} /> WeatherGPT AI
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    Instant Meteorological Analysis
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Ask conversational questions regarding precipitation, heat stress, route safety, or outdoor conditions in {selectedLocation.name}.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between relative z-10">
                  <span className="text-[11px] text-slate-400 font-medium">Natural Language Ready</span>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:text-white bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 px-3 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    Open AI Chat <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Active Risk Summary Card (Dark Glass) */}
              <div className="glass-panel rounded-3xl p-5 flex-1 flex flex-col justify-between border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-400 flex items-center justify-center">
                      <ShieldAlert size={15} />
                    </div>
                    <h4 className="text-xs font-bold text-white">
                      Active Alerts ({activeRisks.length})
                    </h4>
                  </div>
                  <Link
                    to="/risk"
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
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

                <div className="text-[10px] text-slate-400 border-t border-white/10 pt-2.5 mt-2 flex items-center justify-between">
                  <span>Advisory Level: <strong className={activeRisks.length > 0 ? 'text-rose-400' : 'text-slate-300'}>{activeRisks.length > 0 ? 'Active' : 'Normal'}</strong></span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Safe for transit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Row */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-400" />
                Current Telemetry Metrics
              </h3>
              <span className="text-[11px] text-slate-400">Multi-sensor live stream</span>
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
