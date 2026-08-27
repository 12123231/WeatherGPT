import React from 'react';
import { useWeather } from '../hooks/useWeather';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { WeatherContext } from './WeatherContextCore';

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const weather = useWeather();
  const { status: connectionStatus, lastSynced } = useConnectionStatus();

  return (
    <WeatherContext.Provider
      value={{
        ...weather,
        connectionStatus,
        lastSynced,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export { useWeatherContext } from './useWeatherContext';
