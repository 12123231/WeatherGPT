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
      title: 'Minimal Weather Risk',
      description: 'Current meteorological indicators show standard conditions with no hazardous warnings.',
      precaution: 'Routine precautions apply. Good conditions for outdoor and transit operations.',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500 text-white',
      accentBorder: 'border-emerald-200 bg-emerald-50/30',
    },
    moderate: {
      title: 'Moderate Weather Advisory',
      description: 'Localized precipitation or temperature shifts may cause minor disruptions.',
      precaution: 'Monitor forecasts before traveling. Keep rain gear or sun protection ready.',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500 text-white',
      accentBorder: 'border-amber-200 bg-amber-50/30',
    },
    high: {
      title: 'Elevated Weather Risk',
      description: 'Significant weather anomalies detected. Potential for severe weather events.',
      precaution: 'Limit non-essential travel during peak alert hours. Stay tuned to civil advisories.',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: ShieldAlert,
      iconBg: 'bg-rose-600 text-white',
      accentBorder: 'border-rose-200 bg-rose-50/30',
    },
    severe: {
      title: 'Severe Weather Warning',
      description: 'Extreme meteorological conditions imminent or occurring. High hazard potential.',
      precaution: 'Seek sheltered locations. Avoid transit in flood-prone or exposed terrain.',
      badge: 'bg-red-200 text-red-900 border-red-400 font-bold animate-pulse',
      icon: ShieldAlert,
      iconBg: 'bg-red-600 text-white',
      accentBorder: 'border-red-300 bg-red-50/50',
    },
  }[overallLevel];

  const OverallIcon = overallConfig.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Overall Assessment Banner */}
      <div
        className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${overallConfig.accentBorder}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${overallConfig.iconBg}`}
            >
              <OverallIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {overallConfig.title}
                </h3>
                <span
                  className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${overallConfig.badge}`}
                >
                  {capitalize(overallLevel)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {locationName ? `Assessment for ${locationName}` : 'Regional Hazard Evaluation'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-700 block">
              Active Alerts
            </span>
            <span className="text-sm font-bold text-slate-900">
              {activeRisks.length} of {risks.length} items
            </span>
          </div>
        </div>

        {/* Detailed Assessment & Precaution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">
              Meteorological Context
            </span>
            <p className="text-slate-600 leading-relaxed">
              {overallConfig.description}
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-800 flex items-center gap-1 mb-1 text-blue-700">
              <Info size={13} /> Recommended Precaution
            </span>
            <p className="text-slate-600 leading-relaxed">
              {overallConfig.precaution}
            </p>
          </div>
        </div>
      </div>

      {/* List of individual risks */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Detailed Alerts & Advisory Breakdown
        </h4>

        {risks.length === 0 ? (
          <div className="p-6 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
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
