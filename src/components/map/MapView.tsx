import { useEffect, useRef, useState } from 'react';
import { mappls } from 'mappls-web-maps';
import type { MapplsMap, MapplsMarker } from 'mappls-web-maps';
import type { LocationData, CurrentWeather } from '../../types/weather';
import { formatTemp, formatWind } from '../../utils/formatters';

// ── Module-level SDK instance (created once, re-used across renders) ──────────
const mapplsClassObject = new mappls();
// ─────────────────────────────────────────────────────────────────────────────

const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_KEY as string | undefined;

interface MapViewProps {
  location: LocationData;
  weather?: CurrentWeather | null;
  className?: string;
}

/** Build the HTML string for the weather popup / info-window. */
function buildPopupHtml(location: LocationData, weather?: CurrentWeather | null): string {
  const city = location.name + (location.region ? `, ${location.region}` : '');
  const country = location.country ? `<p style="color:#6b7280;font-size:11px;margin:0 0 8px">${location.country}</p>` : '';

  const weatherRows = weather
    ? `<table style="width:100%;border-collapse:collapse;font-size:12px">
        <tbody>
          <tr>
            <td style="color:#6b7280;padding-right:8px;padding-bottom:3px">Condition</td>
            <td style="font-weight:600">${weather.condition.main}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding-right:8px;padding-bottom:3px">Temperature</td>
            <td style="font-weight:600">${formatTemp(weather.temperature)}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding-right:8px;padding-bottom:3px">Feels like</td>
            <td style="font-weight:600">${formatTemp(weather.feelsLike)}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding-right:8px;padding-bottom:3px">Wind</td>
            <td style="font-weight:600">${formatWind(weather.windSpeed, weather.windDirection)}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding-right:8px">Humidity</td>
            <td style="font-weight:600">${weather.humidity}%</td>
          </tr>
        </tbody>
      </table>`
    : '<p style="color:#9ca3af;font-size:12px">Weather data loading…</p>';

  return `<div style="font-size:13px;line-height:1.5;min-width:200px;max-width:240px;color:#111827">
    <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#111827">${city}</p>
    ${country}
    ${weatherRows}
  </div>`;
}

