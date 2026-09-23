import type { CurrentWeather, ForecastDay, HourlyForecast } from '../types/weather';

/**
 * Mock 3-day forecast data keyed by location ID.
 */
export const mockForecastData: Record<string, ForecastDay[]> = {
  'new-delhi': [
    { date: '2026-08-27', day: 'Today', high: 35, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 62, windSpeed: 14 },
    { date: '2026-08-28', day: 'Thu', high: 34, low: 26, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 65, humidity: 70, windSpeed: 16 },
    { date: '2026-08-29', day: 'Fri', high: 32, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 80, humidity: 78, windSpeed: 18 },
  ],
  'mumbai': [
    { date: '2026-08-27', day: 'Today', high: 30, low: 25, condition: { main: 'Heavy Rain', description: 'Heavy rain', icon: 'cloud-rain' }, rainProbability: 90, humidity: 88, windSpeed: 22 },
    { date: '2026-08-28', day: 'Thu', high: 29, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 85, humidity: 86, windSpeed: 20 },
    { date: '2026-08-29', day: 'Fri', high: 29, low: 24, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 82, windSpeed: 18 },
  ],
  'bengaluru': [
    { date: '2026-08-27', day: 'Today', high: 26, low: 19, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 45, humidity: 72, windSpeed: 10 },
    { date: '2026-08-28', day: 'Thu', high: 27, low: 20, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 55, humidity: 75, windSpeed: 12 },
    { date: '2026-08-29', day: 'Fri', high: 25, low: 19, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 80, windSpeed: 14 },
  ],
  'chennai': [
    { date: '2026-08-27', day: 'Today', high: 34, low: 27, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 5, humidity: 70, windSpeed: 16 },
    { date: '2026-08-28', day: 'Thu', high: 35, low: 28, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 5, humidity: 68, windSpeed: 14 },
    { date: '2026-08-29', day: 'Fri', high: 34, low: 27, condition: { main: 'Partly Cloudy', description: 'Hazy', icon: 'cloud-sun' }, rainProbability: 15, humidity: 72, windSpeed: 12 },
  ],
  'kolkata': [
    { date: '2026-08-27', day: 'Today', high: 32, low: 26, condition: { main: 'Thunderstorm', description: 'Thunderstorm', icon: 'cloud-lightning' }, rainProbability: 75, humidity: 80, windSpeed: 20 },
    { date: '2026-08-28', day: 'Thu', high: 31, low: 26, condition: { main: 'Rain', description: 'Heavy rain', icon: 'cloud-rain' }, rainProbability: 80, humidity: 84, windSpeed: 22 },
    { date: '2026-08-29', day: 'Fri', high: 30, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 65, humidity: 80, windSpeed: 16 },
  ],
  'jaipur': [
    { date: '2026-08-27', day: 'Today', high: 40, low: 29, condition: { main: 'Hot', description: 'Extreme heat', icon: 'sun' }, rainProbability: 5, humidity: 35, windSpeed: 12 },
    { date: '2026-08-28', day: 'Thu', high: 39, low: 28, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 5, humidity: 38, windSpeed: 10 },
    { date: '2026-08-29', day: 'Fri', high: 38, low: 28, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 42, windSpeed: 14 },
  ],
};

import { resolveLocationTimezone, getBaseEpochForLocalHour, formatEpochToLocalHour } from '../utils/timezone';

/**
 * Dynamically generates 48 consecutive hours of forecast starting from the location's
 * current local hour, matching location timezone, time_epoch, and meteorological characteristics.
 */
