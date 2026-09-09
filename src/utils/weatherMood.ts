import type { CurrentWeather } from '../types/weather';
import { resolveLocationTimezone, getLocalTimeInfo } from './timezone';

export type WeatherMoodId =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'fog'
  | 'snow'
  | 'dust'
  | 'night';

export interface WeatherAtmosphereConfig {
  id: WeatherMoodId;
  isNight: boolean;
  name: string;
  themeColor: string;
  gradient: string;
  accentOverlay: string;
}

/**
 * Evaluates the current weather conditions and returns an atmospheric mood.
 * Prioritizes severe/distinct conditions, naturally integrates night mode,
 * and maintains contrast and readability for all dashboard cards.
 */
export function getWeatherMood(weather: CurrentWeather | null): WeatherAtmosphereConfig {
  if (!weather) {
    return {
      id: 'cloudy',
      isNight: false,
      name: 'Muted Calm',
      themeColor: '#64748b',
      gradient:
        'radial-gradient(circle at 50% -5%, rgba(51, 65, 85, 0.22) 0%, rgba(30, 31, 36, 0.85) 50%, #121315 100%)',
      accentOverlay: 'rgba(100, 116, 139, 0.04)',
    };
  }

  // Determine local daytime vs nighttime
  let isNight = false;
  if (weather.condition?.icon?.includes('moon')) {
    isNight = true;
  } else if (weather.localtime) {
    const parts = weather.localtime.split(' ');
    if (parts[1]) {
      const h = parseInt(parts[1].split(':')[0], 10);
      if (!isNaN(h)) isNight = h < 6 || h >= 19;
    }
  } else {
    const tz = resolveLocationTimezone(weather.location, weather.timezone);
    const { isDaytime } = getLocalTimeInfo(tz);
    isNight = !isDaytime;
  }

  const cond = (
    (weather.condition?.main || '') +
    ' ' +
    (weather.condition?.description || '')
  ).toLowerCase();

  // 1. Thunderstorm: darker, dramatic atmosphere
  if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
    return {
      id: 'thunderstorm',
      isNight,
      name: 'Thunderstorm Dramatic',
      themeColor: '#a855f7',
      gradient: isNight
        ? 'radial-gradient(circle at 50% -10%, rgba(88, 28, 135, 0.35) 0%, rgba(30, 27, 75, 0.25) 45%, rgba(18, 19, 21, 0.98) 85%)'
        : 'radial-gradient(circle at 50% -10%, rgba(107, 33, 168, 0.28) 0%, rgba(46, 16, 101, 0.2) 45%, rgba(24, 25, 28, 0.95) 85%)',
      accentOverlay: 'rgba(168, 85, 247, 0.06)',
    };
  }

  // 2. Snow: cool, crisp atmosphere
  if (
    cond.includes('snow') ||
    cond.includes('blizzard') ||
    cond.includes('sleet') ||
    cond.includes('ice') ||
    cond.includes('flurr')
  ) {
    return {
      id: 'snow',
      isNight,
      name: 'Cool Crisp Snow',
      themeColor: '#38bdf8',
      gradient: isNight
        ? 'radial-gradient(circle at 50% -10%, rgba(14, 116, 144, 0.26) 0%, rgba(12, 74, 110, 0.18) 45%, rgba(18, 19, 21, 0.98) 85%)'
        : 'radial-gradient(circle at 50% -10%, rgba(56, 189, 248, 0.22) 0%, rgba(14, 116, 144, 0.14) 45%, rgba(24, 25, 28, 0.95) 85%)',
      accentOverlay: 'rgba(56, 189, 248, 0.05)',
    };
  }

  // 3. Rain / Drizzle: cool, rainy, cozy atmosphere
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return {
      id: 'rain',
      isNight,
      name: 'Cool Rainy Cozy',
      themeColor: '#0ea5e9',
      gradient: isNight
        ? 'radial-gradient(circle at 50% -10%, rgba(3, 105, 161, 0.3) 0%, rgba(12, 74, 110, 0.2) 45%, rgba(18, 19, 21, 0.98) 85%)'
        : 'radial-gradient(circle at 50% -10%, rgba(14, 165, 233, 0.22) 0%, rgba(3, 105, 161, 0.15) 45%, rgba(24, 25, 28, 0.95) 85%)',
      accentOverlay: 'rgba(14, 165, 233, 0.05)',
    };
  }

  // 4. Fog / Mist: soft, hazy atmosphere
  if (cond.includes('fog') || cond.includes('mist')) {
    return {
      id: 'fog',
      isNight,
      name: 'Soft Hazy Mist',
      themeColor: '#94a3b8',
      gradient: isNight
        ? 'radial-gradient(circle at 50% -10%, rgba(71, 85, 105, 0.25) 0%, rgba(30, 41, 59, 0.2) 45%, rgba(18, 19, 21, 0.98) 85%)'
        : 'radial-gradient(circle at 50% -10%, rgba(148, 163, 184, 0.2) 0%, rgba(71, 85, 105, 0.15) 45%, rgba(24, 25, 28, 0.95) 85%)',
      accentOverlay: 'rgba(148, 163, 184, 0.05)',
    };
  }

  // 5. Dust / Sand / Smoke / Haze: warm, muted, slightly dusty atmosphere
  if (
    cond.includes('dust') ||
    cond.includes('sand') ||
    cond.includes('smoke') ||
    cond.includes('haze') ||
    cond.includes('ash')
  ) {
    return {
      id: 'dust',
      isNight,
      name: 'Warm Muted Dusty',
      themeColor: '#d97706',
      gradient: isNight
        ? 'radial-gradient(circle at 50% -10%, rgba(180, 83, 9, 0.25) 0%, rgba(120, 53, 15, 0.18) 45%, rgba(18, 19, 21, 0.98) 85%)'
        : 'radial-gradient(circle at 50% -10%, rgba(217, 119, 6, 0.22) 0%, rgba(180, 83, 9, 0.14) 45%, rgba(24, 25, 28, 0.95) 85%)',
      accentOverlay: 'rgba(217, 119, 6, 0.05)',
    };
  }

  // 6. Cloudy / Overcast: soft, calm, muted atmosphere
  if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('gloomy')) {
    return {
      id: isNight ? 'night' : 'cloudy',
      isNight,
      name: isNight ? 'Calm Night Clouds' : 'Soft Calm Overcast',
      themeColor: isNight ? '#6366f1' : '#64748b',
      gradient: isNight
        ? 'radial-gradient(circle at 50% -10%, rgba(67, 56, 202, 0.25) 0%, rgba(30, 27, 75, 0.2) 45%, rgba(18, 19, 21, 0.98) 85%)'
        : 'radial-gradient(circle at 50% -10%, rgba(100, 116, 139, 0.2) 0%, rgba(51, 65, 85, 0.15) 45%, rgba(24, 25, 28, 0.95) 85%)',
      accentOverlay: isNight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(100, 116, 139, 0.05)',
    };
  }

  // 7. Night: darker night atmosphere when selected location is currently nighttime
  if (isNight) {
    return {
      id: 'night',
      isNight: true,
      name: 'Starry Night Sky',
      themeColor: '#3b82f6',
      gradient:
        'radial-gradient(circle at 50% -10%, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.3) 45%, rgba(18, 19, 21, 0.98) 85%)',
      accentOverlay: 'rgba(59, 130, 246, 0.05)',
    };
  }

  // 8. Clear / Sunny: bright, warm, energetic atmosphere
  return {
    id: 'clear',
    isNight: false,
    name: 'Bright Warm Sunny',
    themeColor: '#f59e0b',
    gradient:
      'radial-gradient(circle at 50% -10%, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.12) 40%, rgba(24, 25, 28, 0.95) 80%)',
    accentOverlay: 'rgba(245, 158, 11, 0.05)',
  };
}
