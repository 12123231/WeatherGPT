import type { CurrentWeather, ForecastDay, HourlyForecast, WeatherRisk, LocationData, RiskLevel } from '../types/index.js';
import { mockWeatherData, mockForecastData, mockRisksData, mockLocations, generateMockHourlyForecast } from './mockData.js';

/**
 * Returns the Google Maps Platform / Weather API key configured on the server.
 * Supports GOOGLE_MAPS_API_KEY, GOOGLE_WEATHER_API_KEY, or legacy WEATHER_API_KEY.
 */
function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_WEATHER_API_KEY || process.env.WEATHER_API_KEY;
}

/**
 * Maps Google Weather condition type and description text to Lucide icon identifiers used in the frontend.
 */
function mapGoogleConditionToIcon(type?: string, descriptionText?: string, isDay = true): string {
  const t = (type || '').toUpperCase();
  const d = (descriptionText || '').toLowerCase();

  if (
    t.includes('THUNDER') ||
    t.includes('LIGHTNING') ||
    d.includes('thunder') ||
    d.includes('lightning')
  ) {
    return 'cloud-lightning';
  }

  if (
    t.includes('RAIN') ||
    t.includes('SHOWER') ||
    t.includes('DRIZZLE') ||
    d.includes('rain') ||
    d.includes('shower') ||
    d.includes('drizzle')
  ) {
    return 'cloud-rain';
  }

  if (
    t.includes('SNOW') ||
    t.includes('BLIZZARD') ||
    t.includes('ICE') ||
    t.includes('SLEET') ||
    d.includes('snow') ||
    d.includes('blizzard') ||
    d.includes('sleet') ||
    d.includes('ice')
  ) {
    return 'cloud-snow';
  }

  if (t.includes('WIND') || d.includes('wind') || d.includes('gale')) {
    return 'wind';
  }

  if (
    t.includes('PARTLY_CLOUDY') ||
    t.includes('MOSTLY_CLEAR') ||
    t.includes('SCATTERED') ||
    d.includes('partly') ||
    d.includes('scattered')
  ) {
    return isDay ? 'cloud-sun' : 'cloud';
  }

  if (
    t.includes('CLOUDY') ||
    t.includes('OVERCAST') ||
    t.includes('FOG') ||
    t.includes('HAZE') ||
    d.includes('cloud') ||
    d.includes('overcast') ||
    d.includes('fog') ||
    d.includes('mist') ||
    d.includes('haze')
  ) {
    return 'cloud';
  }

  if (t.includes('CLEAR') || d.includes('clear') || d.includes('sunny')) {
    return isDay ? 'sun' : 'moon';
  }

  return isDay ? 'cloud-sun' : 'cloud';
}

/**
 * Maps wind direction representation to standard compass acronyms (e.g., 'N', 'NE', 'SW').
 */
