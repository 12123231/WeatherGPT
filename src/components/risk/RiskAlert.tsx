import type { WeatherRisk } from '../../types/weather';
import { getWeatherIcon } from '../../utils/weatherIcons';
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
  const Icon = getWeatherIcon(risk.icon);

  // Severity dark glass styles mapping
  const severityConfig = {
    low: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      container: 'bg-emerald-950/25 border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shadow-emerald-500/20',
      indicator: 'bg-emerald-400',
    },
    moderate: {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      container: 'bg-amber-950/25 border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-400/30 shadow-amber-500/20',
      indicator: 'bg-amber-400',
    },
    high: {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      container: 'bg-rose-950/30 border-rose-500/30',
      iconBg: 'bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-rose-500/25',
      indicator: 'bg-rose-500',
    },
    severe: {
      badge: 'bg-red-500/30 text-red-200 border-red-400/50 font-black',
      container: 'bg-red-950/40 border-red-500/40 shadow-lg shadow-red-500/10',
      iconBg: 'bg-red-500/30 text-red-300 border border-red-400/50 shadow-red-500/30',
      indicator: 'bg-red-500 animate-ping',
    },
  }[risk.level];

  return (
    <div
      className={`glass-panel rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${severityConfig.container} ${className}`}
    >
      <div className="flex items-start gap-3.5 relative z-10">
        {/* Severity & Icon Badge */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${severityConfig.iconBg}`}
        >
          <Icon size={22} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{risk.title}</h4>
              <span
                className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${severityConfig.badge}`}
              >
                {capitalize(risk.level)} Risk
              </span>
            </div>

            {/* Active / Inactive Status */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {risk.isActive ? (
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${severityConfig.indicator}`} />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  Active Alert
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
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2.5 border-t border-white/10">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-blue-400" />
              <span>Valid: <strong className="text-slate-200">{risk.timePeriod}</strong></span>
            </div>
            {locationName && (
              <div className="flex items-center gap-1">
                <ShieldAlert size={12} className="text-rose-400" />
                <span>Region: <strong className="text-slate-200">{locationName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
