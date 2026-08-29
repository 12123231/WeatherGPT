import { useWeatherContext } from '../context/useWeatherContext';
import MapView from '../components/map/MapView';
import LocationSearch from '../components/map/LocationSearch';
import { MapPin, Radio, Shield } from 'lucide-react';

export default function MapPage() {
  const {
    currentWeather,
    selectedLocation,
    locations,
    setLocation,
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
              Interactive Weather Map & Spatial Radar
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Geographical radar matrices, precipitation trackers, and regional telemetry stations for <strong className="text-slate-200">{selectedLocation.name}</strong>
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-72 relative z-20"
        />
      </div>

      {/* Main Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Radar View Panel */}
        <div className="lg:col-span-3">
          <MapView
            location={selectedLocation}
            weather={currentWeather}
            className="h-[520px]"
          />
        </div>

        {/* Monitored Ground Stations List */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-3">
            <div className="w-8 h-8 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shadow-inner">
              <Radio size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Telemetry Stations</h3>
              <p className="text-[11px] text-slate-400">Active Doppler grid</p>
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px]">
            {locations.map((loc) => {
              const isSelected = loc.id === selectedLocation.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-400/40 text-white font-bold shadow-md'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-blue-500 text-white shadow-xs' : 'bg-white/[0.08] text-slate-400'
                      }`}
                    >
                      <MapPin size={13} />
                    </div>
                    <div>
                      <span className="block text-white font-semibold">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {loc.region}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-400">
                    <span>{loc.lat.toFixed(1)}°N</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-400" />
            <span className="text-emerald-300 font-medium">All station nodes operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
