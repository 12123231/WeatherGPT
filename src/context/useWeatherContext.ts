import { useContext } from 'react';
import { WeatherContext } from './WeatherContextCore';
import type { WeatherContextValue } from './WeatherContextCore';

export function useWeatherContext(): WeatherContextValue {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
}
