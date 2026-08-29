import { useState } from 'react';
import type { ForecastDay } from '../../types/weather';
import { WeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatRainProbability, formatWind, formatHumidity } from '../../utils/formatters';
import { Calendar, Droplets, Wind, Thermometer } from 'lucide-react';

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

  // SVG Spline Wave Curve Calculations
  const svgWidth = 700;
  const svgHeight = 100;
  const paddingX = 35;
  const paddingY = 22;

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
      className={`glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/[0.07] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              7-Day Meteorological Outlook
            </h3>
            <p className="text-xs text-slate-400">
              Projected daily high/low variances & atmospheric trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Active: <strong className="text-white font-medium">{selectedDay.day}</strong></span>
        </div>
      </div>

      {/* Temperature Trend Curve */}
      <div className="mb-5 relative z-10 bg-white/[0.02] rounded-xl border border-white/[0.05] p-3 sm:p-4">
        <div className="flex items-center justify-between px-1 mb-1 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Temperature Trend Curve (°C)</span>
          <span className="text-[11px]">
            Peak: <span className="text-rose-400 font-medium">{formatTemp(maxHigh)}</span> • Low: <span className="text-sky-400 font-medium">{formatTemp(minLow)}</span>
          </span>
        </div>

        <div className="w-full overflow-x-auto scrollbar-none py-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full min-w-[500px] h-[90px] sm:h-[105px] overflow-visible select-none"
          >
            <defs>
              <linearGradient id="tempCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>

              <linearGradient id="tempAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.15)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.0)" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <path
              d={`${highCurvePath} L ${highPoints[highPoints.length - 1].x},${svgHeight} L ${highPoints[0].x},${svgHeight} Z`}
              fill="url(#tempAreaGrad)"
            />

            {/* Low Temperature Trajectory Curve */}
            <path
              d={lowCurvePath}
              fill="none"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* High Temperature Spline Curve */}
            <path
              d={highCurvePath}
              fill="none"
              stroke="url(#tempCurveGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical Guide Line for Selected Day */}
            <line
              x1={selectedHighPoint.x}
              y1={paddingY - 6}
              x2={selectedHighPoint.x}
              y2={svgHeight - 6}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Nodes for each forecast day */}
            {highPoints.map((pt, idx) => {
              const isSelected = idx === selectedDayIndex;
              const dayHigh = allHighs[idx];

              return (
                <g key={idx} className="cursor-pointer" onClick={() => setSelectedDayIndex(idx)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '5' : '3'}
                    fill={isSelected ? '#38bdf8' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                    strokeWidth={isSelected ? '2' : '1'}
                    className="transition-all duration-200"
                  />

                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'}
                    fontSize={isSelected ? '11' : '10'}
                    fontWeight={isSelected ? '600' : '400'}
                  >
                    {dayHigh}°
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 relative z-10">
        {forecast.map((item, idx) => {
          const isSelected = idx === selectedDayIndex;
          const isToday = idx === 0;

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              aria-label={`Select ${item.day} forecast`}
              className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.08] border-white/[0.16] text-white shadow-xs'
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] text-slate-300'
              }`}
            >
              {/* Day & Date */}
              <div className="w-full">
                <p
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-sky-300' : isToday ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {isToday ? 'Today' : item.day.slice(0, 3)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.date.slice(5)}
                </p>
              </div>

              {/* Weather Icon */}
              <div className="my-2 flex flex-col items-center">
                <div className="p-1.5 rounded-lg">
                  <WeatherIcon
                    icon={item.condition.icon}
                    size={22}
                    className={
                      item.condition.icon.includes('sun')
                        ? 'text-amber-400'
                        : item.condition.icon.includes('rain')
                        ? 'text-sky-400'
                        : item.condition.icon.includes('storm') || item.condition.icon.includes('lightning')
                        ? 'text-indigo-400'
                        : 'text-slate-300'
                    }
                  />
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[70px]">
                  {item.condition.main}
                </span>
              </div>

              {/* High / Low Temp Display */}
              <div className="w-full pt-1.5 border-t border-white/[0.05]">
                <div className="flex items-baseline justify-center gap-1.5 text-xs font-semibold text-white">
                  <span className="text-rose-300">{formatTemp(item.high)}</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    {formatTemp(item.low)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1 text-[10px] text-sky-400 mt-0.5">
                  <Droplets size={9} />
                  <span>{formatRainProbability(item.rainProbability)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Telemetry Details */}
      <div className="mt-4 pt-4 border-t border-white/[0.07] relative z-10 bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] text-sky-400 flex items-center justify-center">
              <WeatherIcon icon={selectedDay.condition.icon} size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">
                  {selectedDay.day} Forecast Details
                </h4>
                <span className="text-[10px] text-slate-400">
                  {selectedDay.date}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 capitalize">
                {selectedDay.condition.description || selectedDay.condition.main}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Day Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Thermometer size={12} className="text-rose-400" /> Temperature
            </span>
            <div className="font-semibold text-white text-sm mt-0.5">
              <span className="text-rose-300">{formatTemp(selectedDay.high)}</span>
              <span className="text-slate-400 font-normal text-xs mx-1">/</span>
              <span className="text-sky-300">{formatTemp(selectedDay.low)}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Droplets size={12} className="text-sky-400" /> Rain Chance
            </span>
            <div className="font-semibold text-sky-300 text-sm mt-0.5">
              {formatRainProbability(selectedDay.rainProbability)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Wind size={12} className="text-teal-400" /> Wind Speed
            </span>
            <div className="font-semibold text-teal-300 text-sm mt-0.5">
              {formatWind(selectedDay.windSpeed, 'km/h')}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Droplets size={12} className="text-sky-400" /> Humidity
            </span>
            <div className="font-semibold text-sky-300 text-sm mt-0.5">
              {formatHumidity(selectedDay.humidity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
