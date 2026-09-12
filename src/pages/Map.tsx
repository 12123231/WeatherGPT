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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.07] relative z-30">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Interactive Weather Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mappls India-focused map for{' '}
            <strong className="text-slate-200 font-medium">{selectedLocation.name}</strong>
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
        {/* Main Map Panel */}
        <div className="lg:col-span-3">
          <MapView
            location={selectedLocation}
            weather={currentWeather}
            className="h-[520px]"
          />
        </div>

        {/* Location List Panel */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.07] flex flex-col">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.07] mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] text-sky-400 border border-white/[0.08] flex items-center justify-center">
              <Radio size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Locations</h3>
              <p className="text-[11px] text-slate-400">Select to navigate map</p>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[420px]">
            {locations.map((loc) => {
              const isSelected = loc.id === selectedLocation.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] border-white/[0.14] text-white shadow-xs'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <MapPin size={12} />
                    </div>
                    <div>
                      <span className="block text-white font-medium">{loc.name}</span>
                      <span className="text-[10px] text-slate-400">
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

          <div className="pt-3 border-t border-white/[0.07] mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-400" />
            <span className="text-emerald-400 font-medium">Mappls map active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
