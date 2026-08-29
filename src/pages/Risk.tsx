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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.07] relative z-30">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-rose-400 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Weather Risk & Hazard Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time severity assessment & civil advisories for <strong className="text-slate-200 font-medium">{selectedLocation.name}</strong>
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
