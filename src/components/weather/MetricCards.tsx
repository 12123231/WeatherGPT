import type { CurrentWeather } from '../../types/weather';
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  SunMedium,
  Compass,
} from 'lucide-react';
import { formatUVIndex } from '../../utils/formatters';

interface MetricCardsProps {
  weather: CurrentWeather;
  className?: string;
}

export default function MetricCards({ weather, className = '' }: MetricCardsProps) {
  const uvInfo = formatUVIndex(weather.uvIndex);

  // Helper for UV arc gauge
  const uvNormalized = Math.min(Math.max(weather.uvIndex, 0), 12) / 12;
  const arcRadius = 28;
  const arcCircumference = Math.PI * arcRadius;
  const arcStrokeDashoffset = arcCircumference * (1 - uvNormalized);

  // Helper for humidity percent
  const humidityPercent = Math.min(Math.max(weather.humidity, 0), 100);

  // Helper for pressure percent (970 to 1050 hPa range)
  const pressurePercent = Math.min(Math.max(((weather.pressure - 970) / (1050 - 970)) * 100, 0), 100);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 ${className}`}>
      {/* 1. UV Index Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-white/[0.12] group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400">UV Index</span>
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] text-amber-400 flex items-center justify-center shrink-0">
            <SunMedium size={14} />
          </div>
        </div>

        {/* Semi-circular Arc Gauge */}
        <div className="flex items-center justify-between my-2">
          <div className="relative w-14 h-9 flex items-end justify-center">
            <svg viewBox="0 0 70 38" className="w-14 h-8 overflow-visible">
              <defs>
                <linearGradient id="uvGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path
                d="M 7,35 A 28,28 0 0 1 63,35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M 7,35 A 28,28 0 0 1 63,35"
                fill="none"
                stroke="url(#uvGaugeGrad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={arcCircumference}
                strokeDashoffset={arcStrokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-white tracking-tight">
              {weather.uvIndex} <span className="text-xs font-normal text-slate-400">/ 12</span>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                weather.uvIndex >= 8
                  ? 'bg-rose-500/15 text-rose-300'
                  : weather.uvIndex >= 6
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-emerald-500/15 text-emerald-300'
              }`}
            >
              {uvInfo.label}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span>Protection</span>
          <span className="text-slate-300 font-medium">
            {weather.uvIndex >= 6 ? 'Required' : 'Optional'}
          </span>
        </div>
      </div>

      {/* 2. Wind Dynamics Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-white/[0.12] group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400">Wind Velocity</span>
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] text-teal-400 flex items-center justify-center shrink-0">
            <Wind size={14} />
          </div>
        </div>

        {/* Minimal Wind Wave Vector */}
        <div className="my-1.5 flex items-center justify-between">
          <div className="w-14 h-7">
            <svg viewBox="0 0 64 24" className="w-full h-full overflow-visible">
              <path
                d="M 2,12 Q 16,3 32,12 T 62,12"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 2,17 Q 16,8 32,17 T 62,17"
                fill="none"
                stroke="rgba(45, 212, 191, 0.25)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-white tracking-tight">
              {weather.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-teal-400 font-medium mt-0.5">
              <Compass size={11} />
              <span>{weather.windDirection}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span>Flow</span>
          <span className="text-slate-300 font-medium">
            {weather.windSpeed > 20 ? 'Moderate Gusts' : 'Gentle Breeze'}
          </span>
        </div>
      </div>

      {/* 3. Humidity Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-white/[0.12] group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400">Humidity</span>
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] text-sky-400 flex items-center justify-center shrink-0">
            <Droplets size={14} />
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-lg font-semibold text-white tracking-tight">
              {weather.humidity}%
            </div>
            <span className="text-[10px] font-medium text-sky-300">
              {weather.humidity > 70 ? 'Humid' : weather.humidity < 30 ? 'Dry' : 'Normal'}
            </span>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-700"
              style={{ width: `${humidityPercent}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span>Dew Point</span>
          <span className="text-slate-300 font-medium">
            {Math.round(weather.temperature - (100 - weather.humidity) / 5)}°C
          </span>
        </div>
      </div>

      {/* 4. Visibility Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-white/[0.12] group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400">Visibility</span>
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] text-indigo-400 flex items-center justify-center shrink-0">
            <Eye size={14} />
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-lg font-semibold text-white tracking-tight">
              {weather.visibility} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <span className="text-[10px] font-medium text-indigo-300">
              {weather.visibility >= 10 ? 'Clear' : 'Moderate'}
            </span>
          </div>

          {/* Range Step Meter */}
          <div className="grid grid-cols-5 gap-1 w-full h-1.5">
            {[2, 4, 6, 8, 10].map((step, idx) => (
              <div
                key={idx}
                className={`rounded-xs transition-all duration-500 ${
                  weather.visibility >= step ? 'bg-indigo-400' : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span>Horizon</span>
          <span className="text-slate-300 font-medium">
            {weather.visibility >= 10 ? 'Clear Sight' : 'Slight Haze'}
          </span>
        </div>
      </div>

      {/* 5. Air Pressure Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-white/[0.12] group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400">Pressure</span>
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] text-slate-300 flex items-center justify-center shrink-0">
            <Gauge size={14} />
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-lg font-semibold text-white tracking-tight">
              {weather.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <span className="text-[10px] font-medium text-slate-300">
              {weather.pressure >= 1013 ? 'High' : 'Normal'}
            </span>
          </div>

          {/* Pressure Line Slider */}
          <div className="relative w-full h-1.5 bg-white/[0.06] rounded-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-400 border border-white shadow-xs transition-all duration-700"
              style={{ left: `${pressurePercent}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span>Baseline</span>
          <span className="text-slate-300 font-medium">1013 hPa Std</span>
        </div>
      </div>
    </div>
  );
}
