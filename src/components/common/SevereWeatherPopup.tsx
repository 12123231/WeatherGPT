import { AlertTriangle, X, ShieldAlert, Clock, MapPin } from 'lucide-react';
import type { WeatherAlert } from '../../services/alertService';

interface SevereWeatherPopupProps {
  alert: WeatherAlert | null;
  onDismiss: () => void;
}

/**
 * SevereWeatherPopup
 * 
 * Lightweight serious-weather alert modal.
 * Triggers ONLY on RED (severe) weather alerts.
 * Never triggers on GREEN or ORANGE.
 * Does not pull in external heavy notification libraries.
 */
export default function SevereWeatherPopup({ alert, onDismiss }: SevereWeatherPopupProps) {
  if (!alert || alert.severity !== 'red') {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="severe-weather-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#1c1417]/95 border border-red-500/30 shadow-[0_20px_50px_rgba(239,68,68,0.2)] text-white select-none">
        {/* Dismiss 'X' Button in Top-Right Corner */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss severe weather popup"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 tracking-wider uppercase">
              <ShieldAlert size={14} />
              <span>Severe Weather Advisory</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-300 font-medium mt-0.5">
              <MapPin size={12} className="text-slate-400" />
              <span>{alert.location}</span>
            </div>
          </div>
        </div>

        {/* Advisory Content Body */}
        <div className="space-y-2 mb-5">
          <h2 id="severe-weather-title" className="text-lg font-bold text-white tracking-tight">
            {alert.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {alert.message}
          </p>

          {alert.timePeriod && (
            <div className="flex items-center gap-1.5 pt-2 text-xs text-red-300/90 font-medium">
              <Clock size={13} />
              <span>Expected: {alert.timePeriod}</span>
            </div>
          )}
        </div>

        {/* Bottom Disclaimer & Dismiss Button */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            WeatherGPT Advisory · Live Weather Data
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
