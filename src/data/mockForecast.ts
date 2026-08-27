import type { ForecastDay, HourlyForecast } from '../types/weather';

/**
 * Mock 7-day forecast data keyed by location ID.
 * Will be replaced by API calls when backend is connected.
 */
export const mockForecastData: Record<string, ForecastDay[]> = {
  'new-delhi': [
    { date: '2026-08-27', day: 'Today', high: 35, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 62, windSpeed: 14 },
    { date: '2026-08-28', day: 'Thu', high: 34, low: 26, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 65, humidity: 70, windSpeed: 16 },
    { date: '2026-08-29', day: 'Fri', high: 32, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 80, humidity: 78, windSpeed: 18 },
    { date: '2026-08-30', day: 'Sat', high: 33, low: 26, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 40, humidity: 68, windSpeed: 12 },
    { date: '2026-08-31', day: 'Sun', high: 35, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 15, humidity: 58, windSpeed: 10 },
    { date: '2026-09-01', day: 'Mon', high: 36, low: 28, condition: { main: 'Sunny', description: 'Clear sky', icon: 'sun' }, rainProbability: 5, humidity: 50, windSpeed: 8 },
    { date: '2026-09-02', day: 'Tue', high: 34, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 25, humidity: 60, windSpeed: 14 },
  ],
  'mumbai': [
    { date: '2026-08-27', day: 'Today', high: 30, low: 25, condition: { main: 'Heavy Rain', description: 'Heavy rain', icon: 'cloud-rain' }, rainProbability: 90, humidity: 88, windSpeed: 22 },
    { date: '2026-08-28', day: 'Thu', high: 29, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 85, humidity: 86, windSpeed: 20 },
    { date: '2026-08-29', day: 'Fri', high: 29, low: 24, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 82, windSpeed: 18 },
    { date: '2026-08-30', day: 'Sat', high: 30, low: 25, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 50, humidity: 78, windSpeed: 14 },
    { date: '2026-08-31', day: 'Sun', high: 31, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 35, humidity: 72, windSpeed: 12 },
    { date: '2026-09-01', day: 'Mon', high: 30, low: 25, condition: { main: 'Rain', description: 'Showers', icon: 'cloud-rain' }, rainProbability: 60, humidity: 80, windSpeed: 16 },
    { date: '2026-09-02', day: 'Tue', high: 29, low: 25, condition: { main: 'Heavy Rain', description: 'Heavy rain', icon: 'cloud-rain' }, rainProbability: 88, humidity: 90, windSpeed: 24 },
  ],
  'bengaluru': [
    { date: '2026-08-27', day: 'Today', high: 26, low: 19, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 45, humidity: 72, windSpeed: 10 },
    { date: '2026-08-28', day: 'Thu', high: 27, low: 20, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 55, humidity: 75, windSpeed: 12 },
    { date: '2026-08-29', day: 'Fri', high: 25, low: 19, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 80, windSpeed: 14 },
    { date: '2026-08-30', day: 'Sat', high: 26, low: 20, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 30, humidity: 68, windSpeed: 8 },
    { date: '2026-08-31', day: 'Sun', high: 27, low: 20, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 10, humidity: 60, windSpeed: 6 },
    { date: '2026-09-01', day: 'Mon', high: 26, low: 19, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 40, humidity: 70, windSpeed: 10 },
    { date: '2026-09-02', day: 'Tue', high: 25, low: 19, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 60, humidity: 76, windSpeed: 12 },
  ],
  'chennai': [
    { date: '2026-08-27', day: 'Today', high: 34, low: 27, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 5, humidity: 70, windSpeed: 16 },
    { date: '2026-08-28', day: 'Thu', high: 35, low: 28, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 5, humidity: 68, windSpeed: 14 },
    { date: '2026-08-29', day: 'Fri', high: 34, low: 27, condition: { main: 'Partly Cloudy', description: 'Hazy', icon: 'cloud-sun' }, rainProbability: 15, humidity: 72, windSpeed: 12 },
    { date: '2026-08-30', day: 'Sat', high: 33, low: 27, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 30, humidity: 75, windSpeed: 14 },
    { date: '2026-08-31', day: 'Sun', high: 34, low: 28, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 10, humidity: 65, windSpeed: 16 },
    { date: '2026-09-01', day: 'Mon', high: 35, low: 28, condition: { main: 'Sunny', description: 'Hot and clear', icon: 'sun' }, rainProbability: 5, humidity: 62, windSpeed: 18 },
    { date: '2026-09-02', day: 'Tue', high: 34, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 70, windSpeed: 14 },
  ],
  'kolkata': [
    { date: '2026-08-27', day: 'Today', high: 32, low: 26, condition: { main: 'Thunderstorm', description: 'Thunderstorm', icon: 'cloud-lightning' }, rainProbability: 75, humidity: 80, windSpeed: 20 },
    { date: '2026-08-28', day: 'Thu', high: 31, low: 26, condition: { main: 'Rain', description: 'Heavy rain', icon: 'cloud-rain' }, rainProbability: 80, humidity: 84, windSpeed: 22 },
    { date: '2026-08-29', day: 'Fri', high: 30, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 65, humidity: 80, windSpeed: 16 },
    { date: '2026-08-30', day: 'Sat', high: 31, low: 26, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 40, humidity: 74, windSpeed: 12 },
    { date: '2026-08-31', day: 'Sun', high: 32, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 25, humidity: 68, windSpeed: 10 },
    { date: '2026-09-01', day: 'Mon', high: 33, low: 27, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 10, humidity: 60, windSpeed: 8 },
    { date: '2026-09-02', day: 'Tue', high: 32, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 30, humidity: 66, windSpeed: 14 },
  ],
  'jaipur': [
    { date: '2026-08-27', day: 'Today', high: 40, low: 29, condition: { main: 'Hot', description: 'Extreme heat', icon: 'sun' }, rainProbability: 5, humidity: 35, windSpeed: 12 },
    { date: '2026-08-28', day: 'Thu', high: 39, low: 28, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 5, humidity: 38, windSpeed: 10 },
    { date: '2026-08-29', day: 'Fri', high: 38, low: 28, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 42, windSpeed: 14 },
    { date: '2026-08-30', day: 'Sat', high: 37, low: 27, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 35, humidity: 50, windSpeed: 16 },
    { date: '2026-08-31', day: 'Sun', high: 36, low: 27, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 55, humidity: 58, windSpeed: 14 },
    { date: '2026-09-01', day: 'Mon', high: 38, low: 28, condition: { main: 'Sunny', description: 'Clear', icon: 'sun' }, rainProbability: 10, humidity: 40, windSpeed: 10 },
    { date: '2026-09-02', day: 'Tue', high: 39, low: 29, condition: { main: 'Hot', description: 'Very hot', icon: 'sun' }, rainProbability: 5, humidity: 34, windSpeed: 12 },
  ],
};

// Default hourly forecast (used for all locations in MVP)
export const mockHourlyForecast: HourlyForecast[] = [
  { time: '9 AM', temperature: 30, condition: { main: 'Partly Cloudy', description: '', icon: 'cloud-sun' }, rainProbability: 10 },
  { time: '12 PM', temperature: 34, condition: { main: 'Sunny', description: '', icon: 'sun' }, rainProbability: 5 },
  { time: '3 PM', temperature: 35, condition: { main: 'Partly Cloudy', description: '', icon: 'cloud-sun' }, rainProbability: 20 },
  { time: '6 PM', temperature: 32, condition: { main: 'Cloudy', description: '', icon: 'cloud' }, rainProbability: 40 },
  { time: '9 PM', temperature: 29, condition: { main: 'Rain', description: '', icon: 'cloud-rain' }, rainProbability: 60 },
  { time: '12 AM', temperature: 27, condition: { main: 'Cloudy', description: '', icon: 'cloud' }, rainProbability: 30 },
];
