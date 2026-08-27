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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <SettingsIcon size={18} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Preferences & System Settings</h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure telemetry units, alert sensitivities, and offline caching modes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          {saved ? <Check size={14} /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Measurement Units */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Measurement Units</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempUnit('celsius')}
                  className={`p-2.5 rounded-xl border font-medium transition-all ${
                    tempUnit === 'celsius'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('fahrenheit')}
                  className={`p-2.5 rounded-xl border font-medium transition-all ${
                    tempUnit === 'fahrenheit'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Wind Speed Unit
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWindUnit('kmh')}
                  className={`p-2.5 rounded-xl border font-medium transition-all ${
                    windUnit === 'kmh'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  km/h
                </button>
                <button
                  type="button"
                  onClick={() => setWindUnit('mph')}
                  className={`p-2.5 rounded-xl border font-medium transition-all ${
                    windUnit === 'mph'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  mph
                </button>
                <button
                  type="button"
                  onClick={() => setWindUnit('ms')}
                  className={`p-2.5 rounded-xl border font-medium transition-all ${
                    windUnit === 'ms'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  m/s
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell size={16} className="text-blue-600" />
            <span>Hazard Alert Notifications</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Severe Meteorological Advisories
                </span>
                <span className="text-slate-500 text-[11px]">
                  High priority audio & banner warnings for thunderstorms, flash floods, or extreme heat.
                </span>
              </div>
              <input
                type="checkbox"
                checked={highRiskAlerts}
                onChange={(e) => setHighRiskAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Offline & Cache Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database size={16} className="text-blue-600" />
            <span>Low-Connectivity & Local Cache</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Store Local Forecast Telemetry
                </span>
                <span className="text-slate-500 text-[11px]">
                  Cache last synchronized weather data for offline access and intermittent network zones.
                </span>
              </div>
              <input
                type="checkbox"
                checked={offlineCache}
                onChange={(e) => setOfflineCache(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Prototype Specification Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Info size={16} className="text-blue-600" />
            <span>SIH 2026 WeatherGPT Architecture</span>
          </div>
          <p className="leading-relaxed">
            WeatherGPT is designed as an AI-powered conversational weather intelligence system. In this frontend phase, all telemetry is decoupled via clean service interfaces (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">weatherService.ts</code> & <code className="bg-white px-1 py-0.5 rounded border border-slate-200">chatService.ts</code>) ready for REST/WebSocket backends.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-600" /> SIH 2026 Candidate</span>
            <span className="flex items-center gap-1"><Smartphone size={13} /> Mobile & Desktop Optimized</span>
            <span className="flex items-center gap-1"><Moon size={13} /> Modern SaaS Design</span>
          </div>
        </div>
      </div>
    </div>
  );
}
