import { useState } from 'react';
import type { LocationData, CurrentWeather } from '../../types/weather';
import { WeatherIcon } from '../../utils/weatherIcons';
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

  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden border border-white/[0.07] flex flex-col ${className}`}
    >
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.07] bg-[#0d1322]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] text-sky-400 border border-white/[0.08] flex items-center justify-center">
            <Radio size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Doppler Radar & Spatial Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Station Coordinates: {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            </p>
          </div>
        </div>

        {/* Map Layer Selector */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl text-xs">
          <Layers size={13} className="text-slate-400 ml-2 mr-1" />
          {(['radar', 'temperature', 'precipitation', 'wind'] as MapLayer[]).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setActiveLayer(layer)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-colors cursor-pointer text-xs ${
                activeLayer === layer
                  ? 'bg-white/[0.1] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Map Interactive Canvas Visual Area */}
      <div className="relative flex-1 min-h-[380px] bg-[#080d1a] overflow-hidden flex items-center justify-center select-none">
        {/* Synthetic Map Background Grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          }}
        />

        {/* Radar Concentric Rings */}
        <div className="absolute w-[360px] h-[360px] rounded-full border border-sky-500/10 pointer-events-none" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-sky-500/15 pointer-events-none" />
        <div className="absolute w-[120px] h-[120px] rounded-full border border-sky-500/20 pointer-events-none" />

        {/* Radar Sweep Effect */}
        <div
          className="absolute w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(56, 189, 248, 0.12) 0deg, rgba(56, 189, 248, 0) 50deg, transparent 360deg)',
            animation: 'spin 8s linear infinite',
          }}
        />

        {/* Center Location Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
              <MapPin size={16} />
            </div>
          </div>

          {/* Location Pin Badge */}
          <div className="mt-2 bg-[#0d1322]/90 text-white px-3 py-1 rounded-xl border border-white/[0.1] text-center backdrop-blur-md">
            <p className="text-xs font-semibold leading-tight">{location.name}</p>
            <p className="text-[10px] text-slate-400">
              {location.region}, {location.country}
            </p>
          </div>
        </div>

        {/* Top-Right Weather Telemetry Overlay */}
        {weather && (
          <div className="absolute top-4 right-4 z-20 glass-panel border border-white/[0.08] rounded-xl p-3 text-white max-w-[200px]">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
              <WeatherIcon icon={weather.condition.icon} size={18} className="text-sky-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold">{formatTemp(weather.temperature)}</span>
                <span className="text-[10px] text-slate-400 block">{weather.condition.main}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Wind size={11} /> Wind
                </span>
                <span className="font-medium text-white">
                  {formatWind(weather.windSpeed, weather.windDirection)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Droplets size={11} /> Humidity
                </span>
                <span className="font-medium text-white">{weather.humidity}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom-Left Layer Legend */}
        <div className="absolute bottom-4 left-4 z-20 glass-panel border border-white/[0.08] rounded-lg px-2.5 py-1 text-white text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="capitalize font-medium">{activeLayer} Active</span>
            <span className="text-slate-400">| {zoomLevel}x</span>
          </div>
        </div>

        {/* Bottom-Right Zoom & Navigation Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 16))}
            aria-label="Zoom in"
            className="w-7 h-7 rounded-lg bg-[#0d1322]/80 border border-white/[0.08] text-white hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 2))}
            aria-label="Zoom out"
            className="w-7 h-7 rounded-lg bg-[#0d1322]/80 border border-white/[0.08] text-white hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            aria-label="Toggle compass orientation"
            className="w-7 h-7 rounded-lg bg-[#0d1322]/80 border border-white/[0.08] text-white hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Compass size={14} />
          </button>
          <button
            type="button"
            aria-label="Toggle full map"
            className="w-7 h-7 rounded-lg bg-[#0d1322]/80 border border-white/[0.08] text-white hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-4 py-2.5 bg-[#0d1322]/60 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span>Integrated Doppler Weather Radar Matrix</span>
        <span className="text-slate-400">GIS Telemetry Stream</span>
      </div>
    </div>
  );
}
