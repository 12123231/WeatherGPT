import { useState, useEffect, useRef } from 'react';
import type { LocationData } from '../../types/weather';
import { searchLocations } from '../../services/weatherService';
import { Search, MapPin, Check, X } from 'lucide-react';

interface LocationSearchProps {
  selectedLocation: LocationData;
  onSelectLocation: (location: LocationData) => void;
  className?: string;
}

export default function LocationSearch({
  selectedLocation,
  onSelectLocation,
  className = '',
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    searchLocations(query).then((res) => {
      if (active) setResults(res);
    });
    return () => {
      active = false;
    };
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (location: LocationData) => {
    onSelectLocation(location);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Search location (Current: ${selectedLocation.name})...`}
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xs"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
            Available Monitored Cities ({results.length})
          </div>

          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching meteorological stations found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {results.map((loc) => {
                const isSelected = loc.id === selectedLocation.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={14}
                        className={isSelected ? 'text-blue-600' : 'text-slate-400'}
                      />
                      <div>
                        <span className="font-medium text-slate-900">{loc.name}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          {loc.region}, {loc.country}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>
                        {loc.lat.toFixed(2)}°N, {loc.lon.toFixed(2)}°E
                      </span>
                      {isSelected && <Check size={14} className="text-blue-600 font-bold" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
