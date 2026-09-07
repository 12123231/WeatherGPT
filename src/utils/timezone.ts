/**
 * Timezone and local time utilities for WeatherGPT.
 * Handles location-specific timezone resolution and formatting.
 */

// Known timezone mappings for cities and regions
const LOCATION_TIMEZONE_MAP: Record<string, string> = {
  'new-delhi': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'mumbai': 'Asia/Kolkata',
  'bengaluru': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'chennai': 'Asia/Kolkata',
  'madras': 'Asia/Kolkata',
  'kolkata': 'Asia/Kolkata',
  'calcutta': 'Asia/Kolkata',
  'jaipur': 'Asia/Kolkata',
  'pune': 'Asia/Kolkata',
  'hyderabad': 'Asia/Kolkata',
  'ahmedabad': 'Asia/Kolkata',
  'london': 'Europe/London',
  'new-york': 'America/New_York',
  'new york': 'America/New_York',
  'tokyo': 'Asia/Tokyo',
  'paris': 'Europe/Paris',
  'dubai': 'Asia/Dubai',
  'singapore': 'Asia/Singapore',
  'sydney': 'Australia/Sydney',
};

/**
 * Resolves the IANA timezone string for a location id or country/name.
 * Defaults to 'Asia/Kolkata'.
 */
export function resolveLocationTimezone(locationIdOrName?: string, explicitTimezone?: string): string {
  if (explicitTimezone && isValidTimezone(explicitTimezone)) {
    return explicitTimezone;
  }
  if (!locationIdOrName) return 'Asia/Kolkata';

  const normalized = locationIdOrName.toLowerCase().trim().replace(/\s+/g, '-');
  if (LOCATION_TIMEZONE_MAP[normalized]) {
    return LOCATION_TIMEZONE_MAP[normalized];
  }

  const rawNormalized = locationIdOrName.toLowerCase().trim();
  if (LOCATION_TIMEZONE_MAP[rawNormalized]) {
    return LOCATION_TIMEZONE_MAP[rawNormalized];
  }

  return 'Asia/Kolkata';
}

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the current local hour (0-23), minute (0-59), and date (YYYY-MM-DD)
 * for a target location's timezone.
 */
export function getLocalTimeInfo(timezone: string = 'Asia/Kolkata'): {
  hour: number;
  minute: number;
  dateStr: string;
  isDaytime: boolean;
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';
    const minStr = parts.find((p) => p.type === 'minute')?.value || '0';

    let hour = parseInt(hourStr, 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(minStr, 10);
    const dateStr = `${year}-${month}-${day}`;
    const isDaytime = hour >= 6 && hour < 19;

    return { hour, minute, dateStr, isDaytime };
  } catch {
    const now = new Date();
    const hour = now.getHours();
    return {
      hour,
      minute: now.getMinutes(),
      dateStr: now.toISOString().split('T')[0],
      isDaytime: hour >= 6 && hour < 19,
    };
  }
}

/**
 * Formats an hour number (0-23) into standard 12-hour display ('12 AM', '1 PM', etc.)
 * or 'Now' if isCurrentHour is true.
 */
export function formatHourDisplay(hour: number, isCurrentHour: boolean = false): string {
  if (isCurrentHour) return 'Now';
  const normalizedHour = ((hour % 24) + 24) % 24;
  if (normalizedHour === 0) return '12 AM';
  if (normalizedHour === 12) return '12 PM';
  if (normalizedHour > 12) return `${normalizedHour - 12} PM`;
  return `${normalizedHour} AM`;
}
