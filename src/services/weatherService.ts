import type { CurrentWeather, ForecastDay, HourlyForecast, WeatherRisk, LocationData } from '../types/weather';
import { mockWeatherData } from '../data/mockWeather';
import { mockForecastData, generateMockHourlyForecast } from '../data/mockForecast';
import { mockRisksData } from '../data/mockRisks';
import { mockLocations } from '../data/mockLocations';
import { API_BASE_URL } from '../config';

/**
 * Weather service layer connected to WeatherGPT Backend.
 * Gracefully falls back to local data if backend connection is unavailable.
 */

export async function getCurrentWeather(locationId: string): Promise<CurrentWeather> {
  const result = await getCurrentWeatherWithMeta(locationId);
  return result.data;
}

export async function getCurrentWeatherWithMeta(locationId: string): Promise<{ data: CurrentWeather; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/current?location=${encodeURIComponent(locationId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { data: json.data, isLive: json.isFallback === false };
      }
    }
  } catch {
    // Graceful fallback to client cache/mock
  }

  const data = mockWeatherData[locationId] || mockWeatherData['new-delhi'];
  if (!data) throw new Error(`No weather data for location: ${locationId}`);
  return { data, isLive: false };
}

export async function getForecast(locationId: string): Promise<ForecastDay[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/forecast?location=${encodeURIComponent(locationId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Graceful fallback to client cache/mock
  }

  const data = mockForecastData[locationId] || mockForecastData['new-delhi'];
  if (!data) throw new Error(`No forecast data for location: ${locationId}`);
  return data;
}

export async function getHourlyForecast(locationId: string): Promise<HourlyForecast[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/hourly?location=${encodeURIComponent(locationId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Graceful fallback
  }

  return generateMockHourlyForecast(locationId);
}

export async function getWeatherRisks(locationId: string): Promise<WeatherRisk[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/alerts?location=${encodeURIComponent(locationId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Graceful fallback
  }

  return mockRisksData[locationId] ?? [];
}

export async function searchLocations(query: string): Promise<LocationData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/locations/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Graceful fallback
  }

  if (!query.trim()) return mockLocations;
  const lower = query.toLowerCase();
  return mockLocations.filter(
    (loc) => loc.name.toLowerCase().includes(lower) || loc.region.toLowerCase().includes(lower)
  );
}

export function getAllLocations(): LocationData[] {
  return mockLocations;
}
