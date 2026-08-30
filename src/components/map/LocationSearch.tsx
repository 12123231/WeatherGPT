import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { LocationData } from '../../types/weather';
import { searchLocations } from '../../services/weatherService';
import { Search, MapPin, Check, X } from 'lucide-react';

interface LocationSearchProps {
  selectedLocation: LocationData;
  onSelectLocation: (location: LocationData) => void;
  className?: string;
  variant?: 'input' | 'icon';
}

export default function LocationSearch({
  selectedLocation,
  onSelectLocation,
  className = '',
  variant = 'input',
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (variant === 'icon') {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = 320;
        const left = Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16));
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left,
          width,
          zIndex: 9999,
        });
      } else {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, variant]);

  // Focus input when opened in icon mode
  useEffect(() => {
    if (isOpen && variant === 'icon') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, variant]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Also check if clicked inside portal
        const target = event.target as HTMLElement;
        if (!target.closest?.('.location-search-portal')) {
          setIsOpen(false);
        }
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
      className="location-search-portal rounded-2xl bg-[#232428]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden max-h-80 flex flex-col z-[9999]"
    >
      {/* If icon variant, include inner search bar */}
      {variant === 'icon' && (
        <div className="p-3 border-b border-white/[0.08] relative">
          <Search size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or station..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-white/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <div className="px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
        Telemetry Stations ({results.length})
      </div>

      <div className="overflow-y-auto divide-y divide-white/[0.04]">
        {results.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No matching stations found.
          </div>
        ) : (
          results.map((loc) => {
            const isSelected = loc.id === selectedLocation.id;
            return (
              <button
                key={loc.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(loc);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-all duration-150 text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.1] text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-white text-black' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    <MapPin size={12} />
                  </div>
                  <div>
                    <span className="font-medium text-white">{loc.name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      {loc.region}, {loc.country}
                    </span>
                  </div>
                </div>

                {isSelected && <Check size={14} className="text-emerald-400 font-bold" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  if (variant === 'icon') {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Search location"
          title="Search location"
          className="w-10 h-10 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <Search size={16} />
        </button>
        {createPortal(dropdown, document.body)}
      </div>
    );
  }

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
          className="w-full pl-10 pr-9 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-white/20 transition-all duration-200"
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

      {/* Results Dropdown */}
      {createPortal(dropdown, document.body)}
    </div>
  );
}

