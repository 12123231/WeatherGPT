import { useState, useEffect } from 'react';
import type { LocationData, CurrentWeather } from '../../types/weather';
import { getCurrentWeather } from '../../services/weatherService';
import { WeatherIcon } from '../../utils/weatherIcons';
import { ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentlySearchedCardProps {
  onSelectLocation: (loc: LocationData) => void;
  selectedLocation?: LocationData;
  className?: string;
}

const STORAGE_KEY = 'weathergpt_recent_locations';

export default function RecentlySearchedCard({
  onSelectLocation,
  selectedLocation,
  className = '',
}: RecentlySearchedCardProps) {
  const [recentLocations, setRecentLocations] = useState<LocationData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return selectedLocation ? [selectedLocation] : [];
  });

  const [weatherMap, setWeatherMap] = useState<Record<string, CurrentWeather>>({});

  // Sync selected location into recent locations list
  useEffect(() => {
    if (!selectedLocation) return;

    setRecentLocations((prev) => {
      const filtered = prev.filter((loc) => loc.id !== selectedLocation.id);
      const updated = [selectedLocation, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, [selectedLocation]);

  // Fetch live weather data for recent locations
  useEffect(() => {
    let isMounted = true;

    async function loadRecentWeatherData() {
      const entries: Record<string, CurrentWeather> = {};
      for (const loc of recentLocations) {
        try {
          const data = await getCurrentWeather(loc.id);
          if (data) {
            entries[loc.id] = data;
          }
        } catch {
          // Graceful fallback
        }
      }
      if (isMounted) {
        setWeatherMap(entries);
      }
    }

    if (recentLocations.length > 0) {
      loadRecentWeatherData();
    }

    return () => {
      isMounted = false;
    };
  }, [recentLocations]);

  return (
    <div
      className={`rounded-[28px] p-6 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Recently Searched</h3>
        <Link
          to="/map"
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-0.5 transition-colors"
        >
          <span>See All</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Location Items List */}
      <div className="space-y-3">
        {recentLocations.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            No recent searches. Search a city above to see it here.
          </div>
        ) : (
          recentLocations.map((loc) => {
            const isCurrent = selectedLocation?.id === loc.id;
            const weather = weatherMap[loc.id];
            const temp = weather ? Math.round(weather.temperature) : '--';
            const condition = weather?.condition.main || `${loc.region}, ${loc.country}`;
            const icon = weather?.condition.icon || 'cloud-sun';

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocation(loc)}
                className={`w-full flex items-center justify-between p-2.5 -mx-2.5 rounded-2xl transition-all duration-150 text-left cursor-pointer group ${
                  isCurrent
                    ? 'bg-white/[0.08] ring-1 ring-white/10'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                {/* Left: Icon & Location Details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    {weather ? (
                      <WeatherIcon
                        icon={icon}
                        size={20}
                        className={
                          icon.includes('sun')
                            ? 'text-amber-400'
                            : icon.includes('rain')
                            ? 'text-sky-400'
                            : 'text-slate-300'
                        }
                      />
                    ) : (
                      <MapPin size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {loc.name}, {loc.country}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                      {condition}
                    </p>
                  </div>
                </div>

                {/* Right: Temperature */}
                <div className="text-lg font-normal text-white tracking-tight">
                  {temp !== '--' ? `${temp}°` : '--'}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
