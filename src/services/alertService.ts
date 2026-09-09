import type { CurrentWeather, HourlyForecast, ForecastDay } from '../types/weather';

export type AlertSeverity = 'green' | 'orange' | 'red';

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  type: string;
  title: string;
  message: string;
  location: string;
  timePeriod?: string;
  priority: number; // 1 = highest (RED), 2 = medium (ORANGE), 3 = lowest (GREEN)
  reason: string;
}

export interface AlertEngineResult {
  alerts: WeatherAlert[];
  overallSeverity: AlertSeverity;
  location: string;
  dataAvailable: boolean;
}

/**
 * Pure TypeScript Alert Evaluation Engine.
 * Does NOT contain any React or UI dependencies.
 * Evaluates live weather telemetry against deterministic meteorological criteria.
 * 
 * Rules:
 * A. GREEN: Normal status, no significant conditions. "No significant weather alerts".
 * B. RAIN SOON (ORANGE): Next 6 hrs, rainProbability >= 60% AND precipitation > 0.
 *    Consolidated into a single time range.
 * C. HEAVY RAIN (RED): Next 6 hrs, rainProbability >= 70% AND precipitation >= 10 mm/h.
 * D. HIGH TEMPERATURE:
 *    - Forecast high >= 45�C: RED ("Extreme temperature")
 *    - Forecast high >= 40�C: ORANGE ("High temperature")
 * E. STRONG WIND (ORANGE): Current/gust wind >= 40 km/h or gust >= 50 km/h.
 * F. SEVERE WEATHER CONDITION (RED): Genuinely severe conditions from provider (thunderstorm, storm, blizzard, etc.).
 * 
 * Max 2 alerts returned, ordered by severity (RED > ORANGE > GREEN) then occurrence timing.
 */
