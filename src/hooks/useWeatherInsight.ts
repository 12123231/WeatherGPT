import { useMemo, useRef, useEffect, useState } from 'react';
import { useWeatherContext } from '../context/useWeatherContext';
import {
  generateWeatherInsights,
  type WeatherInsightResult,
} from '../services/insightService';

export interface UseWeatherInsightReturn {
  insightResult: WeatherInsightResult;
  isLive: boolean;
}

/**
 * useWeatherInsight Hook
 * 
 * - Consumes verified weather telemetry from WeatherContext.
 * - Deterministically calculates outdoor activity suitability, clothing recommendations,
 *   weather windows, and a summary.
 * - Immediately clears stale insights when selectedLocation.id changes.
 * - If isLive is false or currentWeather is null, cleanly returns dataAvailable: false.
 * - Performs ZERO API calls and has ZERO external LLM latency.
 */
export function useWeatherInsight(): UseWeatherInsightReturn {
  const {
    currentWeather,
    hourlyForecast,
    forecast,
    selectedLocation,
    isLive,
    loading,
  } = useWeatherContext();

  // Track location changes to prevent stale data leaking across fast city switches
  const lastLocationIdRef = useRef<string>(selectedLocation.id);
  const [activeLocationId, setActiveLocationId] = useState<string>(selectedLocation.id);

  useEffect(() => {
    if (selectedLocation.id !== lastLocationIdRef.current) {
      lastLocationIdRef.current = selectedLocation.id;
      setActiveLocationId(selectedLocation.id);
    }
  }, [selectedLocation.id]);

  const insightResult = useMemo<WeatherInsightResult>(() => {
    // If currently switching or loading with no current weather, or location mismatch
    if (loading || !currentWeather || !isLive || selectedLocation.id !== activeLocationId) {
      return {
        dataAvailable: false,
        locationName: selectedLocation.name,
        dailySummary: 'AI Weather Insights unavailable — Live weather data offline.',
        activityAdvice: {
          score: 0,
          category: 'Unfavorable',
          explanation: 'Live weather telemetry offline.',
        },
        clothingAdvice: [],
        keyWindows: [],
      };
    }

    return generateWeatherInsights(
      selectedLocation.name,
      currentWeather,
      hourlyForecast,
      forecast,
      isLive
    );
  }, [
    selectedLocation.id,
    selectedLocation.name,
    activeLocationId,
    currentWeather,
    hourlyForecast,
    forecast,
    isLive,
    loading,
  ]);

  return {
    insightResult,
    isLive,
  };
}
