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

  // Severity styles mapping
  const severityConfig = {
    low: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      container: 'bg-emerald-50/50 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      indicator: 'bg-emerald-500',
    },
    moderate: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      container: 'bg-amber-50/50 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      indicator: 'bg-amber-500',
    },
    high: {
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      container: 'bg-rose-50/50 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
      indicator: 'bg-rose-500',
    },
    severe: {
      badge: 'bg-red-200 text-red-900 border-red-300 font-bold',
      container: 'bg-red-50 border-red-300 shadow-sm',
      iconBg: 'bg-red-200 text-red-800',
      indicator: 'bg-red-600 animate-ping',
    },
  }[risk.level];

  return (
    <div
      className={`border rounded-xl p-4 transition-all relative overflow-hidden ${severityConfig.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Severity & Icon Badge */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${severityConfig.iconBg}`}
        >
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{risk.title}</h4>
              <span
                className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${severityConfig.badge}`}
              >
                {capitalize(risk.level)} Risk
              </span>
            </div>

            {/* Active / Inactive Status */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              {risk.isActive ? (
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${severityConfig.indicator}`} />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                  </span>
                  Active Alert
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <CheckCircle2 size={12} />
                  Advisory Watch
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            {risk.description}
          </p>

          {/* Footer Metadata: Time Period & Affected Context */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-black/5">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>Valid: <strong className="text-slate-700">{risk.timePeriod}</strong></span>
            </div>
            {locationName && (
              <div className="flex items-center gap-1">
                <ShieldAlert size={12} className="text-slate-400" />
                <span>Region: <strong className="text-slate-700">{locationName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
