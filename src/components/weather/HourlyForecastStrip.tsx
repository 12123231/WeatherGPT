import { useState, useEffect, useMemo } from 'react';
import type { CurrentWeather, HourlyForecast } from '../../types/weather';
import { Cloud, CloudRain, Moon, CloudSun, Sun, CloudLightning, CloudSnow } from 'lucide-react';
import { getLocalTimeInfo, formatHourDisplay, resolveLocationTimezone } from '../../utils/timezone';
import { generateMockHourlyForecast } from '../../data/mockForecast';
import { useWeatherContext } from '../../context/useWeatherContext';

interface HourlyForecastStripProps {
  weather?: CurrentWeather | null;
  hourlyForecast?: HourlyForecast[];
  className?: string;
}

interface HourlySlot {
  time: string;
  temp: number;
  iconType: 'cloud' | 'rain' | 'moon' | 'cloud-sun' | 'sun' | 'cloud-lightning' | 'cloud-snow';
  rainChance?: number;
  hour?: number;
}

export default function HourlyForecastStrip({
  weather: propWeather,
  hourlyForecast: propHourlyForecast,
  className = '',
}: HourlyForecastStripProps) {
  const context = useWeatherContext();
  const weather = propWeather ?? context?.currentWeather;
  const contextHourlyForecast = context?.hourlyForecast;
  const rawHourlyForecast = propHourlyForecast ?? contextHourlyForecast;
  const selectedLocation = context?.selectedLocation;

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [currentLocalHour, setCurrentLocalHour] = useState<number>(() => {
    const tz = resolveLocationTimezone(
      weather?.location || selectedLocation?.name || selectedLocation?.id,
      weather?.timezone || selectedLocation?.timezone
    );
    return getLocalTimeInfo(tz).hour;
  });

  // Resolve target location's timezone
  const targetTimezone = useMemo(() => {
    return resolveLocationTimezone(
      weather?.location || selectedLocation?.name || selectedLocation?.id,
      weather?.timezone || selectedLocation?.timezone
    );
  }, [weather?.location, weather?.timezone, selectedLocation?.name, selectedLocation?.id, selectedLocation?.timezone]);

  // Real-time clock tick: check target location's local time every 15 seconds to roll hours forward
  useEffect(() => {
    const checkLocalTime = () => {
      const { hour } = getLocalTimeInfo(targetTimezone);
      setCurrentLocalHour((prev) => (prev !== hour ? hour : prev));
    };

    checkLocalTime();
    const interval = setInterval(checkLocalTime, 15000);
    return () => clearInterval(interval);
  }, [targetTimezone]);

  // Generate or slice 8 dynamic consecutive hourly slots starting with "Now"
  const hourlySlots = useMemo<HourlySlot[]>(() => {
    const baseTemp = weather ? Math.round(weather.temperature) : 18;

    // Helper to map icon identifier to supported icon types
    const resolveIconType = (iconStr: string, isDay: boolean): HourlySlot['iconType'] => {
      const lower = (iconStr || '').toLowerCase();
      if (lower.includes('lightning') || lower.includes('thunder')) return 'cloud-lightning';
      if (lower.includes('snow') || lower.includes('sleet') || lower.includes('ice')) return 'cloud-snow';
      if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return 'rain';
      if (!isDay && (lower === 'sun' || lower === 'clear' || lower === 'cloud-sun')) return 'moon';
      if (lower === 'moon') return 'moon';
      if (lower === 'sun' || lower === 'clear') return isDay ? 'sun' : 'moon';
      if (lower === 'cloud-sun' || lower === 'partly-cloudy') return isDay ? 'cloud-sun' : 'cloud';
      return 'cloud';
    };

    // If we have an hourly forecast list from backend / context
    if (rawHourlyForecast && rawHourlyForecast.length > 0) {
      // Find starting index matching current local hour in target timezone
      let startIndex = rawHourlyForecast.findIndex((h) => {
        if (typeof h.hour === 'number') {
          return h.hour === currentLocalHour;
        }
        if (h.time === 'Now') return true;
        return false;
      });

      if (startIndex === -1) {
        startIndex = 0;
      }

      // Extract 8 consecutive hours from startIndex
      const candidateHours = rawHourlyForecast.slice(startIndex, startIndex + 8);

      // If fewer than 8 hours available at the end of the array, fill remaining from fallback generator
      const fallbackList = generateMockHourlyForecast(
        selectedLocation?.id || weather?.location || 'new-delhi',
        targetTimezone,
        weather
      );

      const slots: HourlySlot[] = [];
      for (let i = 0; i < 8; i++) {
        const h = candidateHours[i] || fallbackList[i];
        if (h) {
          const hourNum = typeof h.hour === 'number' ? h.hour : (currentLocalHour + i) % 24;
          const isDay = typeof h.isDay === 'boolean' ? h.isDay : (hourNum >= 6 && hourNum < 19);
          const iconType = resolveIconType(h.condition?.icon || '', isDay);
          const timeLabel = i === 0 ? 'Now' : (h.time === 'Now' ? formatHourDisplay(hourNum, false) : h.time);

          slots.push({
            time: timeLabel,
            temp: Math.round(h.temperature),
            iconType,
            rainChance: typeof h.rainProbability === 'number' && h.rainProbability > 0 ? h.rainProbability : undefined,
            hour: hourNum,
          });
        }
      }

      return slots;
    }

    // Fallback: generate 8 dynamic consecutive hours starting with "Now" using location telemetry
    const dynamicFallback = generateMockHourlyForecast(
      selectedLocation?.id || weather?.location || 'new-delhi',
      targetTimezone,
      weather
    );

    return dynamicFallback.slice(0, 8).map((h, i) => {
      const hourNum = typeof h.hour === 'number' ? h.hour : (currentLocalHour + i) % 24;
      const isDay = typeof h.isDay === 'boolean' ? h.isDay : (hourNum >= 6 && hourNum < 19);
      const iconType = resolveIconType(h.condition?.icon || '', isDay);

      return {
        time: i === 0 ? 'Now' : formatHourDisplay(hourNum, false),
        temp: i === 0 && weather ? Math.round(baseTemp) : Math.round(h.temperature),
        iconType,
        rainChance: typeof h.rainProbability === 'number' && h.rainProbability > 0 ? h.rainProbability : undefined,
        hour: hourNum,
      };
    });
  }, [weather, rawHourlyForecast, currentLocalHour, targetTimezone, selectedLocation?.id]);

  const renderIcon = (type: HourlySlot['iconType']) => {
    switch (type) {
      case 'rain':
        return <CloudRain size={20} className="text-slate-300" />;
      case 'moon':
        return <Moon size={18} className="text-slate-300 fill-slate-300/20" />;
      case 'cloud-sun':
        return <CloudSun size={20} className="text-amber-400" />;
      case 'sun':
        return <Sun size={20} className="text-amber-400" />;
      case 'cloud-lightning':
        return <CloudLightning size={20} className="text-amber-300" />;
      case 'cloud-snow':
        return <CloudSnow size={20} className="text-sky-200" />;
      case 'cloud':
      default:
        return <Cloud size={20} className="text-slate-300 fill-slate-300/10" />;
    }
  };

  return (
    <div
      className={`rounded-[26px] p-4 sm:p-5 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] select-none ${className}`}
    >
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-center">
        {hourlySlots.map((slot, index) => {
          const isSelected = index === selectedSlotIndex;

          return (
            <button
              key={`${slot.time}-${slot.hour ?? index}-${index}`}
              type="button"
              onClick={() => setSelectedSlotIndex(index)}
              className={`flex flex-col items-center justify-between py-2.5 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.09] border border-white/[0.12] shadow-sm'
                  : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {/* Time Label */}
              <span className="text-xs text-slate-400 font-medium">
                {slot.time}
              </span>

              {/* Icon Container with Optional Rain Chance Badge */}
              <div className="relative my-2.5 flex flex-col items-center justify-center min-h-[36px]">
                {slot.rainChance !== undefined && slot.rainChance > 0 && (
                  <span className="text-[10px] text-sky-400 font-semibold leading-none mb-0.5 tracking-tight">
                    {slot.rainChance}%
                  </span>
                )}
                {renderIcon(slot.iconType)}
              </div>

              {/* Temperature */}
              <span className="text-sm font-semibold text-white tracking-tight">
                {slot.temp}°
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
