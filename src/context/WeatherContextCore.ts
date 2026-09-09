import { createContext } from 'react';
import type { CurrentWeather, ForecastDay, HourlyForecast, WeatherRisk, LocationData, ConnectionStatus as ConnectionStatusType } from '../types/weather';

export interface WeatherContextValue {
  currentWeather: CurrentWeather | null;
  forecast: ForecastDay[];
  hourlyForecast: HourlyForecast[];
  risks: WeatherRisk[];
  selectedLocation: LocationData;
  locations: LocationData[];
  loading: boolean;
  error: string | null;
  setLocation: (location: LocationData) => void;
  refresh: () => void;
  connectionStatus: ConnectionStatusType;
  lastSynced: string;
  isLive: boolean;
}

export const WeatherContext = createContext<WeatherContextValue | null>(null);
