import type { CurrentWeather, ForecastDay, HourlyForecast, WeatherRisk, LocationData, RiskLevel } from '../types/index.js';
import { mockWeatherData, mockForecastData, mockRisksData, mockLocations, generateMockHourlyForecast } from './mockData.js';

/**
 * Maps WeatherAPI condition text to Lucide icon identifiers used in the frontend.
 */
function mapWeatherApiConditionToIcon(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('lightning')) return 'cloud-lightning';
  if (t.includes('heavy rain') || t.includes('torrential')) return 'cloud-rain';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'cloud-rain';
  if (t.includes('snow') || t.includes('blizzard') || t.includes('sleet') || t.includes('ice')) return 'cloud-snow';
  if (t.includes('partly') || t.includes('scattered')) return 'cloud-sun';
  if (t.includes('cloud') || t.includes('overcast') || t.includes('fog') || t.includes('mist') || t.includes('haze')) return 'cloud';
  if (t.includes('sunny') || t.includes('clear')) return 'sun';
  if (t.includes('wind') || t.includes('gale')) return 'wind';
  return 'cloud-sun';
}

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bengalooru: 'bengaluru',
  delhi: 'delhi',
  dilli: 'delhi',
  'new delhi': 'new-delhi',
  'new-delhi': 'new-delhi',
  bombay: 'mumbai',
  bambai: 'mumbai',
  mumbai: 'mumbai',
  calcutta: 'kolkata',
  kolkata: 'kolkata',
  madras: 'chennai',
  chennai: 'chennai',
  jaipur: 'jaipur',
  patna: 'patna',
  chandigarh: 'chandigarh',
  indore: 'indore',
  hyderabad: 'hyderabad',
  pune: 'pune',
  poona: 'pune',
  lucknow: 'lucknow',
  ahmedabad: 'ahmedabad',
  shimla: 'shimla',
  goa: 'goa',
  surat: 'surat',
  kanpur: 'kanpur',
  nagpur: 'nagpur',
  varanasi: 'varanasi',
  kashi: 'varanasi',
  banaras: 'varanasi',
  agra: 'agra',
  bhopal: 'bhopal',
};

const CITY_QUERY_DISAMBIGUATION: Record<string, string> = {
  delhi: 'New Delhi',
  dilli: 'New Delhi',
  'new-delhi': 'New Delhi',
  'new delhi': 'New Delhi',
  bangalore: 'Bengaluru',
  bengalooru: 'Bengaluru',
  bombay: 'Mumbai',
  bambai: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  poona: 'Pune',
};

/**
 * Searches for a matching mock location by name, id, or region (case-insensitive).
 */
function findMockLocation(locationQuery: string): LocationData | null {
  if (!locationQuery || !locationQuery.trim()) return null;
  const q = locationQuery.toLowerCase().trim();
  const clean = q.replace(/\s+/g, '-');
  const aliasTarget = CITY_ALIASES[q] || CITY_ALIASES[clean];

  return (
    mockLocations.find(
      (l) =>
        l.name.toLowerCase() === q ||
        l.id.toLowerCase() === clean ||
        l.region.toLowerCase() === q ||
        (aliasTarget && (l.id.toLowerCase() === aliasTarget || l.name.toLowerCase() === aliasTarget)) ||
        l.name.toLowerCase().includes(q) ||
        q.includes(l.name.toLowerCase())
    ) || null
  );
}

interface CacheEntry {
  data: any;
  timestamp: number;
}
const weatherCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Fetches live weather telemetry from WeatherAPI.com with request deduplication
 * and short-lived in-memory caching (30s) to avoid unnecessary live API calls.
 */