export function generateMockHourlyForecast(
  locationId: string = 'new-delhi',
  explicitTimezone?: string,
  baseWeather?: CurrentWeather | null
): HourlyForecast[] {
  const timezone = resolveLocationTimezone(locationId, explicitTimezone || baseWeather?.timezone);
  const baseEpoch = getBaseEpochForLocalHour(timezone);
  const locKey = locationId.toLowerCase().replace(/\s+/g, '-');
  const forecastDays = mockForecastData[locKey] || mockForecastData['new-delhi'];
  const todayForecast = forecastDays?.[0];
  const tomorrowForecast = forecastDays?.[1] || todayForecast;

  const baseHigh = todayForecast ? todayForecast.high : (baseWeather ? baseWeather.temperature + 4 : 32);
  const baseLow = todayForecast ? todayForecast.low : (baseWeather ? baseWeather.temperature - 5 : 24);
  const baseTemp = baseWeather ? baseWeather.temperature : Math.round((baseHigh + baseLow) / 2);

  const locType = locKey.includes('mumbai')
    ? 'rainy'
    : locKey.includes('kolkata')
    ? 'stormy'
    : locKey.includes('chennai') || locKey.includes('jaipur')
    ? 'sunny'
    : locKey.includes('bengaluru')
    ? 'mild'
    : 'partly-cloudy';

  const hourly: HourlyForecast[] = [];

  for (let offset = 0; offset < 48; offset++) {
    const itemEpoch = baseEpoch + offset * 3600;
    const { hour, displayTime, dateStr: itemDateStr, isDaytime } = formatEpochToLocalHour(itemEpoch, timezone);
    const isNow = offset === 0;

    // Daily diurnal temperature curve: low at 5 AM, peak at 3 PM (15:00)
    const isNextDay = offset >= 24;
    const activeHigh = isNextDay ? (tomorrowForecast?.high ?? baseHigh) : baseHigh;
    const activeLow = isNextDay ? (tomorrowForecast?.low ?? baseLow) : baseLow;

    // Sinusoidal factor: 0 at 9 AM, 1 at 3 PM (15), 0 at 9 PM (21), -1 at 3 AM (03)
    const diurnalFactor = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    const midTemp = (activeHigh + activeLow) / 2;
    const tempAmp = (activeHigh - activeLow) / 2;

    let computedTemp = Math.round(midTemp + tempAmp * diurnalFactor);
    if (isNow && baseWeather) {
      computedTemp = Math.round(baseTemp);
    }

    // Condition, Icon & Rain Probability based on location profile and hour
    let icon = 'cloud-sun';
    let mainCondition = 'Partly Cloudy';
    let rainProb = 10;

    if (locType === 'rainy') {
      mainCondition = hour >= 13 && hour <= 19 ? 'Heavy Rain' : 'Rain';
      icon = 'cloud-rain';
      rainProb = hour >= 13 && hour <= 20 ? 85 : 65;
    } else if (locType === 'stormy') {
      if (hour >= 15 && hour <= 21) {
        mainCondition = 'Thunderstorm';
        icon = 'cloud-lightning';
        rainProb = 75;
      } else {
        mainCondition = 'Cloudy';
        icon = 'cloud';
        rainProb = 35;
      }
    } else if (locType === 'sunny') {
      if (isDaytime) {
        mainCondition = 'Sunny';
        icon = 'sun';
      } else {
        mainCondition = 'Clear';
        icon = 'moon';
      }
      rainProb = 5;
    } else if (locType === 'mild') {
      if (isDaytime) {
        mainCondition = hour >= 11 && hour <= 16 ? 'Partly Cloudy' : 'Cloudy';
        icon = hour >= 11 && hour <= 16 ? 'cloud-sun' : 'cloud';
      } else {
        mainCondition = 'Partly Cloudy';
        icon = 'moon';
      }
      rainProb = hour >= 14 && hour <= 19 ? 55 : 25;
    } else {
      // Default / partly cloudy
      if (isDaytime) {
        mainCondition = 'Partly Cloudy';
        icon = 'cloud-sun';
        rainProb = 20;
      } else {
        mainCondition = 'Clear';
        icon = 'moon';
        rainProb = 10;
      }
    }

    hourly.push({
      time: displayTime,
      time_epoch: itemEpoch,
      temperature: computedTemp,
      condition: {
        main: mainCondition,
        description: mainCondition,
        icon,
      },
      rainProbability: rainProb,
      hour,
      date: itemDateStr,
      isDay: isDaytime,
    });
  }

  return hourly;
}

// Fallback exported array for backwards compatibility
export const mockHourlyForecast: HourlyForecast[] = generateMockHourlyForecast('new-delhi');