export default function MapView({ location, weather, className = '' }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapplsMap | null>(null);
  const markerRef = useRef<MapplsMarker | null>(null);

  // Track SDK init state: 'pending' | 'ready' | 'error'
  const [sdkState, setSdkState] = useState<'pending' | 'ready' | 'error'>('pending');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Guard: if coordinates are missing/invalid, show a safe fallback
  const hasCoords =
    typeof location.lat === 'number' &&
    typeof location.lon === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lon);

  // ── Step 1: Initialize the Mappls SDK once ───────────────────────────────
  useEffect(() => {
    if (!MAPPLS_KEY) {
      setErrorMsg('Mappls API key is missing. Add VITE_MAPPLS_KEY to your .env.local file.');
      setSdkState('error');
      return;
    }

    mapplsClassObject.initialize(
      MAPPLS_KEY,
      { map: true, layer: 'raster', version: '3.0' },
      () => {
        setSdkState('ready');
      }
    );
    // No cleanup needed — the SDK is a singleton and must not be re-initialized
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 2: Mount / re-mount the map when SDK is ready ────────────────────
  useEffect(() => {
    if (sdkState !== 'ready') return;
    if (!mapContainerRef.current) return;
    if (!hasCoords) return;

    // Destroy previous map instance if any
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch { /* ignore */ }
      mapRef.current = null;
      markerRef.current = null;
    }

    try {
      const mapInstance = mapplsClassObject.Map({
        id: mapContainerRef.current.id,
        properties: {
          center: [location.lon, location.lat],
          zoom: 10,
          zoomControl: true,
        },
      });

      mapInstance.on('load', () => {
        // Place the weather marker
        const marker = mapplsClassObject.Marker({
          map: mapInstance,
          position: { lat: location.lat, lng: location.lon },
          popupHtml: buildPopupHtml(location, weather),
          popupOptions: { openPopup: true, autoClose: false, maxWidth: 280 },
        });
        markerRef.current = marker;
      });

      mapRef.current = mapInstance;
    } catch (err) {
      console.error('[MapView] Map init error:', err);
      setErrorMsg('Map failed to initialize. Check your Mappls API key and network connection.');
      setSdkState('error');
    }

    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch { /* ignore */ }
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Deliberately only run when SDK becomes ready. Location/weather changes
    // are handled in the effect below without re-mounting the full map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkState]);

  // ── Step 3: When location changes, fly the map and update the marker ──────
  useEffect(() => {
    if (sdkState !== 'ready') return;
    if (!mapRef.current || !hasCoords) return;

    // Fly to new centre ([longitude, latitude] in MapLibre / Mappls)
    try {
      mapRef.current.flyTo({ center: [location.lon, location.lat], zoom: 10, speed: 1.5 });
    } catch {
      try { mapRef.current.setCenter({ lat: location.lat, lng: location.lon }); } catch { /* ignore */ }
    }

    // Update or recreate the marker
    if (markerRef.current) {
      try {
        markerRef.current.setPosition({ lat: location.lat, lng: location.lon });
        markerRef.current.setPopup(buildPopupHtml(location, weather));
      } catch {
        // Fallback: if marker API is unavailable, quietly ignore
      }
    } else if (mapRef.current) {
      try {
        markerRef.current = mapplsClassObject.Marker({
          map: mapRef.current,
          position: { lat: location.lat, lng: location.lon },
          popupHtml: buildPopupHtml(location, weather),
          popupOptions: { openPopup: true, autoClose: false, maxWidth: 280 },
        });
      } catch { /* ignore */ }
    }
  }, [location, weather, sdkState, hasCoords]);

  // ── Error / no-key state ──────────────────────────────────────────────────
  if (!MAPPLS_KEY || sdkState === 'error') {
    return (
      <div
        className={`glass-panel rounded-2xl overflow-hidden border border-white/[0.07] flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.07] bg-[#0d1322]/50 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Weather Map</h3>
            <p className="text-[11px] text-slate-400">
              {hasCoords
                ? `${location.lat.toFixed(4)}°N, ${location.lon.toFixed(4)}°E · `
                : ''}
              <span className="text-slate-300 font-medium">{location.name}</span>
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-[380px] px-6 text-center">
          <div>
            <p className="text-amber-400 text-sm font-medium mb-1">Map unavailable</p>
            <p className="text-slate-400 text-xs max-w-xs">
              {errorMsg || 'Set VITE_MAPPLS_KEY in .env.local to enable the Mappls map.'}
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-[#0d1322]/60 border-t border-white/[0.07] text-[11px] text-slate-400 shrink-0">
          Map provided by Mappls · © CE Info Systems Ltd.
        </div>
      </div>
    );
  }

  // ── No valid coordinates ──────────────────────────────────────────────────
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

  // ── Normal render ─────────────────────────────────────────────────────────
  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden border border-white/[0.07] flex flex-col ${className}`}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.07] bg-[#0d1322]/50 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-white">Interactive Weather Map</h3>
          <p className="text-[11px] text-slate-400">
            {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            &nbsp;·&nbsp;
            <span className="text-slate-300 font-medium">{location.name}</span>
          </p>
        </div>
        {sdkState === 'pending' && (
          <span className="text-[10px] text-sky-400 animate-pulse">Loading map…</span>
        )}
      </div>

      {/* ── Map container ───────────────────────────────────────────────── */}
      <div className="relative flex-1" style={{ minHeight: '380px' }}>
        {sdkState === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1322]/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-xs">Initialising Mappls map…</span>
            </div>
          </div>
        )}
        {/*
          The Mappls SDK targets the element by its DOM id — keep it stable.
          Using a unique per-location id would force a full re-mount on every
          location change, so we use a fixed id and fly the camera instead.
        */}
        <div
          id="mappls-weathergpt-map"
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        />
      </div>

      {/* ── Footer with Mappls attribution ──────────────────────────────── */}
      <div className="px-4 py-2 bg-[#0d1322]/60 border-t border-white/[0.07] text-[11px] text-slate-400 shrink-0">
        Map provided by{' '}
        <a
          href="https://about.mappls.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline"
        >
          Mappls
        </a>{' '}
        · © CE Info Systems Ltd. · Drag to pan · Scroll to zoom
      </div>
    </div>
  );
}
