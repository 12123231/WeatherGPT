import { useState, useEffect, useMemo, useRef } from 'react';
import type { CurrentWeather, HourlyForecast } from '../../types/weather';
import { Cloud, CloudRain, Moon, CloudSun, Sun, CloudLightning, CloudSnow } from 'lucide-react';
import {
  resolveLocationTimezone,
  getBaseEpochForLocalHour,
  formatEpochToLocalHour,
  getMsUntilNextHour,
  getLocalTimeInfo,
  formatHourDisplay,
} from '../../utils/timezone';
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
  const [clockTick, setClockTick] = useState<number>(() => Date.now());
  const isRefreshingRef = useRef(false);

  // Resolve target location's IANA timezone
  const targetTimezone = useMemo(() => {
    return resolveLocationTimezone(
      weather?.location || selectedLocation?.name || selectedLocation?.id,
      weather?.timezone || selectedLocation?.timezone
    );
  }, [weather?.location, weather?.timezone, selectedLocation?.name, selectedLocation?.id, selectedLocation?.timezone]);

  // Schedule auto-advancement at exact local-hour boundary in target timezone
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    const scheduleNextHour = () => {
      const msUntilNext = getMsUntilNextHour(targetTimezone);
      timerId = setTimeout(() => {
        setClockTick(Date.now());
        scheduleNextHour();
      }, msUntilNext);
    };

    scheduleNextHour();

    // Heartbeat every 30s to catch sleep / wake-up or tab backgrounding without API calls
    const heartbeat = setInterval(() => {
      const ms = getMsUntilNextHour(targetTimezone);
      if (ms > 3590000 || ms < 1000) {
        setClockTick(Date.now());
      }
    }, 30000);

    return () => {
      clearTimeout(timerId);
      clearInterval(heartbeat);
    };
  }, [targetTimezone]);

  // Generate or slice exactly 8 dynamic consecutive hourly slots starting with "Now"
  const hourlySlots = useMemo<HourlySlot[]>(() => {
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

    const currentEpoch = Math.floor(clockTick / 1000);
    const currentHourBaseEpoch = getBaseEpochForLocalHour(targetTimezone, new Date(clockTick));

    let validConsecutiveList: HourlyForecast[] | null = null;

    if (rawHourlyForecast && rawHourlyForecast.length > 0) {
      // Find starting index matching current local forecast hour using time_epoch or local hour
      let startIndex = rawHourlyForecast.findIndex((h) => {
        if (typeof h.time_epoch === 'number') {
          return (
            h.time_epoch === currentHourBaseEpoch ||
            (h.time_epoch <= currentEpoch && currentEpoch < h.time_epoch + 3600)
          );
        }
        if (typeof h.hour === 'number') {
          const { hour: curHour } = getLocalTimeInfo(targetTimezone);
          return h.hour === curHour;
        }
        return h.time === 'Now';
      });

      if (startIndex === -1 && rawHourlyForecast.length >= 8) {
        // If current hour is just ahead of the first entry (within 1 hour)
        const firstEpoch = rawHourlyForecast[0].time_epoch;
        if (typeof firstEpoch === 'number' && Math.abs(firstEpoch - currentHourBaseEpoch) <= 3600) {
          startIndex = 0;
        }
      }

      // Check if we have 8 consecutive hours starting from startIndex
      if (startIndex >= 0 && startIndex + 8 <= rawHourlyForecast.length) {
        const candidate = rawHourlyForecast.slice(startIndex, startIndex + 8);
        let isContinuous = true;

        for (let i = 0; i < 7; i++) {
          const cur = candidate[i];
          const nxt = candidate[i + 1];

          if (typeof cur.time_epoch === 'number' && typeof nxt.time_epoch === 'number') {
            if (nxt.time_epoch - cur.time_epoch !== 3600) {
              isContinuous = false;
              break;
            }
          } else if (typeof cur.hour === 'number' && typeof nxt.hour === 'number') {
            if ((nxt.hour - cur.hour + 24) % 24 !== 1) {
              isContinuous = false;
              break;
            }
          }
        }

        if (isContinuous) {
          validConsecutiveList = candidate;
        }
      }
    }

    // Source of the 8 items: genuine consecutive slice from cache, or fallback generator
    const sourceList =
      validConsecutiveList ||
      generateMockHourlyForecast(
        selectedLocation?.id || weather?.location || 'new-delhi',
        targetTimezone,
        weather
      ).slice(0, 8);

    const slots: HourlySlot[] = [];

    for (let i = 0; i < 8; i++) {
      const item = sourceList[i];
      let timeLabel: string;
      let hourNum: number;
      let isDay: boolean;

      if (typeof item.time_epoch === 'number') {
        const info = formatEpochToLocalHour(item.time_epoch, targetTimezone);
        timeLabel = i === 0 ? 'Now' : info.displayTime;
        hourNum = info.hour;
        isDay = typeof item.isDay === 'boolean' ? item.isDay : info.isDaytime;
      } else {
        hourNum = typeof item.hour === 'number' ? item.hour : (getLocalTimeInfo(targetTimezone).hour + i) % 24;
        timeLabel = i === 0 ? 'Now' : formatHourDisplay(hourNum, false);
        isDay = typeof item.isDay === 'boolean' ? item.isDay : (hourNum >= 6 && hourNum < 19);
      }

      const isFirst = i === 0;
      const temp = isFirst && weather ? Math.round(weather.temperature) : Math.round(item.temperature);
      const iconType = isFirst && weather
        ? resolveIconType(weather.condition?.icon || '', isDay)
        : resolveIconType(item.condition?.icon || '', isDay);
      const rainChance =
        typeof item.rainProbability === 'number' && item.rainProbability > 0 ? item.rainProbability : undefined;

      slots.push({
        time: timeLabel,
        temp,
        iconType,
        rainChance,
        hour: hourNum,
      });
    }

    return slots;
  }, [weather, rawHourlyForecast, clockTick, targetTimezone, selectedLocation?.id]);

  // If cached live forecast no longer contains the required upcoming window, refresh
  useEffect(() => {
    if (!rawHourlyForecast || rawHourlyForecast.length === 0) return;
    const currentEpoch = Math.floor(Date.now() / 1000);
    const hasEnoughHours = rawHourlyForecast.some((h, idx) => {
      if (typeof h.time_epoch === 'number' && h.time_epoch >= currentEpoch) {
        return idx + 7 < rawHourlyForecast.length;
      }
      return false;
    });

    if (!hasEnoughHours && context?.refresh && !isRefreshingRef.current) {
      isRefreshingRef.current = true;
      context.refresh();
      const timer = setTimeout(() => {
        isRefreshingRef.current = false;
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [rawHourlyForecast, context]);

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
