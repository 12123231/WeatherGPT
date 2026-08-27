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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Weather Risk & Hazard Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Real-time severity assessment, civil advisories, and disaster resilience indicators
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-64"
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
