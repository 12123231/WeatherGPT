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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Interactive Weather Map & Spatial Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Geographical radar matrices, precipitation trackers, and regional telemetry stations
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-64"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Radio size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Telemetry Stations</h3>
              <p className="text-[11px] text-slate-500">Active meteorological grid</p>
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
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold shadow-xs'
                      : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <MapPin size={13} />
                    </div>
                    <div>
                      <span className="block">{loc.name}</span>
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

          <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-500" />
            <span>All station nodes operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
