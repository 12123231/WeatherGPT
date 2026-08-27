import type { RiskLevel } from '../types/weather';

/** Format temperature with degree symbol */
export function formatTemp(temp: number, unit: string = 'C'): string {
  return `${Math.round(temp)}°${unit}`;
}

/** Format wind speed */
export function formatWind(speed: number, direction: string): string {
  return `${speed} km/h ${direction}`;
}

/** Format humidity percentage */
export function formatHumidity(humidity: number): string {
  return `${humidity}%`;
}

/** Format visibility in km */
export function formatVisibility(km: number): string {
  return `${km} km`;
}

/** Format pressure in hPa */
export function formatPressure(hPa: number): string {
  return `${hPa} hPa`;
}

/** Format UV index with label */
export function formatUVIndex(uv: number): { value: string; label: string } {
  let label = 'Low';
  if (uv >= 11) label = 'Extreme';
  else if (uv >= 8) label = 'Very High';
  else if (uv >= 6) label = 'High';
  else if (uv >= 3) label = 'Moderate';
  return { value: String(uv), label };
}

/** Format rain probability */
export function formatRainProbability(prob: number): string {
  return `${prob}%`;
}

/** Format an ISO timestamp to a readable time string */
export function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/** Format an ISO timestamp to a readable date string */
export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return isoString;
  }
}

/** Format the current date/time for the dashboard header */
export function formatCurrentDateTime(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Get color class for a risk level */
export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'text-risk-low',
    moderate: 'text-risk-moderate',
    high: 'text-risk-high',
    severe: 'text-risk-severe',
  };
  return colors[level];
}

/** Get background color class for a risk level */
export function getRiskBgColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-green-50 border-green-200',
    moderate: 'bg-amber-50 border-amber-200',
    high: 'bg-red-50 border-red-200',
    severe: 'bg-red-100 border-red-300',
  };
  return colors[level];
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** "Last updated" relative text */
export function formatLastUpdated(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return formatDate(isoString);
  } catch {
    return 'Unknown';
  }
}
