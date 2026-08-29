import { useState } from 'react';
import type { LocationData, CurrentWeather } from '../../types/weather';
import { getWeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatWind } from '../../utils/formatters';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Wind,
  Droplets,
  Radio,
} from 'lucide-react';

interface MapViewProps {
  location: LocationData;
  weather?: CurrentWeather | null;
  className?: string;
}

type MapLayer = 'radar' | 'temperature' | 'precipitation' | 'wind';

export default function MapView({
  location,
  weather,
  className = '',
}: MapViewProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('radar');
  const [zoomLevel, setZoomLevel] = useState(8);

  const WeatherIcon = weather ? getWeatherIcon(weather.condition.icon) : null;

  return (
    <div
      className={`glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col ${className}`}
    >
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shadow-inner">
            <Radio size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Doppler Radar & Spatial Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Coordinates: {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            </p>
          </div>
        </div>

        {/* Map Layer Selector */}
        <div className="flex items-center gap-1 glass-pill p-1 rounded-2xl text-xs">
          <Layers size={13} className="text-slate-400 ml-2 mr-0.5" />
          {(['radar', 'temperature', 'precipitation', 'wind'] as MapLayer[]).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1 rounded-xl font-semibold capitalize transition-all cursor-pointer ${
                activeLayer === layer
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Map Interactive Canvas Visual Area */}
      <div className="relative flex-1 min-h-[380px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
        {/* Synthetic Map Background Grid & Radar rings */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          }}
        />

        {/* Radar Concentric Rings */}
        <div className="absolute w-[360px] h-[360px] rounded-full border border-blue-500/20 pointer-events-none animate-pulse" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-blue-500/30 pointer-events-none" />
        <div className="absolute w-[120px] h-[120px] rounded-full border border-blue-500/40 pointer-events-none" />

        {/* Radar Sweep Animation Effect */}
        <div
          className="absolute w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(59, 130, 246, 0.25) 0deg, rgba(59, 130, 246, 0) 60deg, transparent 360deg)',
            animation: 'spin 6s linear infinite',
          }}
        />

        {/* Center Location Pin with Pulsing Aura */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-blue-400 opacity-60" />
            <div className="relative w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 border border-blue-300">
              <MapPin size={18} />
            </div>
          </div>

          {/* Location Pin Badge */}
          <div className="mt-2.5 glass-panel text-white px-3.5 py-1.5 rounded-2xl border border-white/15 shadow-xl text-center backdrop-blur-xl">
            <p className="text-xs font-bold leading-tight">{location.name}</p>
            <p className="text-[10px] text-slate-300">
              {location.region}, {location.country}
            </p>
          </div>
        </div>

        {/* Top-Right Weather Telemetry Overlay */}
        {weather && (
          <div className="absolute top-4 right-4 z-20 glass-panel border border-white/15 rounded-2xl p-3.5 text-white shadow-2xl max-w-[210px] backdrop-blur-2xl">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              {WeatherIcon && <WeatherIcon size={20} className="text-blue-400 shrink-0" />}
              <div>
                <span className="text-base font-extrabold">{formatTemp(weather.temperature)}</span>
                <span className="text-[10px] text-slate-300 block">{weather.condition.main}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400">
                  <Wind size={11} /> Wind
                </span>
                <span className="font-semibold text-white">
                  {formatWind(weather.windSpeed, weather.windDirection)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400">
                  <Droplets size={11} /> Humidity
                </span>
                <span className="font-semibold text-white">{weather.humidity}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom-Left Layer Legend */}
        <div className="absolute bottom-4 left-4 z-20 glass-panel border border-white/15 rounded-xl px-3 py-1.5 text-white text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="capitalize font-bold">{activeLayer} Active</span>
            <span className="text-slate-400">| Zoom {zoomLevel}x</span>
          </div>
        </div>

        {/* Bottom-Right Zoom & Navigation Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 16))}
            aria-label="Zoom in"
            className="w-8 h-8 rounded-xl glass-pill text-white hover:bg-white/[0.15] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 2))}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-xl glass-pill text-white hover:bg-white/[0.15] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            aria-label="Toggle compass orientation"
            className="w-8 h-8 rounded-xl glass-pill text-white hover:bg-white/[0.15] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Compass size={15} />
          </button>
          <button
            type="button"
            aria-label="Toggle full map"
            className="w-8 h-8 rounded-xl glass-pill text-white hover:bg-white/[0.15] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-5 py-3 bg-slate-950/50 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span>Integrated Doppler Weather Radar Matrix</span>
        <span className="text-slate-400 font-medium">Ready for GIS / GeoJSON Layer Integration</span>
      </div>
    </div>
  );
}