function mapWindDirection(direction?: { cardinal?: string; degrees?: number }): string {
  if (direction?.cardinal) {
    const cardinalMap: Record<string, string> = {
      NORTH: 'N',
      NORTH_NORTHEAST: 'NNE',
      NORTHEAST: 'NE',
      EAST_NORTHEAST: 'ENE',
      EAST: 'E',
      EAST_SOUTHEAST: 'ESE',
      SOUTHEAST: 'SE',
      SOUTH_SOUTHEAST: 'SSE',
      SOUTH: 'S',
      SOUTH_SOUTHWEST: 'SSW',
      SOUTHWEST: 'SW',
      WEST_SOUTHWEST: 'WSW',
      WEST: 'W',
      WEST_NORTHWEST: 'WNW',
      NORTHWEST: 'NW',
      NORTH_NORTHWEST: 'NNW',
    };
    if (cardinalMap[direction.cardinal]) {
      return cardinalMap[direction.cardinal];
    }
  }

  if (typeof direction?.degrees === 'number') {
    const val = Math.floor(direction.degrees / 22.5 + 0.5);
    const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return compass[val % 16] || 'N';
  }

  return 'N';
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
  delhi: 'Delhi',
  dilli: 'Delhi',
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

interface ResolvedLocationCoords {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
}

/**
 * Resolves a location query into latitude and longitude coordinates.
 * Priority:
 * 1. Coordinates syntax: "lat,lon"
 * 2. Predefined mock locations list (with exact coordinates)
 * 3. Google Geocoding API lookup (if demo key available)
 * 4. Fallback to default mock location (New Delhi)
 */
async function resolveLocationCoordinates(query: string, apiKey?: string): Promise<ResolvedLocationCoords> {
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    throw new Error('Location query cannot be empty');
  }

  // 1. Direct coordinate match: "28.6139, 77.2090"
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    return {
      name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      region: '',
      country: '',
      lat,
      lon,
    };
  }

  // 2. Predefined mock locations
  const lower = trimmed.toLowerCase();
  const cleanLower = lower.replace(/\s+/g, '-');
  const disambiguated = CITY_QUERY_DISAMBIGUATION[lower] || CITY_QUERY_DISAMBIGUATION[cleanLower] || trimmed;
  const mockLoc = findMockLocation(disambiguated);

  if (mockLoc) {
    return {
      name: mockLoc.name,
      region: mockLoc.region,
      country: mockLoc.country,
      lat: mockLoc.lat,
      lon: mockLoc.lon,
      timezone: mockLoc.timezone,
    };
  }

  // 3. Dynamic Geocoding via Google Maps Geocoding API if key is available
  if (apiKey) {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(disambiguated)}&key=${apiKey}`;
      const res = await fetch(geocodeUrl);
      if (res.ok) {
        const json = (await res.json()) as {
          status?: string;
          results?: Array<{
            address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
            formatted_address?: string;
            geometry?: { location?: { lat: number; lng: number } };
          }>;
        };

        if (json.status === 'OK' && json.results && json.results.length > 0) {
          const first = json.results[0];
          const lat = first.geometry?.location?.lat;
          const lon = first.geometry?.location?.lng;

          if (typeof lat === 'number' && typeof lon === 'number') {
            let cityName = disambiguated;
            let regionName = '';
            let countryName = '';

            first.address_components?.forEach((comp) => {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                cityName = comp.long_name;
              } else if (comp.types.includes('administrative_area_level_1')) {
                regionName = comp.long_name;
              } else if (comp.types.includes('country')) {
                countryName = comp.long_name;
              }
            });

            return {
              name: cityName,
              region: regionName,
              country: countryName,
              lat,
              lon,
            };
          }
        }
      }
    } catch {
      // Ignore geocode failure and fall back to default
    }
  }

  // 4. Default fallback: New Delhi
  return {
    name: disambiguated,
    region: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
    timezone: 'Asia/Kolkata',
  };
}

/**
 * Executes a GET request to the Google Weather API endpoint with standard error handling.
 */
async function fetchGoogleWeatherEndpoint<T>(endpoint: string, lat: number, lon: number, apiKey: string, extraParams: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`https://weather.googleapis.com/v1/${endpoint}`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('location.latitude', lat.toString());
  url.searchParams.set('location.longitude', lon.toString());
  url.searchParams.set('unitsSystem', 'METRIC');
  url.searchParams.set('languageCode', 'en');

  for (const [k, v] of Object.entries(extraParams)) {
    url.searchParams.set(k, v.toString());
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    let errorDetail = `Google Weather API returned HTTP ${res.status}`;
    try {
      const errJson = (await res.json()) as { error?: { code?: number; message?: string; status?: string } };
      if (errJson?.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

/**
 * Retrieves current live weather for the specified location using Google Weather API.
 */
export async function getCurrentWeather(locationQuery: string): Promise<{ data: CurrentWeather; isFallback: boolean }> {
  const apiKey = getGoogleApiKey();
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  if (!apiKey) {
    const mockLoc = findMockLocation(query);
    const fallback = mockWeatherData[mockLoc?.id || 'new-delhi'] || mockWeatherData['new-delhi'];
    return { data: fallback, isFallback: true };
  }

  try {
    const coords = await resolveLocationCoordinates(query, apiKey);
    const json = await fetchGoogleWeatherEndpoint<{
      currentTime?: string;
      timeZone?: { id?: string };
      isDaytime?: boolean;
      weatherCondition?: {
        iconBaseUri?: string;
        description?: { text?: string };
        type?: string;
      };
      temperature?: { degrees?: number; unit?: string };
      feelsLikeTemperature?: { degrees?: number; unit?: string };
      relativeHumidity?: number;
      uvIndex?: number;
      airPressure?: { meanSeaLevelMillibars?: number };
      wind?: {
        direction?: { degrees?: number; cardinal?: string };
        speed?: { value?: number; unit?: string };
      };
      visibility?: { distance?: number; unit?: string };
    }>('currentConditions:lookup', coords.lat, coords.lon, apiKey);

    if (json && json.temperature) {
      const conditionText = json.weatherCondition?.description?.text || json.weatherCondition?.type || 'Clear';
      const liveData: CurrentWeather = {
        location: coords.name,
        region: coords.region,
        country: coords.country,
        temperature: Math.round(json.temperature.degrees ?? 0),
        feelsLike: Math.round(json.feelsLikeTemperature?.degrees ?? json.temperature.degrees ?? 0),
        condition: {
          main: conditionText,
          description: json.weatherCondition?.description?.text || conditionText,
          icon: mapGoogleConditionToIcon(json.weatherCondition?.type, conditionText, json.isDaytime ?? true),
        },
        humidity: Math.round(json.relativeHumidity ?? 0),
        windSpeed: Math.round(json.wind?.speed?.value ?? 0),
        windDirection: mapWindDirection(json.wind?.direction),
        visibility: Math.round(json.visibility?.distance ?? 10),
        pressure: Math.round(json.airPressure?.meanSeaLevelMillibars ?? 1013),
        uvIndex: Math.round(json.uvIndex ?? 0),
        lastUpdated: json.currentTime ? new Date(json.currentTime).toISOString() : new Date().toISOString(),
        timezone: json.timeZone?.id || coords.timezone || 'Asia/Kolkata',
      };
      return { data: liveData, isFallback: false };
    }

    throw new Error(`Google Weather API returned unexpected current conditions payload for '${query}'`);
  } catch (error) {
    console.error(`[WeatherService] getCurrentWeather error for '${query}':`, error instanceof Error ? error.message : error);
    const mockLoc = findMockLocation(query);
    const fallback = mockWeatherData[mockLoc?.id || 'new-delhi'] || mockWeatherData['new-delhi'];
    if (fallback) {
      return { data: fallback, isFallback: true };
    }
    throw error;
  }
}

/**
 * Retrieves 3-day weather forecast in chronological order using Google Weather API.
 */
export async function getForecast(locationQuery: string): Promise<{ data: ForecastDay[]; isFallback: boolean }> {
  const apiKey = getGoogleApiKey();
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  if (!apiKey) {
    const mockLoc = findMockLocation(query);
    const fallback = mockForecastData[mockLoc?.id || 'new-delhi'] || mockForecastData['new-delhi'];
    return { data: fallback, isFallback: true };
  }

  try {
    const coords = await resolveLocationCoordinates(query, apiKey);
    const json = await fetchGoogleWeatherEndpoint<{
      forecastDays?: Array<{
        displayDate?: { year?: number; month?: number; day?: number };
        interval?: { startTime?: string; endTime?: string };
        maxTemperature?: { degrees?: number };
        minTemperature?: { degrees?: number };
        daytimeForecast?: {
          weatherCondition?: { description?: { text?: string }; type?: string };
          precipitation?: { probability?: { percent?: number } };
          relativeHumidity?: number;
          wind?: { speed?: { value?: number }; direction?: { cardinal?: string; degrees?: number } };
        };
        nighttimeForecast?: {
          weatherCondition?: { description?: { text?: string }; type?: string };
          precipitation?: { probability?: { percent?: number } };
          relativeHumidity?: number;
          wind?: { speed?: { value?: number }; direction?: { cardinal?: string; degrees?: number } };
        };
      }>;
    }>('forecast/days:lookup', coords.lat, coords.lon, apiKey, { days: 3, pageSize: 3 });

    if (json && Array.isArray(json.forecastDays) && json.forecastDays.length > 0) {
      const days: ForecastDay[] = json.forecastDays.slice(0, 3).map((fd, idx) => {
        let dateStr = '';
        if (fd.displayDate && fd.displayDate.year && fd.displayDate.month && fd.displayDate.day) {
          const y = fd.displayDate.year;
          const m = String(fd.displayDate.month).padStart(2, '0');
          const d = String(fd.displayDate.day).padStart(2, '0');
          dateStr = `${y}-${m}-${d}`;
        } else if (fd.interval?.startTime) {
          dateStr = fd.interval.startTime.split('T')[0] || '';
        } else {
          const d = new Date();
          d.setDate(d.getDate() + idx);
          dateStr = d.toISOString().split('T')[0] || '';
        }

        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayPart = fd.daytimeForecast || fd.nighttimeForecast;
        const conditionText = dayPart?.weatherCondition?.description?.text || dayPart?.weatherCondition?.type || 'Clear';

        const high = Math.round(fd.maxTemperature?.degrees ?? 30);
        const low = Math.round(fd.minTemperature?.degrees ?? 20);
        const rainProb = dayPart?.precipitation?.probability?.percent ?? 0;
        const humidity = Math.round(dayPart?.relativeHumidity ?? 50);
        const windSpeed = Math.round(dayPart?.wind?.speed?.value ?? 15);

        return {
          date: dateStr,
          day: dayName,
          high,
          low,
          condition: {
            main: conditionText,
            description: dayPart?.weatherCondition?.description?.text || conditionText,
            icon: mapGoogleConditionToIcon(dayPart?.weatherCondition?.type, conditionText, true),
          },
          rainProbability: rainProb,
          humidity,
          windSpeed,
        };
      });

      return { data: days, isFallback: false };
    }

    throw new Error(`Google Weather API forecast payload missing for '${query}'`);
  } catch (error) {
    console.error(`[WeatherService] getForecast error for '${query}':`, error instanceof Error ? error.message : error);
    const mockLoc = findMockLocation(query);
    const fallback = mockForecastData[mockLoc?.id || 'new-delhi'] || mockForecastData['new-delhi'];
    if (fallback) {
      return { data: fallback, isFallback: true };
    }
    throw error;
  }
}

/**
 * Retrieves upcoming hourly forecast for the current location using Google Weather API.
 * First card represents "Now", followed by the next consecutive hours rolling dynamically.
 */
export async function getHourlyForecast(locationQuery: string): Promise<{ data: HourlyForecast[]; isFallback: boolean }> {
  const apiKey = getGoogleApiKey();
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  if (!apiKey) {
    const mockLoc = findMockLocation(query);
    const fallback = generateMockHourlyForecast(mockLoc?.id || 'new-delhi');
    return { data: fallback, isFallback: true };
  }

  try {
    const coords = await resolveLocationCoordinates(query, apiKey);
    const json = await fetchGoogleWeatherEndpoint<{
      forecastHours?: Array<{
        interval?: { startTime?: string; endTime?: string };
        displayDateTime?: {
          year?: number;
          month?: number;
          day?: number;
          hours?: number;
          minutes?: number;
        };
        temperature?: { degrees?: number };
        weatherCondition?: { description?: { text?: string }; type?: string };
        precipitation?: { probability?: { percent?: number } };
        isDaytime?: boolean;
      }>;
    }>('forecast/hours:lookup', coords.lat, coords.lon, apiKey, { hours: 24, pageSize: 24 });

    if (json && Array.isArray(json.forecastHours) && json.forecastHours.length > 0) {
      const sampled: HourlyForecast[] = json.forecastHours.slice(0, 24).map((h, offset) => {
        let hourNum = new Date().getHours();
        let dateStr = new Date().toISOString().split('T')[0] || '';

        if (h.displayDateTime?.hours !== undefined) {
          hourNum = h.displayDateTime.hours;
          if (h.displayDateTime.year && h.displayDateTime.month && h.displayDateTime.day) {
            dateStr = `${h.displayDateTime.year}-${String(h.displayDateTime.month).padStart(2, '0')}-${String(h.displayDateTime.day).padStart(2, '0')}`;
          }
        } else if (h.interval?.startTime) {
          const parts = h.interval.startTime.split('T');
          dateStr = parts[0] || '';
          if (parts[1]) {
            const parsedHour = parseInt(parts[1].split(':')[0] || '0', 10);
            if (!isNaN(parsedHour)) hourNum = parsedHour;
          }
        }

        let timeLabel: string;
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

        const isDay = h.isDaytime ?? (hourNum >= 6 && hourNum < 18);
        const conditionText = h.weatherCondition?.description?.text || h.weatherCondition?.type || 'Clear';
        const icon = mapGoogleConditionToIcon(h.weatherCondition?.type, conditionText, isDay);
        const rainProb = h.precipitation?.probability?.percent ?? 0;

        return {
          time: timeLabel,
          temperature: Math.round(h.temperature?.degrees ?? 25),
          condition: {
            main: conditionText,
            description: h.weatherCondition?.description?.text || conditionText,
            icon,
          },
          rainProbability: rainProb,
          hour: hourNum,
          date: dateStr,
          isDay,
        };
      });

      return { data: sampled, isFallback: false };
    }

    throw new Error(`Google Weather API hourly forecast payload missing for '${query}'`);
  } catch (error) {
    console.error(`[WeatherService] getHourlyForecast error for '${query}':`, error instanceof Error ? error.message : error);
    const mockLoc = findMockLocation(query);
    const fallback = generateMockHourlyForecast(mockLoc?.id || 'new-delhi');
    return { data: fallback, isFallback: true };
  }
}

/**
 * Retrieves active meteorological alerts and risks using Google Weather API publicAlerts endpoint.
 * Returns an empty array if no severe alerts are currently active.
 */
export async function getWeatherRisks(locationQuery: string): Promise<{ data: WeatherRisk[]; isFallback: boolean }> {
  const apiKey = getGoogleApiKey();
  const query = locationQuery ? locationQuery.trim() : '';

  if (!query) {
    throw new Error('Location query cannot be empty');
  }

  if (!apiKey) {
    const mockLoc = findMockLocation(query);
    const fallback = mockRisksData[mockLoc?.id || 'new-delhi'] || [];
    return { data: fallback, isFallback: true };
  }

  try {
    const coords = await resolveLocationCoordinates(query, apiKey);
    const json = await fetchGoogleWeatherEndpoint<{
      alerts?: Array<{
        alertId?: string;
        headline?: { text?: string };
        description?: string;
        severity?: string;
        expirationTime?: string;
        areaName?: string;
      }>;
    }>('publicAlerts:lookup', coords.lat, coords.lon, apiKey);

    if (json && Array.isArray(json.alerts) && json.alerts.length > 0) {
      const risks: WeatherRisk[] = json.alerts.map((a, idx) => {
        const rawSev = (a.severity || 'MODERATE').toUpperCase();
        let level: RiskLevel = 'moderate';
        if (rawSev === 'EXTREME' || rawSev === 'SEVERE') level = 'severe';
        else if (rawSev === 'HIGH' || rawSev === 'WARNING') level = 'high';
        else if (rawSev === 'MINOR') level = 'low';

        return {
          id: a.alertId || `google-alert-${idx}`,
          type: 'weather-advisory',
          level,
          title: a.headline?.text || a.areaName || 'Weather Advisory',
          description: a.description ? a.description.slice(0, 160) + '...' : 'Meteorological warning active for the area.',
          icon: 'alert-triangle',
          timePeriod: a.expirationTime
            ? `Until ${new Date(a.expirationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Current Alert',
          isActive: true,
        };
      });
      return { data: risks, isFallback: false };
    }

    // No active alerts for this location
    return { data: [], isFallback: false };
  } catch (error) {
    console.error(`[WeatherService] getWeatherRisks error for '${query}':`, error instanceof Error ? error.message : error);
    const mockLoc = findMockLocation(query);
    const fallback = mockRisksData[mockLoc?.id || 'new-delhi'] || [];
    return { data: fallback, isFallback: true };
  }
}

/**
 * Searches for matching locations via Google Geocoding API or offline mock fallback.
 */
export async function searchLocations(query: string): Promise<LocationData[]> {
  const apiKey = getGoogleApiKey();
  const trimmed = query ? query.trim() : '';

  if (!trimmed) {
    return mockLocations;
  }

  // 1. Live Google Geocoding lookup if key available
  if (apiKey && trimmed.length >= 2) {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&key=${apiKey}`;
      const res = await fetch(geocodeUrl);
      if (res.ok) {
        const json = (await res.json()) as {
          status?: string;
          results?: Array<{
            place_id?: string;
            formatted_address?: string;
            address_components?: Array<{ long_name: string; types: string[] }>;
            geometry?: { location?: { lat: number; lng: number } };
          }>;
        };

        if (json.status === 'OK' && Array.isArray(json.results) && json.results.length > 0) {
          return json.results.slice(0, 5).map((item) => {
            let cityName = item.formatted_address?.split(',')[0] || trimmed;
            let regionName = '';
            let countryName = '';

            item.address_components?.forEach((comp) => {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                cityName = comp.long_name;
              } else if (comp.types.includes('administrative_area_level_1')) {
                regionName = comp.long_name;
              } else if (comp.types.includes('country')) {
                countryName = comp.long_name;
              }
            });

            return {
              id: item.place_id || cityName.toLowerCase().replace(/\s+/g, '-'),
              name: cityName,
              region: regionName,
              country: countryName,
              lat: item.geometry?.location?.lat ?? 28.6139,
              lon: item.geometry?.location?.lng ?? 77.209,
            };
          });
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
