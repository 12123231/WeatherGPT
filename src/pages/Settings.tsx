import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Database, Info, ShieldCheck, Check } from 'lucide-react';

export default function SettingsPage() {
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph' | 'ms'>('kmh');
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [offlineCache, setOfflineCache] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto relative z-10">
      {/* Header Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/[0.07] flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] text-sky-400 border border-white/[0.08] flex items-center justify-center">
            <SettingsIcon size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">System Preferences</h2>
            <p className="text-xs text-slate-400">
              Configure telemetry units, alert sensitivities, and local caching modes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer relative z-10"
        >
          {saved ? <Check size={14} /> : null}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Measurement Units */}
        <div className="glass-panel rounded-2xl border border-white/[0.07] p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">
            Measurement Units
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-slate-300 block mb-2">
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempUnit('celsius')}
                  className={`p-2.5 rounded-xl border font-medium transition-colors cursor-pointer text-xs ${
                    tempUnit === 'celsius'
                      ? 'bg-white/[0.1] border-white/[0.16] text-white shadow-xs'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('fahrenheit')}
                  className={`p-2.5 rounded-xl border font-medium transition-colors cursor-pointer text-xs ${
                    tempUnit === 'fahrenheit'
                      ? 'bg-white/[0.1] border-white/[0.16] text-white shadow-xs'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-300 block mb-2">
                Wind Velocity Unit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['kmh', 'mph', 'ms'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setWindUnit(unit)}
                    className={`p-2.5 rounded-xl border font-medium transition-colors cursor-pointer text-xs ${
                      windUnit === unit
                        ? 'bg-white/[0.1] border-white/[0.16] text-white shadow-xs'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white'
                    }`}
                  >
                    {unit === 'ms' ? 'm/s' : unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advisory Notifications */}
        <div className="glass-panel rounded-2xl border border-white/[0.07] p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell size={15} className="text-sky-400" />
            <span>Hazard Alert Notifications</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div>
                <span className="font-medium text-white block">
                  Severe Meteorological Advisories
                </span>
                <span className="text-slate-400 text-[11px]">
                  High priority audio & banner warnings for thunderstorms, flash floods, or extreme heat.
                </span>
              </div>
              <input
                type="checkbox"
                checked={highRiskAlerts}
                onChange={(e) => setHighRiskAlerts(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-white/20 bg-white/10 focus:ring-sky-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Offline & Cache Management */}
        <div className="glass-panel rounded-2xl border border-white/[0.07] p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database size={15} className="text-sky-400" />
            <span>Telemetry Cache & Resilience</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div>
                <span className="font-medium text-white block">
                  Store Local Forecast Telemetry
                </span>
                <span className="text-slate-400 text-[11px]">
                  Cache last synchronized meteorological data for offline resilience and intermittent network zones.
                </span>
              </div>
              <input
                type="checkbox"
                checked={offlineCache}
                onChange={(e) => setOfflineCache(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-white/20 bg-white/10 focus:ring-sky-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Architecture Spec Info */}
        <div className="glass-panel rounded-2xl border border-white/[0.07] p-5 sm:p-6 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <Info size={15} className="text-sky-400" />
            <span>WeatherGPT System Architecture</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            WeatherGPT delivers conversational weather intelligence and multi-sensor Doppler telemetry. In this frontend interface, data access is orchestrated via modular service contracts for seamless integration with real-time meteorological pipelines.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Telemetry Integrity Active</span>
            <span>•</span>
            <span>Doppler Grid Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
