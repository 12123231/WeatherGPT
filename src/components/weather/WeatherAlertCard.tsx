import { AlertCircle, AlertTriangle, CheckCircle, Info, Clock, MapPin } from 'lucide-react';
import type { AlertEngineResult, WeatherAlert } from '../../services/alertService';

interface WeatherAlertCardProps {
  alertResult: AlertEngineResult;
  className?: string;
}

/**
 * WeatherAlertCard
 * 
 * Dedicated dashboard weather alert/status card.
 * Dynamically updates when selected location or live weather changes.
 * 
 * States:
 * - Unavailable: WEATHER DATA UNAVAILABLE (neutral state when live data cannot be retrieved)
 * - Green: WEATHER STATUS (Normal: "No significant weather alerts")
 * - Orange: WEATHER ADVISORY (Advisory: e.g. Rain expected soon, High temperature, Strong wind)
 * - Red: SEVERE WEATHER (Severe: e.g. Heavy rain possible, Extreme temperature, Severe weather condition)
 */
export default function WeatherAlertCard({ alertResult, className = '' }: WeatherAlertCardProps) {
  const { alerts, overallSeverity, location, dataAvailable } = alertResult;

  // 1. Data Unavailable State: WEATHER DATA UNAVAILABLE
  if (!dataAvailable) {
    return (
      <div
        className={`rounded-[28px] p-5 sm:p-6 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between select-none ${className}`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                WEATHER DATA UNAVAILABLE
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-white/[0.04] text-slate-400 border-white/[0.08] flex items-center gap-1">
              <Info size={11} />
              Offline
            </span>
          </div>

          <div className="py-1">
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Weather alerts unavailable
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Live weather data could not be retrieved.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 mt-3">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" />
            <span className="font-medium text-slate-300">{location}</span>
          </div>
          <span className="text-[10px] text-slate-500">Live Weather Data Offline</span>
        </div>
      </div>
    );
  }

  // 2. GREEN: WEATHER STATUS (Normal: "No significant weather alerts")
  if (overallSeverity === 'green' || alerts.length === 0) {
    return (
      <div
        className={`rounded-[28px] p-5 sm:p-6 bg-[#232428]/85 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between select-none ${className}`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
                WEATHER STATUS
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-emerald-500/10 text-emerald-300 border-emerald-500/20 flex items-center gap-1">
              <CheckCircle size={11} />
              Normal
            </span>
          </div>

          {/* Body */}
          <div className="py-1">
            <h3 className="text-sm sm:text-base font-semibold text-white">
              No significant weather alerts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Meteorological conditions are currently stable.
            </p>
          </div>
        </div>

        {/* Footer with Location */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 mt-3">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" />
            <span className="font-medium text-slate-300">{location}</span>
          </div>
          <span className="text-[10px] text-slate-500">Live Weather Data</span>
        </div>
      </div>
    );
  }

  // 3. ORANGE: WEATHER ADVISORY or RED: SEVERE WEATHER
  const isRed = overallSeverity === 'red';
  const badgeTitle = isRed ? 'SEVERE WEATHER' : 'WEATHER ADVISORY';
  const dotColor = isRed
    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]';
  const borderColor = isRed ? 'border-red-500/30' : 'border-amber-500/30';
  const badgeColor = isRed
    ? 'bg-red-500/10 text-red-300 border-red-500/20'
    : 'bg-amber-500/10 text-amber-300 border-amber-500/20';

  return (
    <div
      className={`rounded-[28px] p-5 sm:p-6 bg-[#232428]/85 backdrop-blur-xl border ${borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between select-none ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${dotColor}`} />
            <span className={`text-[11px] font-bold tracking-wider uppercase ${isRed ? 'text-red-400' : 'text-amber-400'}`}>
              {badgeTitle}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${badgeColor}`}>
            {isRed ? <AlertTriangle size={11} /> : <AlertCircle size={11} />}
            {isRed ? 'Critical' : 'Advisory'}
          </span>
        </div>

        {/* Alerts List (Max 2) */}
        <div className="space-y-3 py-1">
          {alerts.map((alert: WeatherAlert) => (
            <div key={alert.id} className="group">
              <h4 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                {alert.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {alert.message}
              </p>
              {alert.timePeriod && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                  <Clock size={11} />
                  <span>{alert.timePeriod}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Location */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 mt-4">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-slate-400" />
          <span className="font-medium text-slate-300">{location}</span>
        </div>
        <span className="text-[10px] text-slate-500">WeatherGPT Advisory � Live Weather Data</span>
      </div>
    </div>
  );
}
