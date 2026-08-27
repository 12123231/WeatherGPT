import type { CurrentWeather, ForecastDay, HourlyForecast, WeatherRisk, LocationData, RiskLevel } from '../types/index.js';
import { mockWeatherData, mockForecastData, mockHourlyForecast, mockRisksData, mockLocations } from './mockData.js';

function normalizeLocationId(locationQuery: string): string {
  if (!locationQuery) return 'new-delhi';
  const clean = locationQuery.toLowerCase().trim().replace(/\s+/g, '-');
  if (mockWeatherData[clean]) return clean;

  const found = mockLocations.find(
    (l) => l.name.toLowerCase() === locationQuery.toLowerCase() ||
           l.id.toLowerCase() === clean ||
           l.region.toLowerCase() === locationQuery.toLowerCase()
  );
  return found ? found.id : 'new-delhi';
}

function mapWeatherApiConditionToIcon(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('lightning')) return 'cloud-lightning';
  if (t.includes('heavy rain') || t.includes('torrential')) return 'cloud-rain';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'cloud-rain';
  if (t.includes('snow') || t.includes('blizzard') || t.includes('sleet') || t.includes('ice')) return 'cloud-snow';
  if (t.includes('partly') || t.includes('scattered')) return 'cloud-sun';
  if (t.includes('cloud') || t.includes('overcast') || t.includes('fog') || t.includes('mist')) return 'cloud';
  if (t.includes('sunny') || t.includes('clear')) return 'sun';
  return 'cloud-sun';
}

// Fetch helper from WeatherAPI.com
async function fetchWeatherApiData(query: string, apiKey: string) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`WeatherAPI responded with status ${res.status}`);
  }
  return res.json();
}

export async function getCurrentWeather(locationQuery: string): Promise<{ data: CurrentWeather; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const locId = normalizeLocationId(locationQuery);

  if (apiKey) {
    try {
      // 1. Try WeatherAPI.com
      const json = await fetchWeatherApiData(locationQuery, apiKey);
      if (json && json.current && json.location) {
        const liveData: CurrentWeather = {
          location: json.location.name,
          region: json.location.region || '',
          country: json.location.country || 'India',
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
          uvIndex: Math.round(json.current.uv || 5),
          lastUpdated: new Date().toISOString(),
        };
        return { data: liveData, isFallback: false };
      }
    } catch {
      // Gracefully fall back to local mock data on network error
    }
  }

  // Fallback
  const fallback = mockWeatherData[locId] || mockWeatherData['new-delhi'];
  return {
    data: {
      ...fallback,
      lastUpdated: new Date().toISOString(),
    },
    isFallback: true,
  };
}

export async function getForecast(locationQuery: string): Promise<{ data: ForecastDay[]; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const locId = normalizeLocationId(locationQuery);

  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(locationQuery, apiKey);
      if (json && json.forecast && json.forecast.forecastday) {
        const days: ForecastDay[] = json.forecast.forecastday.map(
          (fd: {
            date: string;
            day: {
              maxtemp_c: number;
              mintemp_c: number;
              condition: { text: string };
              daily_chance_of_rain?: number;
              avghumidity: number;
              maxwind_kph: number;
            };
          }, idx: number) => {
            const dateObj = new Date(fd.date);
            const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
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
              rainProbability: fd.day.daily_chance_of_rain || 10,
              humidity: Math.round(fd.day.avghumidity || 50),
              windSpeed: Math.round(fd.day.maxwind_kph || 15),
            };
          }
        );
        return { data: days, isFallback: false };
      }
    } catch {
      // Fallback
    }
  }

  const fallback = mockForecastData[locId] || mockForecastData['new-delhi'];
  return {
    data: fallback,
    isFallback: true,
  };
}

export async function getHourlyForecast(locationQuery: string): Promise<{ data: HourlyForecast[]; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(locationQuery, apiKey);
      if (json && json.forecast?.forecastday?.[0]?.hour) {
        const hours = json.forecast.forecastday[0].hour;
        // Sample every 3 hours (e.g. 0, 3, 6, 9, 12, 15, 18, 21)
        const sampled: HourlyForecast[] = [9, 12, 15, 18, 21, 0].map((h) => {
          const item = hours[h] || hours[0];
          const timeLabel = h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
          return {
            time: timeLabel,
            temperature: Math.round(item.temp_c),
            condition: {
              main: item.condition?.text || 'Clear',
              description: item.condition?.text || '',
              icon: mapWeatherApiConditionToIcon(item.condition?.text || ''),
            },
            rainProbability: item.chance_of_rain || 10,
          };
        });
        return { data: sampled, isFallback: false };
      }
    } catch {
      // Fallback
    }
  }

  return {
    data: mockHourlyForecast,
    isFallback: true,
  };
}

export async function getWeatherRisks(locationQuery: string): Promise<{ data: WeatherRisk[]; isFallback: boolean }> {
  const apiKey = process.env.WEATHER_API_KEY;
  const locId = normalizeLocationId(locationQuery);

  if (apiKey) {
    try {
      const json = await fetchWeatherApiData(locationQuery, apiKey);
      if (json && json.alerts && json.alerts.alert && json.alerts.alert.length > 0) {
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
    } catch {
      // Fallback
    }
  }

  const fallback = mockRisksData[locId] || [];
  return {
    data: fallback,
    isFallback: true,
  };
}

export async function searchLocations(query: string): Promise<LocationData[]> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey && query && query.trim().length >= 2) {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const json = await res.json() as Array<{ id: number; name: string; region: string; country: string; lat: number; lon: number }>;
        if (Array.isArray(json) && json.length > 0) {
          return json.map((loc) => ({
            id: loc.name.toLowerCase().replace(/\s+/g, '-'),
            name: loc.name,
            region: loc.region || '',
            country: loc.country || 'India',
            lat: loc.lat,
            lon: loc.lon,
          }));
        }
      }
    } catch {
      // Fallback
    }
  }

  if (!query || !query.trim()) return mockLocations;
  const lower = query.toLowerCase().trim();
  return mockLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(lower) ||
      loc.region.toLowerCase().includes(lower) ||
      loc.country.toLowerCase().includes(lower)
  );
}

export async function getMapData(locationQuery: string) {
  const locId = normalizeLocationId(locationQuery);
  const location = mockLocations.find((l) => l.id === locId) || mockLocations[0];
  const { data: weather } = await getCurrentWeather(locationQuery);

  return {
    location,
    weather,
    radarStatus: 'operational',
    stations: mockLocations,
    isFallback: true,
  };
}