async function fetchWeatherApiData(query: string, apiKey: string): Promise<any> {
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    throw new Error('Location query is required');
  }

  const lower = trimmed.toLowerCase();
  const cleanLower = lower.replace(/\s+/g, '-');
  const disambiguated = CITY_QUERY_DISAMBIGUATION[lower] || CITY_QUERY_DISAMBIGUATION[cleanLower] || trimmed;
  const cacheKey = disambiguated.toLowerCase();

  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30_000) {
    return cached.data;
  }

  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const fetchPromise = (async () => {
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(disambiguated)}&days=3&aqi=yes&alerts=yes`;
      const res = await fetch(url);

      if (!res.ok) {
        let errorDetail = `WeatherAPI returned HTTP ${res.status}`;
        try {
          const errJson = (await res.json()) as { error?: { code?: number; message?: string } };
          if (errJson?.error?.message) {
            errorDetail = errJson.error.message;
          }
        } catch {
          // ignore json parse error
        }

        if (res.status === 400) {
          throw new Error(`Location '${disambiguated}' not found: ${errorDetail}`);
        }
        throw new Error(`WeatherAPI request failed: ${errorDetail}`);
      }

      const json = await res.json();
      weatherCache.set(cacheKey, { data: json, timestamp: Date.now() });
      return json;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Retrieves current live weather for the specified location.
 */
export async function getCurrentWeather(locationQuery: string): Promise<{ data: CurrentWeather; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  // 1. Live WeatherAPI integration
  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(query, apiKey);
      if (json && json.current && json.location) {
        const liveData: CurrentWeather = {
          location: json.location.name,
          region: json.location.region || '',
          country: json.location.country || '',
          temperature: Math.round(json.current.temp_c),
          feelsLike: Math.round(json.current.feelslike_c),
          condition: {
            main: json.current.condition?.text || 'Clear',
            description: json.current.condition?.text || '',
            icon: mapWeatherApiConditionToIcon(json.current.condition?.text || ''),
          },
          humidity: json.current.humidity,
          windSpeed: Math.round(json.current.wind_kph),
          windDirection: json.current.wind_dir || 'N',
          visibility: Math.round(json.current.vis_km),
          pressure: Math.round(json.current.pressure_mb),
          uvIndex: Math.round(json.current.uv ?? 0),
          lastUpdated: json.current.last_updated ? new Date(json.current.last_updated).toISOString() : new Date().toISOString(),
          timezone: json.location.tz_id || 'Asia/Kolkata',
        };
        return { data: liveData, isFallback: false };
      }
    } catch (error) {
      console.error(`[WeatherService] getCurrentWeather error for '${query}':`, error instanceof Error ? error.message : error);
    }
  }

  // 2. Offline Mock Data Fallback
  const mockLoc = findMockLocation(query);
  const fallback = mockWeatherData[mockLoc?.id || 'new-delhi'] || mockWeatherData['new-delhi'];
  return {
    data: {
      ...fallback,
      lastUpdated: new Date().toISOString(),
    },
    isFallback: true,
  };
}

/**
 * Retrieves 3-day weather forecast in chronological order using live weather API.
 */
export async function getForecast(locationQuery: string): Promise<{ data: ForecastDay[]; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  // 1. Live WeatherAPI integration
  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(query, apiKey);
      if (json && json.forecast && Array.isArray(json.forecast.forecastday)) {
        const days: ForecastDay[] = json.forecast.forecastday.slice(0, 3).map(
          (
            fd: {
              date: string;
              day: {
                maxtemp_c: number;
                mintemp_c: number;
                condition: { text: string };
                daily_chance_of_rain?: number;
                chance_of_rain?: number;
                avghumidity: number;
                maxwind_kph: number;
              };
            },
            idx: number
          ) => {
            const dateObj = new Date(fd.date + 'T00:00:00');
            const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            const rainProb = typeof fd.day.daily_chance_of_rain === 'number'
              ? fd.day.daily_chance_of_rain
              : typeof fd.day.chance_of_rain === 'number'
              ? fd.day.chance_of_rain
              : 0;

            return {
              date: fd.date,
              day: dayName,
              high: Math.round(fd.day.maxtemp_c),
              low: Math.round(fd.day.mintemp_c),
              condition: {
                main: fd.day.condition?.text || 'Clear',
                description: fd.day.condition?.text || '',
                icon: mapWeatherApiConditionToIcon(fd.day.condition?.text || ''),
              },
              rainProbability: rainProb,
              humidity: Math.round(fd.day.avghumidity ?? 50),
              windSpeed: Math.round(fd.day.maxwind_kph ?? 15),
            };
          }
        );
        return { data: days, isFallback: false };
      }
    } catch (error) {
      console.error(`[WeatherService] getForecast error for '${query}':`, error instanceof Error ? error.message : error);
    }
  }

  // 2. Offline Mock Data Fallback
  const mockLoc = findMockLocation(query);
  const fallback = mockForecastData[mockLoc?.id || 'new-delhi'] || mockForecastData['new-delhi'];
  return {
    data: fallback,
    isFallback: true,
  };
}

/**
 * Retrieves upcoming hourly forecast for the current location.
 */
export async function getHourlyForecast(locationQuery: string): Promise<{ data: HourlyForecast[]; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  // 1. Live WeatherAPI integration
  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(query, apiKey);
      if (json && json.forecast?.forecastday?.[0]?.hour) {
        const todayHours = json.forecast.forecastday[0].hour;
        const tomorrowHours = json.forecast.forecastday[1]?.hour || [];
        const allHours = [...todayHours, ...tomorrowHours];

        // Determine current hour in the target location
        let currentHour = new Date().getHours();
        if (json.location?.localtime) {
          const parts = json.location.localtime.split(' ');
          if (parts[1]) {
            const hourPart = parseInt(parts[1].split(':')[0], 10);
            if (!isNaN(hourPart)) currentHour = hourPart;
          }
        }

        // Take next 6-8 intervals spaced across upcoming hours (e.g. current hour + 0, 3, 6, 9, 12, 15)
        const intervals = [0, 3, 6, 9, 12, 15];
        const sampled: HourlyForecast[] = intervals.map((offset) => {
          const targetIndex = currentHour + offset;
          const item = allHours[targetIndex] || todayHours[todayHours.length - 1];

          let timeLabel: string;
          if (item.time) {
            const timePart = item.time.split(' ')[1] || item.time;
            const hourNum = parseInt(timePart.split(':')[0], 10);
            if (offset === 0) {
              timeLabel = 'Now';
            } else if (hourNum === 0) {
              timeLabel = '12 AM';
            } else if (hourNum === 12) {
              timeLabel = '12 PM';
            } else if (hourNum > 12) {
              timeLabel = `${hourNum - 12} PM`;
            } else {
              timeLabel = `${hourNum} AM`;
            }
          } else {
            timeLabel = `${((currentHour + offset) % 24)}:00`;
          }

          const rainProb = typeof item.chance_of_rain === 'number' ? item.chance_of_rain : 0;

          return {
            time: timeLabel,
            temperature: Math.round(item.temp_c),
            condition: {
              main: item.condition?.text || 'Clear',
              description: item.condition?.text || '',
              icon: mapWeatherApiConditionToIcon(item.condition?.text || ''),
            },
            rainProbability: rainProb,
          };
        });

        return { data: sampled, isFallback: false };
      }
    } catch (error) {
      console.error(`[WeatherService] getHourlyForecast error for '${query}':`, error instanceof Error ? error.message : error);
    }
  }

  // 2. Offline Mock Data Fallback
  const mockLoc = findMockLocation(query);
  return {
    data: generateMockHourlyForecast(mockLoc?.id || 'new-delhi'),
    isFallback: true,
  };
}

/**
 * Retrieves active meteorological alerts and risks.
 * Returns an empty array if no severe alerts are currently active.
 */
export async function getWeatherRisks(locationQuery: string): Promise<{ data: WeatherRisk[]; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  // 1. Live WeatherAPI integration
  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(query, apiKey);
      if (json && json.alerts && Array.isArray(json.alerts.alert) && json.alerts.alert.length > 0) {
        const risks: WeatherRisk[] = json.alerts.alert.map(
          (a: { headline?: string; event?: string; desc?: string; severity?: string; effective?: string; expires?: string }, idx: number) => {
            const rawSev = (a.severity || 'moderate').toLowerCase();
            let level: RiskLevel = 'moderate';
            if (rawSev.includes('extreme') || rawSev.includes('severe')) level = 'severe';
            else if (rawSev.includes('high') || rawSev.includes('warning')) level = 'high';
            else if (rawSev.includes('minor') || rawSev.includes('low')) level = 'low';

            return {
              id: `api-alert-${idx}`,
              type: 'weather-advisory',
              level,
              title: a.event || a.headline || 'Weather Advisory',
              description: a.desc ? a.desc.slice(0, 160) + '...' : 'Meteorological warning active for the area.',
              icon: 'alert-triangle',
              timePeriod: a.expires ? `Until ${new Date(a.expires).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Current Alert',
              isActive: true,
            };
          }
        );
        return { data: risks, isFallback: false };
      }

      // No active alerts for this location
      return { data: [], isFallback: false };
    } catch (error) {
      console.error(`[WeatherService] getWeatherRisks error for '${query}':`, error instanceof Error ? error.message : error);
    }
  }

  // 2. Offline Mock Data Fallback
  const mockLoc = findMockLocation(query);
  const fallback = mockRisksData[mockLoc?.id || 'new-delhi'] || [];
  return {
    data: fallback,
    isFallback: true,
  };
}

