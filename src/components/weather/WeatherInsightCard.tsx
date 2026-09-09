import { Sparkles, Shirt, Activity, Clock, Info } from 'lucide-react';
import type { WeatherInsightResult } from '../../services/insightService';

interface WeatherInsightCardProps {
  insightResult: WeatherInsightResult;
  className?: string;
}

/**
 * WeatherInsightCard
 * 
 * Compact, polished AI Weather Insight card.
 * Placed between HeroWeatherCard and HourlyForecastStrip.
 * 
 * Displays:
 * - Header with spark tag & location
 * - Concise Plain-Language Weather Summary
 * - 3-Column Insight Metrics:
 *   1. Outdoor Activity Score (Favorable/Cautious/Unfavorable)
 *   2. What to Wear (Practical clothing advice)
 *   3. Key Weather Windows (Best outside, rain likely, peak heat, etc.)
 */
export default function WeatherInsightCard({
  insightResult,
  className = '',
}: WeatherInsightCardProps) {
  const { dataAvailable, locationName, dailySummary, activityAdvice, clothingAdvice, keyWindows } =
    insightResult;

  // 1. Data Unavailable State
  if (!dataAvailable) {
    return (
      <div
        className={`rounded-[28px] p-5 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-between gap-4 select-none ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
            <Info size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              <Sparkles size={12} className="text-slate-400" />
              <span>AI Weather Insight</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              AI Weather Insights unavailable — Live weather data offline.
            </p>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-medium shrink-0">
          {locationName}
        </span>
      </div>
    );
  }

  // 2. Score Badge Color
  const scoreCategory = activityAdvice.category;
  const scoreColor =
    scoreCategory === 'Favorable'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : scoreCategory === 'Cautious'
      ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div
      className={`rounded-[28px] p-5 sm:p-6 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col gap-4 select-none ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Sparkles size={14} />
          </div>
          <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">
            AI Weather Insight
          </span>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          {locationName} · Live Weather Data
        </span>
      </div>

      {/* Main Daily Plain-Language Summary */}
      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
        {dailySummary}
      </p>

      {/* 3 Insight Metric Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* 1. Outdoor Activity */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity size={13} className="text-sky-400" />
                Outdoor Activity
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreColor}`}>
                {activityAdvice.score}/100 · {scoreCategory}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              {activityAdvice.explanation}
            </p>
          </div>
        </div>

        {/* 2. What to Wear */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-2">
              <Shirt size={13} className="text-amber-400" />
              <span>What to Wear</span>
            </div>
            <div className="space-y-1">
              {clothingAdvice.map((item, idx) => (
                <p key={idx} className="text-xs text-slate-400 flex items-start gap-1.5 leading-normal">
                  <span className="text-sky-400 text-xs leading-none mt-1">•</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Best Weather Windows */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-2">
              <Clock size={13} className="text-emerald-400" />
              <span>Weather Windows</span>
            </div>
            {keyWindows.length > 0 ? (
              <div className="space-y-1.5">
                {keyWindows.map((win, idx) => (
                  <div key={idx} className="text-xs flex items-baseline justify-between gap-2">
                    <span className="text-slate-300 font-medium shrink-0">
                      {win.label}:
                    </span>
                    <span className="text-sky-300 font-semibold text-right text-[11px]">
                      {win.timeRange}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Conditions remain consistent through the afternoon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
