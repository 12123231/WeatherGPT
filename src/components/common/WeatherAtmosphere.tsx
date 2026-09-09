import { useMemo } from 'react';
import { useWeatherContext } from '../../context/useWeatherContext';
import { getWeatherMood } from '../../utils/weatherMood';

/**
 * WeatherAtmosphere
 * 
 * Dynamic, performant ambient atmosphere background that shifts based on
 * the selected location's live weather mood (Clear, Cloudy, Rain, Storm, Snow, Fog, Dust, Night).
 * 
 * Subtle and high-contrast, ensuring all cards and typography stay crisp and readable.
 */
export default function WeatherAtmosphere() {
  const { currentWeather } = useWeatherContext();
  const mood = useMemo(() => getWeatherMood(currentWeather), [currentWeather]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Primary Dynamic Atmospheric Mood Gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: mood.gradient,
        }}
      />

      {/* Subtle Color Accent Wash */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-out"
        style={{
          backgroundColor: mood.accentOverlay,
        }}
      />

      {/* Subtle Top Atmosphere Glow Beam */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl opacity-20 transition-all duration-1000 ease-out pointer-events-none"
        style={{
          backgroundColor: mood.themeColor,
        }}
      />
    </div>
  );
}
