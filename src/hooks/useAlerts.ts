import { useState, useEffect, useMemo, useRef } from 'react';
import { useWeatherContext } from '../context/useWeatherContext';
import { evaluateAlerts, type AlertEngineResult, type WeatherAlert } from '../services/alertService';

export interface UseAlertsReturn {
  alertResult: AlertEngineResult;
  popupAlert: WeatherAlert | null;
  dismissPopup: () => void;
  isLive: boolean;
}

/**
 * useAlerts Hook
 * 
 * - Evaluates the centralized alert engine against current weather state.
 * - Manages popup triggers: strictly RED alerts only.
 * - Prevents repetitive popup popups on simple component re-renders.
 * - Deduplicates popups using alert ID + location combination.
 * - Handles location race conditions: whenever selectedLocation changes,
 *   popup state is reset, preventing stale alerts from sticking around.
 */
export function useAlerts(): UseAlertsReturn {
  const {
    currentWeather,
    hourlyForecast,
    forecast,
    selectedLocation,
    loading,
    isLive,
  } = useWeatherContext();

  // Active popup state for RED alerts only
  const [popupAlert, setPopupAlert] = useState<WeatherAlert | null>(null);

  // Track dismissed alert IDs to avoid showing the same alert repeatedly
  const dismissedAlertsRef = useRef<Set<string>>(new Set());

  // Track last seen location ID to cleanly reset state on location switch
  const lastLocationIdRef = useRef<string>(selectedLocation.id);

  // Evaluate alerts pure function via useMemo
  const alertResult = useMemo(() => {
    // If loading or no weather data, return temporary unavailable result
    if (!currentWeather) {
      return {
        alerts: [],
        overallSeverity: 'green' as const,
        location: selectedLocation.name,
        dataAvailable: false,
      };
    }

    return evaluateAlerts(
      selectedLocation.name,
      currentWeather,
      hourlyForecast,
      forecast,
      isLive
    );
  }, [selectedLocation.name, currentWeather, hourlyForecast, forecast, isLive]);

  // Handle location change safety
  useEffect(() => {
    if (selectedLocation.id !== lastLocationIdRef.current) {
      lastLocationIdRef.current = selectedLocation.id;
      // Clear any open popup when location switches
      setPopupAlert(null);
    }
  }, [selectedLocation.id]);

  // Trigger popup strictly for RED alerts if not already dismissed
  useEffect(() => {
    if (loading || !alertResult.dataAvailable) {
      return;
    }

    const firstRedAlert = alertResult.alerts.find((a) => a.severity === 'red');

    if (firstRedAlert) {
      const alertKey = `${firstRedAlert.id}_${selectedLocation.id}`;
      if (!dismissedAlertsRef.current.has(alertKey)) {
        setPopupAlert(firstRedAlert);
      }
    } else {
      // If there is no longer a red alert, close popup
      setPopupAlert(null);
    }
  }, [alertResult, loading, selectedLocation.id]);

  const dismissPopup = () => {
    if (popupAlert) {
      const alertKey = `${popupAlert.id}_${selectedLocation.id}`;
      dismissedAlertsRef.current.add(alertKey);
    }
    setPopupAlert(null);
  };

  return {
    alertResult,
    popupAlert,
    dismissPopup,
    isLive,
  };
}
