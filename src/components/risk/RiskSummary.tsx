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

  // Configuration for overall level
  const overallConfig = {
    low: {
      title: 'Minimal Meteorological Risk',
      description: 'Current atmospheric indicators show nominal baseline conditions with no hazardous warnings.',
      precaution: 'Routine outdoor and transit operations are cleared across all sectors.',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      accentBorder: 'border-emerald-500/20 bg-emerald-950/15',
    },
    moderate: {
      title: 'Moderate Weather Advisory',
      description: 'Localized precipitation or wind shifts may cause minor disruptions across surface routes.',
      precaution: 'Monitor live forecasts before long-distance transit. Keep weather gear on standby.',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      accentBorder: 'border-amber-500/20 bg-amber-950/15',
    },
    high: {
      title: 'Elevated Weather Risk Notice',
      description: 'Significant atmospheric anomalies detected with elevated wind gusts or flash precipitation potential.',
      precaution: 'Limit non-essential transit during peak alert windows. Monitor civil hazard broadcasts.',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
      icon: ShieldAlert,
      iconColor: 'text-orange-400',
      accentBorder: 'border-orange-500/20 bg-orange-950/20',
    },
    severe: {
      title: 'Severe Meteorological Warning',
      description: 'Extreme weather phenomenon imminent or underway. Extreme hazard potential to open zones.',
      precaution: 'Seek sturdy shelter immediately. Avoid travel in low-lying, flood-prone, or exposed sectors.',
      badge: 'bg-rose-500/20 text-rose-200 border-rose-500/30 font-semibold',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      accentBorder: 'border-rose-500/30 bg-rose-950/25',
    },
  }[overallLevel];

  const OverallIcon = overallConfig.icon;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Top Overall Assessment Banner */}
      <div
        className={`glass-panel rounded-2xl p-5 sm:p-6 border transition-colors relative overflow-hidden ${overallConfig.accentBorder}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07] relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 ${overallConfig.iconColor}`}
            >
              <OverallIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {overallConfig.title}
                </h3>
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${overallConfig.badge}`}
                >
                  {capitalize(overallLevel)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {locationName ? `Assessment for ${locationName}` : 'Regional Hazard Evaluation'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <span>Active Advisories: <strong className="text-white font-medium">{activeRisks.length} of {risks.length}</strong></span>
          </div>
        </div>

        {/* Detailed Assessment & Precaution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs relative z-10">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="font-semibold text-white block mb-1">
              Meteorological Context
            </span>
            <p className="text-slate-300 leading-relaxed">
              {overallConfig.description}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="font-semibold text-sky-300 flex items-center gap-1.5 mb-1">
              <Info size={13} className="text-sky-400" /> Recommended Precaution
            </span>
            <p className="text-slate-300 leading-relaxed">
              {overallConfig.precaution}
            </p>
          </div>
        </div>
      </div>

      {/* List of individual risks */}
      <div className="space-y-3 relative z-10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Advisory Details
        </h4>

        {risks.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl text-xs text-slate-400">
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
