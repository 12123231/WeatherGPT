import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
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

  // Recompute dropdown position whenever it opens or on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

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

  const dropdown = isOpen ? (
    <div
      style={dropdownStyle}
      className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
    >
      <div className="px-3.5 py-2 bg-white/[0.04] border-b border-white/10 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
        Available Telemetry Stations ({results.length})
      </div>

      {results.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400">
          No matching meteorological stations found.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {results.map((loc) => {
            const isSelected = loc.id === selectedLocation.id;
            return (
              <button
                key={loc.id}
                type="button"
                onMouseDown={(e) => {
                  // Use onMouseDown + preventDefault to prevent the input blur
                  // from firing before the click registers
                  e.preventDefault();
                  handleSelect(loc);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-all duration-150 text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500/25 text-white font-bold border-l-2 border-blue-400'
                    : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-500/30 text-blue-300' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    <MapPin size={13} />
                  </div>
                  <div>
                    <span className="font-semibold text-white">{loc.name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      {loc.region}, {loc.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>
                    {loc.lat.toFixed(2)}°N, {loc.lon.toFixed(2)}°E
                  </span>
                  {isSelected && <Check size={14} className="text-blue-400 font-bold" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
          placeholder={`Search station (Current: ${selectedLocation.name})...`}
          className="w-full pl-10 pr-9 py-2.5 glass-input rounded-2xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all duration-200"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Results Dropdown — rendered via portal to escape backdrop-filter stacking contexts */}
      {createPortal(dropdown, document.body)}
    </div>
  );
}