export function evaluateAlerts(
  locationName: string,
  currentWeather: CurrentWeather | null,
  hourlyForecast: HourlyForecast[],
  forecast: ForecastDay[],
  isLive: boolean,
): AlertEngineResult {
  // If live data retrieval failed or is fallback, return unavailable state
  if (!currentWeather || !isLive) {
    return {
      alerts: [],
      overallSeverity: 'green',
      location: locationName,
      dataAvailable: false,
    };
  }

  const generatedAlerts: WeatherAlert[] = [];
  const targetLocation = currentWeather.location || locationName;

  // ----------------------------------------------------
  // F. SEVERE WEATHER CONDITION � RED
  // ----------------------------------------------------
  const conditionText = (currentWeather.condition?.main || '').toLowerCase();
  const conditionDesc = (currentWeather.condition?.description || '').toLowerCase();
  const fullCondition = `${conditionText} ${conditionDesc}`;

  const SEVERE_KEYWORDS = [
    'thunderstorm',
    'severe thunderstorm',
    'cyclone',
    'tornado',
    'hurricane',
    'blizzard',
    'duststorm',
    'sandstorm',
    'dust storm',
    'sand storm',
    'heavy snow',
    'ice storm',
    'freezing rain',
    'torrential rain',
  ];

  const matchedSevere = SEVERE_KEYWORDS.find((keyword) => fullCondition.includes(keyword));
  if (matchedSevere) {
    generatedAlerts.push({
      id: `severe-condition-${targetLocation.toLowerCase().replace(/\s+/g, '-')}`,
      severity: 'red',
      type: 'severe-condition',
      title: 'Severe weather condition',
      message: `${currentWeather.condition.main} currently detected in ${targetLocation}. Exercise caution and stay indoors if necessary.`,
      location: targetLocation,
      timePeriod: 'Currently active',
      priority: 1,
      reason: 'severe-condition',
    });
  }

  // ----------------------------------------------------
  // C & B: HOURLY FORECAST (Next 6 Hours Window)
  // ----------------------------------------------------
  // Note: hourlyForecast[0] is often "Now" or current hour. Next 6 hours = slice(0, 7)
  const next6Hours = (hourlyForecast || []).slice(0, 7);

  // Heavy Rain Check (RED): rainProbability >= 70% AND precipitation >= 10 mm
  const heavyRainHours = next6Hours.filter((h) => {
    const prob = h.rainProbability ?? 0;
    const precip = h.precipitation ?? 0;
    return prob >= 70 && precip >= 10;
  });

  if (heavyRainHours.length > 0) {
    const firstH = heavyRainHours[0];
    const lastH = heavyRainHours[heavyRainHours.length - 1];
    const timeWindow = firstH.time === lastH.time ? firstH.time : `${firstH.time} � ${lastH.time}`;

    generatedAlerts.push({
      id: `heavy-rain-${targetLocation.toLowerCase().replace(/\s+/g, '-')}`,
      severity: 'red',
      type: 'heavy-rain',
      title: 'Heavy rainfall possible',
      message: `Significant rainfall is expected in ${targetLocation} within the next few hours.`,
      location: targetLocation,
      timePeriod: timeWindow,
      priority: 1,
      reason: 'heavy-rain',
    });
  }

  // Rain Soon Check (ORANGE): rainProbability >= 60% AND precipitation > 0
  // Skip if Heavy Rain already captured this event
  const hasHeavyRain = generatedAlerts.some((a) => a.reason === 'heavy-rain');
  if (!hasHeavyRain) {
    const rainyHours = next6Hours.filter((h) => {
      const prob = h.rainProbability ?? 0;
      const precip = h.precipitation ?? 0;
      return prob >= 60 && precip > 0;
    });

    if (rainyHours.length > 0) {
      const firstH = rainyHours[0];
      const lastH = rainyHours[rainyHours.length - 1];
      const timeWindow = firstH.time === lastH.time ? firstH.time : `${firstH.time} � ${lastH.time}`;

      generatedAlerts.push({
        id: `rain-soon-${targetLocation.toLowerCase().replace(/\s+/g, '-')}`,
        severity: 'orange',
        type: 'rain-soon',
        title: 'Rain expected soon',
        message: `Rain is likely in ${targetLocation} between ${timeWindow}.`,
        location: targetLocation,
        timePeriod: timeWindow,
        priority: 2,
        reason: 'rain-soon',
      });
    }
  }

  // ----------------------------------------------------
  // D. TEMPERATURE ADVISORIES (HIGH / EXTREME)
  // ----------------------------------------------------
  // Use today's forecast high if available, or current temp
  const todayForecast = forecast && forecast.length > 0 ? forecast[0] : null;
  const maxTemp = todayForecast?.high ?? currentWeather.temperature;

  if (maxTemp >= 45) {
    generatedAlerts.push({
      id: `extreme-temp-${targetLocation.toLowerCase().replace(/\s+/g, '-')}`,
      severity: 'red',
      type: 'extreme-temperature',
      title: 'Extreme temperature',
      message: `Temperatures may reach ${maxTemp}�C in ${targetLocation} today. Stay hydrated and avoid sun exposure.`,
      location: targetLocation,
      timePeriod: 'Today',
      priority: 1,
      reason: 'extreme-temperature',
    });
  } else if (maxTemp >= 40) {
    generatedAlerts.push({
      id: `high-temp-${targetLocation.toLowerCase().replace(/\s+/g, '-')}`,
      severity: 'orange',
      type: 'high-temperature',
      title: 'High temperature',
      message: `Temperatures may reach ${maxTemp}�C in ${targetLocation} today.`,
      location: targetLocation,
      timePeriod: 'Today',
      priority: 2,
      reason: 'high-temperature',
    });
  }

  // ----------------------------------------------------
  // E. STRONG WIND � ORANGE
  // ----------------------------------------------------
  const windSpeed = currentWeather.windSpeed ?? 0;
  const gustSpeed = currentWeather.gust ?? 0;

  if (windSpeed >= 40 || gustSpeed >= 50) {
    const windDetail = gustSpeed >= 50
      ? `Gusts up to ${gustSpeed} km/h detected.`
      : `Sustained winds of ${windSpeed} km/h detected.`;

    generatedAlerts.push({
      id: `strong-wind-${targetLocation.toLowerCase().replace(/\s+/g, '-')}`,
      severity: 'orange',
      type: 'strong-wind',
      title: 'Strong winds possible',
      message: `Strong winds are expected in ${targetLocation}. ${windDetail}`,
      location: targetLocation,
      timePeriod: 'Current',
      priority: 2,
      reason: 'strong-wind',
    });
  }

  // ----------------------------------------------------
  // DEDUPLICATION & RANKING
  // ----------------------------------------------------
  // Sort priority: RED (1) > ORANGE (2) > GREEN (3)
  // For same priority, keep earlier alert
  generatedAlerts.sort((a, b) => a.priority - b.priority);

  // Maximum 2 alerts
  const finalAlerts = generatedAlerts.slice(0, 2);

  const overallSeverity: AlertSeverity = finalAlerts.some((a) => a.severity === 'red')
    ? 'red'
    : finalAlerts.some((a) => a.severity === 'orange')
    ? 'orange'
    : 'green';

  return {
    alerts: finalAlerts,
    overallSeverity,
    location: targetLocation,
    dataAvailable: true,
  };
}
