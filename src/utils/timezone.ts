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
  'chandigarh': 'Asia/Kolkata',
  'patna': 'Asia/Kolkata',
  'indore': 'Asia/Kolkata',
  'bhopal': 'Asia/Kolkata',
  'lucknow': 'Asia/Kolkata',
  'shimla': 'Asia/Kolkata',
  'surat': 'Asia/Kolkata',
  'kanpur': 'Asia/Kolkata',
  'nagpur': 'Asia/Kolkata',
  'varanasi': 'Asia/Kolkata',
  'agra': 'Asia/Kolkata',
  'goa': 'Asia/Kolkata',
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

/**
 * Gets the Unix epoch (in seconds) corresponding to the start of the current local hour (:00:00)
 * in the specified timezone.
 */
export function getBaseEpochForLocalHour(timezone: string = 'Asia/Kolkata', date: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      minute: 'numeric',
      second: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
    return Math.floor(date.getTime() / 1000) - (minute * 60 + second);
  } catch {
    const epochSec = Math.floor(date.getTime() / 1000);
    return epochSec - (epochSec % 3600);
  }
}

/**
 * Derives the local display hour (e.g. "10 AM", "12 PM"), 0-23 numeric hour,
 * local date string (YYYY-MM-DD), and day/night status from a Unix timestamp (seconds)
 * using the target location's IANA timezone.
 */
export function formatEpochToLocalHour(
  timeEpoch: number,
  timezone: string = 'Asia/Kolkata'
): {
  hour: number;
  displayTime: string;
  dateStr: string;
  isDaytime: boolean;
} {
  const date = new Date(timeEpoch * 1000);
  try {
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: true,
    });
    const displayTime = hourFormatter.format(date);

    const hour24Formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    let hour = parseInt(hour24Formatter.format(date), 10);
    if (hour === 24) hour = 0;

    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const dateStr = dateFormatter.format(date);
    const isDaytime = hour >= 6 && hour < 19;

    return { hour, displayTime, dateStr, isDaytime };
  } catch {
    const h = date.getHours();
    return {
      hour: h,
      displayTime: formatHourDisplay(h),
      dateStr: date.toISOString().split('T')[0],
      isDaytime: h >= 6 && h < 19,
    };
  }
}

/**
 * Calculates the exact remaining milliseconds until the next local hour boundary
 * (:00:00.000) in the specified timezone without clock drift.
 */
export function getMsUntilNextHour(timezone: string = 'Asia/Kolkata', date: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      minute: 'numeric',
      second: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
    const ms = date.getMilliseconds();
    const remainingSeconds = (59 - minute) * 60 + (59 - second);
    return Math.max(50, remainingSeconds * 1000 + (1000 - ms));
  } catch {
    const ms = date.getMilliseconds();
    const sec = date.getSeconds();
    const min = date.getMinutes();
    const remainingSeconds = (59 - min) * 60 + (59 - sec);
    return Math.max(50, remainingSeconds * 1000 + (1000 - ms));
  }
}
