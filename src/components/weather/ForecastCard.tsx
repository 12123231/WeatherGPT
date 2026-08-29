import { useState } from 'react';
import type { ForecastDay } from '../../types/weather';
import { getWeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatRainProbability, formatWind, formatHumidity } from '../../utils/formatters';
import { Calendar, Droplets, Wind, Thermometer, Sparkles, Info } from 'lucide-react';

interface ForecastCardProps {
  forecast: ForecastDay[];
  className?: string;
}

export default function ForecastCard({ forecast, className = '' }: ForecastCardProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!forecast || forecast.length === 0) {
    return null;
  }

  const selectedDay = forecast[selectedDayIndex] || forecast[0];
  const SelectedIcon = getWeatherIcon(selectedDay.condition.icon);

  // SVG Spline Wave Curve Calculations
  const svgWidth = 700;
  const svgHeight = 110;
  const paddingX = 40;
  const paddingY = 24;

  const allHighs = forecast.map((d) => d.high);
  const allLows = forecast.map((d) => d.low);
  const maxHigh = Math.max(...allHighs);
  const minLow = Math.min(...allLows);
  const tempRange = Math.max(maxHigh - minLow, 1);

  const getCoordinates = (temps: number[]) => {
    return temps.map((temp, idx) => {
      const x = paddingX + (idx / Math.max(forecast.length - 1, 1)) * (svgWidth - paddingX * 2);
      const y = paddingY + (1 - (temp - minLow) / tempRange) * (svgHeight - paddingY * 2);
      return { x, y };
    });
  };

  const highPoints = getCoordinates(allHighs);
  const lowPoints = getCoordinates(allLows);

  // Build smooth cubic bezier curve
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1},${cy1} ${cx2},${cy2} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const highCurvePath = createSmoothPath(highPoints);
  const lowCurvePath = createSmoothPath(lowPoints);
  const selectedHighPoint = highPoints[selectedDayIndex] || highPoints[0];

  return (
    <div
      className={`glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Ambient background blur */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-inner">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              7-Day Meteorological Outlook
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Interactive atmospheric variance & high-precision projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
            Selected: <strong className="text-blue-400">{selectedDay.day}</strong>
          </span>
          <span className="text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2.5 py-1 rounded-full">
            {forecast.length} Days
          </span>
        </div>
      </div>

      {/* Smooth Temperature Wave Visualization (Inspired by Reference 1) */}
      <div className="mb-6 relative z-10 bg-slate-950/40 rounded-2xl border border-white/[0.07] p-3 sm:p-4 backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Sparkles size={12} className="text-blue-400" />
            Temperature Trend Curve (°C)
          </span>
          <span className="text-slate-400 text-[10px]">
            Peak: <strong className="text-rose-400">{formatTemp(maxHigh)}</strong> • Low: <strong className="text-sky-400">{formatTemp(minLow)}</strong>
          </span>
        </div>

        <div className="w-full overflow-x-auto scrollbar-none py-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full min-w-[550px] h-[100px] sm:h-[115px] overflow-visible select-none"
          >
            <defs>
              {/* Curve glowing gradient */}
              <linearGradient id="tempCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>

              {/* Area fill gradient */}
              <linearGradient id="tempAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.25)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.0)" />
              </linearGradient>

              {/* Filter glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Area under curve */}
            <path
              d={`${highCurvePath} L ${highPoints[highPoints.length - 1].x},${svgHeight} L ${highPoints[0].x},${svgHeight} Z`}
              fill="url(#tempAreaGrad)"
            />

            {/* Low Temperature Subtle Trajectory Curve */}
            <path
              d={lowCurvePath}
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Main Smooth High Temperature Spline Curve */}
            <path
              d={highCurvePath}
              fill="none"
              stroke="url(#tempCurveGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />

            {/* Vertical Guide Line for Selected Day */}
            <line
              x1={selectedHighPoint.x}
              y1={paddingY - 8}
              x2={selectedHighPoint.x}
              y2={svgHeight - 8}
              stroke="rgba(96, 165, 250, 0.6)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Nodes for each forecast day */}
            {highPoints.map((pt, idx) => {
              const isSelected = idx === selectedDayIndex;
              const dayHigh = allHighs[idx];

              return (
                <g key={idx} className="cursor-pointer" onClick={() => setSelectedDayIndex(idx)}>
                  {/* Subtle Node Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '6' : '3.5'}
                    fill={isSelected ? '#60a5fa' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="transition-all duration-300"
                  />

                  {/* Pulsing Beacon Halo for Selected Day (Inspired by Reference 1) */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="rgba(96, 165, 250, 0.3)"
                      className="animate-ping"
                    />
                  )}

                  {/* Temperature label above node */}
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight={isSelected ? '800' : '600'}
                  >
                    {dayHigh}°
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interactive 7-Day Grid Cards / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 relative z-10">
        {forecast.map((item, idx) => {
          const Icon = getWeatherIcon(item.condition.icon);
          const isSelected = idx === selectedDayIndex;
          const isToday = idx === 0;

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              aria-label={`Select ${item.day} forecast`}
              className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group select-none text-left sm:text-center ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-500/25 to-indigo-600/20 border-blue-400/50 shadow-lg shadow-blue-500/15 scale-[1.02] ring-1 ring-blue-400/30'
                  : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5'
              }`}
            >
              {/* Day & Date Header */}
              <div className="w-full">
                <div className="flex items-center justify-between sm:justify-center gap-1">
                  <p
                    className={`text-xs font-bold tracking-tight ${
                      isSelected ? 'text-blue-300' : isToday ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {isToday ? 'Today' : item.day.slice(0, 3)}
                  </p>
                  {isToday && (
                    <span className="sm:hidden text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded">
                      Now
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                  {item.date.slice(5)}
                </p>
              </div>

              {/* Weather Icon with condition-reactive colors */}
              <div className="my-2.5 flex flex-col items-center">
                <div
                  className={`p-2 rounded-xl transition-transform duration-200 group-hover:scale-110 ${
                    isSelected ? 'bg-blue-500/20 shadow-inner' : 'bg-white/[0.03]'
                  }`}
                >
                  <Icon
                    size={24}
                    className={
                      item.condition.icon.includes('sun') || item.condition.icon === 'sun'
                        ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                        : item.condition.icon.includes('rain')
                        ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                        : item.condition.icon.includes('lightning') || item.condition.icon.includes('storm')
                        ? 'text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.4)]'
                        : 'text-slate-300'
                    }
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-300 line-clamp-1 mt-1 max-w-[80px]">
                  {item.condition.main}
                </span>
              </div>

              {/* High / Low Temp Display */}
              <div className="w-full pt-1.5 border-t border-white/[0.08]">
                <div className="flex items-baseline justify-center gap-1.5 text-xs font-extrabold text-white">
                  <span className="text-rose-300">{formatTemp(item.high)}</span>
                  <span className="text-slate-400 font-medium text-[11px]">
                    {formatTemp(item.low)}
                  </span>
                </div>

                {/* Rain probability */}
                <div className="flex items-center justify-center gap-1 text-[10px] text-sky-400 font-semibold mt-1">
                  <Droplets size={10} />
                  <span>{formatRainProbability(item.rainProbability)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Selected Day Telemetry Drawer (Phase 3 requirement) */}
      <div className="mt-5 pt-4 border-t border-white/10 relative z-10 bg-slate-950/35 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center">
              <SelectedIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white">
                  {selectedDay.day} Projected Outlook
                </h4>
                <span className="text-[10px] font-semibold bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded-full">
                  {selectedDay.date}
                </span>
              </div>
              <p className="text-xs text-slate-400 capitalize">
                {selectedDay.condition.description || selectedDay.condition.main}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Info size={13} className="text-blue-400" />
            <span>Interactive telemetry active</span>
          </div>
        </div>

        {/* Selected Day Rich Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="glass-pill p-2.5 rounded-xl">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Thermometer size={12} className="text-rose-400" /> Temperature Range
            </span>
            <div className="font-extrabold text-white text-sm mt-1">
              <span className="text-rose-300">{formatTemp(selectedDay.high)}</span>
              <span className="text-slate-400 font-normal text-xs mx-1">/</span>
              <span className="text-sky-300">{formatTemp(selectedDay.low)}</span>
            </div>
          </div>

          <div className="glass-pill p-2.5 rounded-xl">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Droplets size={12} className="text-sky-400" /> Rain Probability
            </span>
            <div className="font-extrabold text-sky-300 text-sm mt-1">
              {formatRainProbability(selectedDay.rainProbability)}
            </div>
          </div>

          <div className="glass-pill p-2.5 rounded-xl">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Wind size={12} className="text-teal-400" /> Wind Velocity
            </span>
            <div className="font-extrabold text-teal-300 text-sm mt-1">
              {formatWind(selectedDay.windSpeed, 'km/h')}
            </div>
          </div>

          <div className="glass-pill p-2.5 rounded-xl">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Droplets size={12} className="text-blue-400" /> Humidity Level
            </span>
            <div className="font-extrabold text-blue-300 text-sm mt-1">
              {formatHumidity(selectedDay.humidity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
