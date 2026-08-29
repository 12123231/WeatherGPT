import type { WeatherRisk, RiskLevel } from '../../types/weather';
import RiskAlert from './RiskAlert';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { capitalize } from '../../utils/formatters';

interface RiskSummaryProps {
  risks: WeatherRisk[];
  locationName?: string;
  className?: string;
}

export default function RiskSummary({
  risks,
  locationName,
  className = '',
}: RiskSummaryProps) {
  // Determine overall risk level
  const activeRisks = risks.filter((r) => r.isActive);

  let overallLevel: RiskLevel = 'low';
  if (risks.some((r) => r.level === 'severe' && r.isActive)) {
    overallLevel = 'severe';
  } else if (risks.some((r) => r.level === 'high' && r.isActive)) {
    overallLevel = 'high';
  } else if (risks.some((r) => r.level === 'moderate' && r.isActive)) {
    overallLevel = 'moderate';
  }

  // Configuration for overall level in dark glass
  const overallConfig = {
    low: {
      title: 'Minimal Meteorological Risk',
      description: 'Current atmospheric indicators show nominal baseline conditions with no hazardous warnings.',
      precaution: 'Routine outdoor and transit operations are fully cleared across all transit sectors.',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shadow-emerald-500/20',
      accentBorder: 'border-emerald-500/20 bg-emerald-950/20',
    },
    moderate: {
      title: 'Moderate Weather Advisory',
      description: 'Localized precipitation or wind shifts may cause minor disruptions across surface routes.',
      precaution: 'Monitor live forecasts before long-distance transit. Keep weather gear on standby.',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-400/30 shadow-amber-500/20',
      accentBorder: 'border-amber-500/20 bg-amber-950/20',
    },
    high: {
      title: 'Elevated Weather Risk Notice',
      description: 'Significant atmospheric anomalies detected with severe wind gusts or flash precipitation potential.',
      precaution: 'Limit non-essential transit during peak alert windows. Monitor civil hazard broadcasts.',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      icon: ShieldAlert,
      iconBg: 'bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-rose-500/25',
      accentBorder: 'border-rose-500/30 bg-rose-950/25',
    },
    severe: {
      title: 'Severe Meteorological Warning',
      description: 'Extreme weather phenomenon imminent or underway. Extreme hazard potential to open zones.',
      precaution: 'Seek sturdy shelter immediately. Avoid all travel in low-lying, flood-prone, or exposed sectors.',
      badge: 'bg-red-500/30 text-red-200 border-red-400/50 font-black animate-pulse',
      icon: ShieldAlert,
      iconBg: 'bg-red-500/30 text-red-300 border border-red-400/50 shadow-red-500/30',
      accentBorder: 'border-red-500/40 bg-red-950/35',
    },
  }[overallLevel];

  const OverallIcon = overallConfig.icon;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Top Overall Assessment Banner */}
      <div
        className={`glass-panel rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden ${overallConfig.accentBorder}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${overallConfig.iconBg}`}
            >
              <OverallIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {overallConfig.title}
                </h3>
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-0.5 rounded-full border ${overallConfig.badge}`}
                >
                  {capitalize(overallLevel)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {locationName ? `Assessment for ${locationName}` : 'Regional Hazard Evaluation Matrix'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right glass-pill px-4 py-2 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Active Alerts
            </span>
            <span className="text-sm font-extrabold text-white">
              {activeRisks.length} of {risks.length} advisories
            </span>
          </div>
        </div>

        {/* Detailed Assessment & Precaution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4 text-xs relative z-10">
          <div className="glass-pill p-4 rounded-2xl">
            <span className="font-extrabold text-white block mb-1">
              Meteorological Context
            </span>
            <p className="text-slate-300 leading-relaxed">
              {overallConfig.description}
            </p>
          </div>

          <div className="glass-pill p-4 rounded-2xl">
            <span className="font-extrabold text-blue-300 flex items-center gap-1.5 mb-1">
              <Info size={14} className="text-blue-400" /> Recommended Precaution
            </span>
            <p className="text-slate-300 leading-relaxed">
              {overallConfig.precaution}
            </p>
          </div>
        </div>
      </div>

      {/* List of individual risks */}
      <div className="space-y-3 relative z-10">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Detailed Alerts & Advisory Breakdown
        </h4>

        {risks.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-3xl text-xs text-slate-400">
            No active hazards or weather advisories recorded for this area.
          </div>
        ) : (
          risks.map((risk) => (
            <RiskAlert
              key={risk.id}
              risk={risk}
              locationName={locationName}
            />
          ))
        )}
      </div>
    </div>
  );
}
