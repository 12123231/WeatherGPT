import { Link } from 'react-router-dom';
import type { CurrentWeather, WeatherRisk } from '../../types/weather';
import { ChevronRight, Droplets, Wind, Gauge, ArrowUp } from 'lucide-react';

interface LiveConditionsCardProps {
  weather: CurrentWeather;
  risks?: WeatherRisk[];
  className?: string;
}

export default function LiveConditionsCard({
  weather,
  risks = [],
  className = '',
}: LiveConditionsCardProps) {
  const hasActiveRisks = risks.some((r) => r.isActive && (r.level === 'high' || r.level === 'severe'));
  const isModerateRisk = risks.some((r) => r.isActive && r.level === 'moderate') || weather.uvIndex >= 8;

  const statusLabel = hasActiveRisks ? 'Dangerous' : isModerateRisk ? 'Moderate' : 'Optimal';
  const statusBadgeColor = hasActiveRisks
    ? 'bg-[#8f3914]/80 text-amber-200 border-amber-500/30'
    : isModerateRisk
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  // Pressure format: 1013 hPa or ~1 kPa / 101.3 kPa
  const pressureDisplay = weather.pressure >= 900
    ? `${Math.round(weather.pressure / 1000)} kPa`
    : `${weather.pressure} hPa`;

  return (
    <div
      className={`rounded-[28px] p-6 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <Link
            to="/forecast"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-sky-300 transition-colors"
          >
            <span>Live Conditions</span>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Subheader: Trend & Status Pill */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
            <ArrowUp size={13} className="text-slate-300" />
            <span>23.8%</span>
          </div>

          <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${statusBadgeColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Spline Wave Curve Chart */}
      <div className="my-4 relative py-2">
        <svg
          viewBox="0 0 320 60"
          className="w-full h-14 overflow-visible select-none"
        >
          <defs>
            {/* Multi-stop gradient curve stroke: Cyan -> Purple -> Orange */}
            <linearGradient id="liveConditionWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#818cf8" />
              <stop offset="70%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>

          {/* Smooth S-curve spline path */}
          <path
            d="M 10,38 C 70,38 90,14 150,14 C 210,14 230,30 280,30 C 295,30 305,20 315,10"
            fill="none"
            stroke="url(#liveConditionWaveGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Glowing Target Node on Curve */}
          <g transform="translate(265, 30)">
            <circle r="7" fill="rgba(255, 255, 255, 0.25)" />
            <circle r="4" fill="#ffffff" stroke="#232428" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Bottom 3 Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-center">
        {/* Humidity */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs font-semibold text-white">
            <Droplets size={13} className="text-slate-400" />
            <span>{weather.humidity}%</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5">
            Humidity
          </span>
        </div>

        {/* Wind */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs font-semibold text-white">
            <Wind size={13} className="text-slate-400" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5">
            Wind
          </span>
        </div>

        {/* Pressure */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs font-semibold text-white">
            <Gauge size={13} className="text-slate-400" />
            <span>{pressureDisplay}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5">
            Pressure
          </span>
        </div>
      </div>
    </div>
  );
}
