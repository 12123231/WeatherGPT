import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationData, CurrentWeather } from '../../types/weather';
import { formatTemp, formatWind } from '../../utils/formatters';

// ─── Fix Leaflet default marker icons broken by Vite's asset pipeline ────────
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error — _getIconUrl is a private Leaflet method we intentionally delete
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
// ─────────────────────────────────────────────────────────────────────────────

interface MapViewProps {
  location: LocationData;
  weather?: CurrentWeather | null;
  className?: string;
}

/** Flies the map camera to the selected location whenever it changes. */
function FlyToLocation({ location }: { location: LocationData }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (prevId.current === location.id) return;
    prevId.current = location.id;
    map.flyTo([location.lat, location.lon], map.getZoom(), { duration: 1.2 });
  }, [location, map]);

  return null;
}

export default function MapView({
  location,
  weather,
  className = '',
}: MapViewProps) {
  // Guard: if coordinates are missing/invalid, show a safe fallback
  const hasCoords =
    typeof location.lat === 'number' &&
    typeof location.lon === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lon);

  if (!hasCoords) {
    return (
      <div
        className={`glass-panel rounded-2xl overflow-hidden border border-white/[0.07] flex items-center justify-center ${className}`}
      >
        <p className="text-slate-400 text-sm">
          Location coordinates unavailable for {location.name}.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden border border-white/[0.07] flex flex-col ${className}`}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.07] bg-[#0d1322]/50 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-white">Interactive Weather Map</h3>
          <p className="text-[11px] text-slate-400">
            {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            &nbsp;·&nbsp;
            <span className="text-slate-300 font-medium">{location.name}</span>
          </p>
        </div>
      </div>

      {/* ── Leaflet Map ─────────────────────────────────────────────────────── */}
      <div className="relative flex-1" style={{ minHeight: '380px' }}>
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '380px' }}
        >
          {/* OpenStreetMap base tiles — free, no API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Smooth fly-to on city change */}
          <FlyToLocation location={location} />

          {/* City marker with live weather popup */}
          <Marker position={[location.lat, location.lon]}>
            <Popup minWidth={200} maxWidth={240}>
              <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                  {location.name}{location.region ? `, ${location.region}` : ''}
                </p>
                {location.country && (
                  <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px' }}>
                    {location.country}
                  </p>
                )}
                {weather ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px', paddingBottom: '3px' }}>Condition</td>
                        <td style={{ fontWeight: 600 }}>{weather.condition.main}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px', paddingBottom: '3px' }}>Temperature</td>
                        <td style={{ fontWeight: 600 }}>{formatTemp(weather.temperature)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px', paddingBottom: '3px' }}>Feels like</td>
                        <td style={{ fontWeight: 600 }}>{formatTemp(weather.feelsLike)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px', paddingBottom: '3px' }}>Wind</td>
                        <td style={{ fontWeight: 600 }}>{formatWind(weather.windSpeed, weather.windDirection)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px' }}>Humidity</td>
                        <td style={{ fontWeight: 600 }}>{weather.humidity}%</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '12px' }}>Weather data loading…</p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-[#0d1322]/60 border-t border-white/[0.07] text-[11px] text-slate-400 shrink-0">
        Base map: OpenStreetMap contributors · Drag to pan · Scroll to zoom
      </div>
    </div>
  );
}
