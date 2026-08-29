import type { WeatherRisk } from '../../types/weather';
import { WeatherIcon } from '../../utils/weatherIcons';
import { capitalize } from '../../utils/formatters';
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RiskAlertProps {
  risk: WeatherRisk;
  locationName?: string;
  className?: string;
}

export default function RiskAlert({
  risk,
  locationName,
  className = '',
}: RiskAlertProps) {
  // Refined severity styling mapping
  const severityConfig = {
    low: {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
      container: 'bg-emerald-950/15 border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    moderate: {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
      container: 'bg-amber-950/15 border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    high: {
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
      container: 'bg-orange-950/20 border-orange-500/25',
      iconColor: 'text-orange-400',
    },
    severe: {
      badge: 'bg-rose-500/20 text-rose-200 border-rose-500/30 font-semibold',
      container: 'bg-rose-950/25 border-rose-500/30',
      iconColor: 'text-rose-400',
    },
  }[risk.level];

  return (
    <div
      className={`glass-panel rounded-xl p-4 sm:p-5 transition-colors relative overflow-hidden border ${severityConfig.container} ${className}`}
    >
      <div className="flex items-start gap-3.5 relative z-10">
        <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 ${severityConfig.iconColor}`}>
          <WeatherIcon icon={risk.icon} size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white tracking-tight">{risk.title}</h4>
              <span
                className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${severityConfig.badge}`}
              >
                {capitalize(risk.level)}
              </span>
            </div>

            {/* Active / Inactive Status */}
            <div className="flex items-center gap-1 text-[11px]">
              {risk.isActive ? (
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Active Warning
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <CheckCircle2 size={13} />
                  Advisory Watch
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {risk.description}
          </p>

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>Valid: <strong className="text-slate-300 font-medium">{risk.timePeriod}</strong></span>
            </div>
            {locationName && (
              <div className="flex items-center gap-1">
                <ShieldAlert size={12} className="text-slate-400" />
                <span>Sector: <strong className="text-slate-300 font-medium">{locationName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
