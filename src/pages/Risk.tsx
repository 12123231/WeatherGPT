import { useWeatherContext } from '../context/useWeatherContext';
import RiskSummary from '../components/risk/RiskSummary';
import LocationSearch from '../components/map/LocationSearch';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { ShieldAlert } from 'lucide-react';

export default function RiskPage() {
  const {
    risks,
    selectedLocation,
    loading,
    error,
    setLocation,
    refresh,
  } = useWeatherContext();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto relative z-10">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-5 border border-white/10 relative z-30">
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-32 bg-rose-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center shadow-inner">
              <ShieldAlert size={18} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Weather Risk & Hazard Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Real-time severity assessment, civil advisories, and disaster resilience indicators for <strong className="text-slate-200">{selectedLocation.name}</strong>
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-64 relative z-20"
        />
      </div>

      {/* Main Risk Content */}
      {loading && risks.length === 0 ? (
        <LoadingState message="Analyzing regional hazard telemetry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <RiskSummary
          risks={risks}
          locationName={selectedLocation.name}
        />
      )}
    </div>
  );
}
