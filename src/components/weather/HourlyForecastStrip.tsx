import { useState } from 'react';
import type { CurrentWeather } from '../../types/weather';
import { Cloud, CloudRain, Moon, CloudSun, Sun } from 'lucide-react';

interface HourlyForecastStripProps {
  weather?: CurrentWeather | null;
  className?: string;
}

interface HourlySlot {
  time: string;
  temp: number;
  iconType: 'cloud' | 'rain' | 'moon' | 'cloud-sun' | 'sun';
  rainChance?: number;
}

export default function HourlyForecastStrip({
  weather,
  className = '',
}: HourlyForecastStripProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const baseTemp = weather ? Math.round(weather.temperature) : 18;

  // Generate 8 reference-matching hourly data points based on current temperature
  const hourlySlots: HourlySlot[] = [
    { time: 'Now',  temp: baseTemp,      iconType: 'cloud' },
    { time: '2 PM', temp: baseTemp + 1,  iconType: 'cloud' },
    { time: '3 PM', temp: baseTemp + 2,  iconType: 'cloud' },
    { time: '4 PM', temp: baseTemp + 2,  iconType: 'rain', rainChance: 60 },
    { time: '5 PM', temp: baseTemp + 1,  iconType: 'rain', rainChance: 60 },
    { time: '6 PM', temp: baseTemp,      iconType: 'cloud' },
    { time: '7 PM', temp: baseTemp - 1,  iconType: 'cloud' },
    { time: '8 PM', temp: baseTemp - 2,  iconType: 'moon' },
  ];

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
              key={slot.time}
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
                {slot.rainChance && (
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
