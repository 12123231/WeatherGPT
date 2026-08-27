import { useState, useEffect, useCallback } from 'react';
import type { CurrentWeather, ForecastDay, WeatherRisk, LocationData } from '../types/weather';
import * as weatherService from '../services/weatherService';

interface UseWeatherState {
  currentWeather: CurrentWeather | null;
  forecast: ForecastDay[];
  risks: WeatherRisk[];
  selectedLocation: LocationData;
  locations: LocationData[];
  loading: boolean;
  error: string | null;
}

export function useWeather() {
  const allLocations = weatherService.getAllLocations();

  const [state, setState] = useState<UseWeatherState>({
    currentWeather: null,
    forecast: [],
    risks: [],
    selectedLocation: allLocations[0],
    locations: allLocations,
    loading: true,
    error: null,
  });

  const loadWeatherData = useCallback(async (locationId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [currentWeather, forecast, risks] = await Promise.all([
        weatherService.getCurrentWeather(locationId),
        weatherService.getForecast(locationId),
        weatherService.getWeatherRisks(locationId),
      ]);
      setState((prev) => ({ ...prev, currentWeather, forecast, risks, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load weather data',
      }));
    }
  }, []);

  const setLocation = useCallback(
    (location: LocationData) => {
      setState((prev) => ({ ...prev, selectedLocation: location }));
      loadWeatherData(location.id);
    },
    [loadWeatherData]
  );

  useEffect(() => {
    loadWeatherData(state.selectedLocation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    setLocation,
    refresh: () => loadWeatherData(state.selectedLocation.id),
  };
}
