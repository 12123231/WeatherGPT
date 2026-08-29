import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Database, Info, Moon, Smartphone, ShieldCheck, Check } from 'lucide-react';

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
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shadow-inner">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Preferences & System Settings</h2>
            <p className="text-xs text-slate-400 font-medium">
              Configure telemetry units, alert sensitivities, and offline caching modes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95 relative z-10"
        >
          {saved ? <Check size={14} /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-5">
        {/* Measurement Units */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>Measurement Units</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-2">
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempUnit('celsius')}
                  className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${
                    tempUnit === 'celsius'
                      ? 'bg-blue-500/25 border-blue-400/50 text-white shadow-md'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('fahrenheit')}
                  className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${
                    tempUnit === 'fahrenheit'
                      ? 'bg-blue-500/25 border-blue-400/50 text-white shadow-md'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-2">
                Wind Speed Unit
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWindUnit('kmh')}
                  className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${
                    windUnit === 'kmh'
                      ? 'bg-blue-500/25 border-blue-400/50 text-white shadow-md'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  km/h
                </button>
                <button
                  type="button"
                  onClick={() => setWindUnit('mph')}
                  className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${
                    windUnit === 'mph'
                      ? 'bg-blue-500/25 border-blue-400/50 text-white shadow-md'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  mph
                </button>
                <button
                  type="button"
                  onClick={() => setWindUnit('ms')}
                  className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${
                    windUnit === 'ms'
                      ? 'bg-blue-500/25 border-blue-400/50 text-white shadow-md'
                      : 'glass-pill text-slate-400 hover:text-white'
                  }`}
                >
                  m/s
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory Notifications */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Bell size={16} className="text-blue-400" />
            <span>Hazard Alert Notifications</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-4 rounded-2xl glass-pill cursor-pointer hover:bg-white/[0.08] transition-colors">
              <div>
                <span className="font-bold text-white block">
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
                className="w-4 h-4 text-blue-500 rounded border-white/20 bg-white/10 focus:ring-blue-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Offline & Cache Management */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Database size={16} className="text-blue-400" />
            <span>Low-Connectivity & Local Cache</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-4 rounded-2xl glass-pill cursor-pointer hover:bg-white/[0.08] transition-colors">
              <div>
                <span className="font-bold text-white block">
                  Store Local Forecast Telemetry
                </span>
                <span className="text-slate-400 text-[11px]">
                  Cache last synchronized weather data for offline access and intermittent network zones.
                </span>
              </div>
              <input
                type="checkbox"
                checked={offlineCache}
                onChange={(e) => setOfflineCache(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded border-white/20 bg-white/10 focus:ring-blue-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Prototype Specification Box */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center gap-2 font-extrabold text-white text-sm">
            <Info size={16} className="text-blue-400" />
            <span>SIH 2026 WeatherGPT Architecture</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            WeatherGPT is designed as an AI-powered conversational weather intelligence system. In this frontend phase, all telemetry is decoupled via clean service interfaces (<code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 border border-white/10">weatherService.ts</code> & <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 border border-white/10">chatService.ts</code>) ready for REST/WebSocket backends.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> SIH 2026 Candidate</span>
            <span className="flex items-center gap-1.5"><Smartphone size={14} className="text-blue-400" /> Mobile & Desktop Spatial UI</span>
            <span className="flex items-center gap-1.5"><Moon size={14} className="text-indigo-400" /> Dark Glass Aesthetics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