/**
 * Searches for matching locations via WeatherAPI search endpoint.
 */
export async function searchLocations(query: string): Promise<LocationData[]> {
  const apiKey = process.env.WEATHER_API_KEY;
  const trimmed = query ? query.trim() : '';

  if (!trimmed) {
    return mockLocations;
  }

  // 1. Live WeatherAPI search
  if (apiKey && trimmed.length >= 2) {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const json = (await res.json()) as Array<{ id: number; name: string; region: string; country: string; lat: number; lon: number }>;
        if (Array.isArray(json) && json.length > 0) {
          return json.map((loc) => ({
            id: loc.name.toLowerCase().replace(/\s+/g, '-'),
            name: loc.name,
            region: loc.region || '',
            country: loc.country || '',
            lat: loc.lat,
            lon: loc.lon,
          }));
        }
      }
    } catch (error) {
      console.error(`[WeatherService] searchLocations error for '${trimmed}':`, error instanceof Error ? error.message : error);
    }
  }

  // 2. Offline Mock Search Fallback
  const lower = trimmed.toLowerCase();
  const cleanLower = lower.replace(/\s+/g, '-');
  const aliasTarget = CITY_ALIASES[lower] || CITY_ALIASES[cleanLower];

  return mockLocations.filter(
    (loc) =>
      loc.name.toLowerCase() === lower ||
      loc.id.toLowerCase() === cleanLower ||
      loc.name.toLowerCase().includes(lower) ||
      loc.region.toLowerCase().includes(lower) ||
      loc.country.toLowerCase().includes(lower) ||
      (aliasTarget && (loc.id.toLowerCase() === aliasTarget || loc.name.toLowerCase().includes(aliasTarget)))
  );
}

/**
 * Retrieves map telemetry layers for the specified location.
 */
export async function getMapData(locationQuery: string) {
  const { data: weather, isFallback } = await getCurrentWeather(locationQuery);
  const mockLoc = findMockLocation(locationQuery);

  const location: LocationData = {
    id: weather.location.toLowerCase().replace(/\s+/g, '-'),
    name: weather.location,
    region: weather.region,
    country: weather.country,
    lat: mockLoc?.lat ?? 28.6139,
    lon: mockLoc?.lon ?? 77.209,
  };

  return {
    location,
    weather,
    radarStatus: 'operational',
    stations: mockLocations,
    isFallback,
  };
}
