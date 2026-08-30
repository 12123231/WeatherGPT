import { useState } from 'react';
import type { ForecastDay } from '../../types/weather';
import { Sun, Cloud, CloudSun, CloudRain, Thermometer, Droplets, Wind } from 'lucide-react';
import { WeatherIcon } from '../../utils/weatherIcons';

interface DailyForecastGridProps {
  forecast?: ForecastDay[];
  className?: string;
}

export default function DailyForecastGrid({
  forecast = [],
  className = '',
}: DailyForecastGridProps) {
  // Default to day index 0 (Today) or Wed
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Reference visual defaults for 7 days
  const fallbackDays: ForecastDay[] = [
    { date: '2026-08-30', day: 'Sun', condition: { main: 'Sunny', description: 'Clear and sunny', icon: 'sun' }, high: 28, low: 12, rainProbability: 0, humidity: 55, windSpeed: 10 },
    { date: '2026-08-31', day: 'Mon', condition: { main: 'Partly Cloudy', description: 'Scattered clouds', icon: 'cloud-sun' }, high: 26, low: 11, rainProbability: 10, humidity: 58, windSpeed: 12 },
    { date: '2026-09-01', day: 'Tue', condition: { main: 'Cloudy', description: 'Overcast skies', icon: 'cloud' }, high: 27, low: 12, rainProbability: 20, humidity: 62, windSpeed: 11 },
    { date: '2026-09-02', day: 'Wed', condition: { main: 'Rain', description: 'Moderate showers', icon: 'cloud-rain' }, high: 23, low: 13, rainProbability: 60, humidity: 78, windSpeed: 16 },
    { date: '2026-09-03', day: 'Thu', condition: { main: 'Cloudy', description: 'Passing clouds', icon: 'cloud' }, high: 30, low: 14, rainProbability: 15, humidity: 60, windSpeed: 14 },
    { date: '2026-09-04', day: 'Fri', condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, high: 23, low: 10, rainProbability: 10, humidity: 56, windSpeed: 12 },
    { date: '2026-09-05', day: 'Sat', condition: { main: 'Sunny', description: 'Clear sunny sky', icon: 'sun' }, high: 24, low: 9, rainProbability: 5, humidity: 50, windSpeed: 9 },
  ];

  // Merge live forecast data if available
  const displayForecast = forecast && forecast.length >= 7 ? forecast.slice(0, 7) : fallbackDays;
  const activeDay = displayForecast[selectedDayIndex] || displayForecast[0];

  const renderIcon = (iconName: string) => {
    if (iconName.includes('sun') && !iconName.includes('cloud')) {
      return <Sun size={24} className="text-amber-400 fill-amber-400/20" />;
    }
    if (iconName.includes('cloud-sun')) {
      return <CloudSun size={24} className="text-amber-300 fill-amber-400/10" />;
    }
    if (iconName.includes('rain') || iconName.includes('storm')) {
      return <CloudRain size={24} className="text-slate-300" />;
    }
    if (iconName.includes('cloud')) {
      return <Cloud size={24} className="text-slate-300 fill-slate-300/10" />;
    }
    return <WeatherIcon icon={iconName} size={24} className="text-slate-300" />;
  };

  return (
    <div className={`space-y-3.5 select-none ${className}`}>
      {/* 7-Day Forecast Horizontal Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {displayForecast.map((item, index) => {
          const isSelected = index === selectedDayIndex;
          const dayLabel = item.day === 'Today' ? 'Today' : item.day.slice(0, 3);

          return (
            <button
              key={item.day + index}
              type="button"
              onClick={() => setSelectedDayIndex(index)}
              className={`rounded-[26px] p-4 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer min-h-[160px] ${
                isSelected
                  ? 'bg-[#2b2c32] border border-white/[0.18] shadow-[0_8px_30px_rgb(0,0,0,0.45)] ring-1 ring-white/10 scale-[1.02]'
                  : 'bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] hover:bg-[#28292f] hover:border-white/[0.1]'
              }`}
            >
              {/* Day Header */}
              <span
                className={`text-xs font-medium ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {dayLabel}
              </span>

              {/* Weather Icon with optional Rain chance */}
              <div className="my-auto py-2 flex flex-col items-center justify-center min-h-[48px]">
                {renderIcon(item.condition.icon)}
                {item.rainProbability > 0 && (
                  <span className="text-[10px] text-sky-400 font-semibold mt-1">
                    {item.rainProbability}%
                  </span>
                )}
              </div>

              {/* Temperatures: High and Low */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-white tracking-tight">
                  {Math.round(item.high)}°
                </span>
                <span className="text-xs text-slate-400 font-normal mt-0.5">
                  {Math.round(item.low)}°
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Compact Detailed Forecast Panel */}
      {activeDay && (
        <div className="rounded-2xl p-4 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] flex items-center justify-center text-white">
                <WeatherIcon icon={activeDay.condition.icon} size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-tight">
                  {activeDay.day} Outlook
                </h4>
                <p className="text-[11px] text-slate-400 capitalize">
                  {activeDay.condition.description || activeDay.condition.main}
                </p>
              </div>
            </div>

            <span className="text-[11px] text-slate-400">
              {activeDay.date}
            </span>
          </div>

          {/* Compact 5-Metric Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            {/* 1. High / Low */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Thermometer size={12} className="text-rose-400" /> High / Low
              </span>
              <div className="text-white font-semibold text-sm mt-1">
                <span className="text-rose-300">{Math.round(activeDay.high)}°</span>
                <span className="text-slate-400 font-normal text-xs mx-1">/</span>
                <span className="text-sky-300">{Math.round(activeDay.low)}°</span>
              </div>
            </div>

            {/* 2. Condition */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Sun size={12} className="text-amber-400" /> Condition
              </span>
              <span className="text-white font-semibold text-xs mt-1 truncate">
                {activeDay.condition.main}
              </span>
            </div>

            {/* 3. Rain Probability */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Droplets size={12} className="text-sky-400" /> Rain Probability
              </span>
              <span className="text-sky-300 font-semibold text-sm mt-1">
                {activeDay.rainProbability}%
              </span>
            </div>

            {/* 4. Wind Speed */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Wind size={12} className="text-teal-400" /> Wind Speed
              </span>
              <span className="text-teal-300 font-semibold text-sm mt-1">
                {activeDay.windSpeed} km/h
              </span>
            </div>

            {/* 5. Humidity */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Droplets size={12} className="text-indigo-400" /> Humidity
              </span>
              <span className="text-indigo-300 font-semibold text-sm mt-1">
                {activeDay.humidity}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
