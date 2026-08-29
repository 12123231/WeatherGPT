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

  // Helper for UV arc gauge (semi-circle from -180deg to 0deg)
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
      {/* 1. UV Index Card (With Semi-Circular Arc Gauge from Reference 2) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">UV Index</span>
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <SunMedium size={15} />
          </div>
        </div>

        {/* Semi-circular Arc Gauge */}
        <div className="flex items-center justify-between my-2">
          <div className="relative w-16 h-10 flex items-end justify-center">
            <svg viewBox="0 0 70 38" className="w-16 h-9 overflow-visible">
              <defs>
                <linearGradient id="uvGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Background Arc */}
              <path
                d="M 7,35 A 28,28 0 0 1 63,35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Active Value Arc */}
              <path
                d="M 7,35 A 28,28 0 0 1 63,35"
                fill="none"
                stroke="url(#uvGaugeGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={arcCircumference}
                strokeDashoffset={arcStrokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-white tracking-tight">
              {weather.uvIndex} <span className="text-xs font-semibold text-slate-400">/ 12</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${
                weather.uvIndex >= 8
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  : weather.uvIndex >= 6
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {uvInfo.label}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span>Sun Protection</span>
          <span className="text-slate-300 font-medium">
            {weather.uvIndex >= 6 ? 'Required' : 'Optional'}
          </span>
        </div>
      </div>

      {/* 2. Wind Speed Card (With Flowing Sparkline Wave from Reference 2) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">Wind Dynamics</span>
          <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-400/30 flex items-center justify-center shrink-0">
            <Wind size={15} />
          </div>
        </div>

        {/* Dynamic Wind Waveform Visual */}
        <div className="my-1.5 flex items-center justify-between">
          <div className="w-16 h-8">
            <svg viewBox="0 0 64 24" className="w-full h-full overflow-visible">
              <path
                d="M 2,12 Q 16,2 32,12 T 62,12"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <path
                d="M 2,18 Q 16,8 32,18 T 62,18"
                fill="none"
                stroke="rgba(45, 212, 191, 0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="text-right">
            <div className="text-lg font-black text-white tracking-tight">
              {weather.windSpeed} <span className="text-xs font-medium text-slate-400">km/h</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-teal-300 font-semibold mt-0.5">
              <Compass size={11} className="text-teal-400" />
              <span>{weather.windDirection}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span>Airflow State</span>
          <span className="text-slate-300 font-medium">
            {weather.windSpeed > 20 ? 'Breezy Gusts' : 'Gentle Breeze'}
          </span>
        </div>
      </div>

      {/* 3. Humidity Card (With Droplet Moisture Progress Scale) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">Humidity</span>
          <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
            <Droplets size={15} />
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-xl font-black text-white tracking-tight">
              {weather.humidity}%
            </div>
            <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full">
              {weather.humidity > 70 ? 'High' : weather.humidity < 30 ? 'Dry' : 'Ideal'}
            </span>
          </div>

          {/* Moisture Progress Bar */}
          <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${humidityPercent}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span>Dew Point</span>
          <span className="text-slate-300 font-medium">
            {Math.round(weather.temperature - (100 - weather.humidity) / 5)}°C
          </span>
        </div>
      </div>

      {/* 4. Visibility Card (With Visual Line-of-Sight Range Bar) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">Visibility</span>
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Eye size={15} />
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-xl font-black text-white tracking-tight">
              {weather.visibility} <span className="text-xs font-medium text-slate-400">km</span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
              {weather.visibility >= 10 ? 'Clear' : 'Moderate'}
            </span>
          </div>

          {/* Range Step Meter */}
          <div className="grid grid-cols-5 gap-1 w-full h-2">
            {[2, 4, 6, 8, 10].map((step, idx) => (
              <div
                key={idx}
                className={`rounded-sm transition-all duration-500 ${
                  weather.visibility >= step ? 'bg-indigo-400' : 'bg-white/[0.08]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span>Clarity</span>
          <span className="text-slate-300 font-medium">
            {weather.visibility >= 10 ? 'Full Horizon' : 'Hazy Distance'}
          </span>
        </div>
      </div>

      {/* 5. Atmospheric Pressure Card (With Barometric Dial Scale) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">Air Pressure</span>
          <div className="w-7 h-7 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-400/30 flex items-center justify-center shrink-0">
            <Gauge size={15} />
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-xl font-black text-white tracking-tight">
              {weather.pressure} <span className="text-xs font-medium text-slate-400">hPa</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-300 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/10">
              {weather.pressure >= 1013 ? 'High' : 'Normal'}
            </span>
          </div>

          {/* Pressure Needle Slider */}
          <div className="relative w-full h-2 bg-white/[0.08] rounded-full overflow-visible">
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 border-2 border-white shadow-md transition-all duration-700"
              style={{ left: `${pressurePercent}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span>Barometric Base</span>
          <span className="text-slate-300 font-medium">1013 hPa Std</span>
        </div>
      </div>
    </div>
  );
}
