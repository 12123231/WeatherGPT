import type { WeatherRisk } from '../types/weather';

/**
 * Mock weather risk/alert data keyed by location ID.
 * Will be replaced by API calls when backend is connected.
 */
export const mockRisksData: Record<string, WeatherRisk[]> = {
  'new-delhi': [
    { id: 'r1', type: 'heat', level: 'high', title: 'Heat Advisory', description: 'Temperature expected to exceed 40°C. Stay hydrated and avoid prolonged outdoor exposure.', icon: 'thermometer', timePeriod: 'Today, 12 PM – 5 PM', isActive: true },
    { id: 'r2', type: 'rain', level: 'moderate', title: 'Rain Alert', description: 'Rain probability is increasing during the evening. Carry an umbrella.', icon: 'cloud-rain', timePeriod: 'Today, 6 PM – 11 PM', isActive: true },
    { id: 'r3', type: 'air-quality', level: 'moderate', title: 'Air Quality Warning', description: 'AQI levels are moderate. Sensitive groups should limit outdoor activity.', icon: 'wind', timePeriod: 'Next 24 hours', isActive: true },
    { id: 'r4', type: 'storm', level: 'low', title: 'Storm Watch', description: 'Low probability of isolated thunderstorms in the region.', icon: 'cloud-lightning', timePeriod: 'Tomorrow, 3 PM – 9 PM', isActive: false },
  ],
  'mumbai': [
    { id: 'r1', type: 'rain', level: 'severe', title: 'Heavy Rain Warning', description: 'Very heavy rainfall expected. Risk of waterlogging in low-lying areas.', icon: 'cloud-rain', timePeriod: 'Next 48 hours', isActive: true },
    { id: 'r2', type: 'flood', level: 'high', title: 'Flood Risk', description: 'High risk of urban flooding in low-lying areas due to continuous rainfall.', icon: 'waves', timePeriod: 'Today – Tomorrow', isActive: true },
    { id: 'r3', type: 'wind', level: 'moderate', title: 'Strong Wind Alert', description: 'Wind gusts up to 50 km/h expected along the coast.', icon: 'wind', timePeriod: 'Today evening', isActive: true },
  ],
  'bengaluru': [
    { id: 'r1', type: 'rain', level: 'moderate', title: 'Rain Alert', description: 'Moderate rainfall expected in the afternoon and evening.', icon: 'cloud-rain', timePeriod: 'Today, 2 PM – 8 PM', isActive: true },
    { id: 'r2', type: 'traffic', level: 'low', title: 'Traffic Advisory', description: 'Rain may cause traffic delays in key areas.', icon: 'alert-triangle', timePeriod: 'Today evening', isActive: false },
  ],
  'chennai': [
    { id: 'r1', type: 'heat', level: 'high', title: 'Heat Warning', description: 'Extreme heat expected. UV index very high. Avoid direct sun exposure.', icon: 'thermometer', timePeriod: 'Today, 11 AM – 4 PM', isActive: true },
    { id: 'r2', type: 'humidity', level: 'moderate', title: 'High Humidity', description: 'Humidity levels above 80%. Heat discomfort likely.', icon: 'droplets', timePeriod: 'All day', isActive: true },
  ],
  'kolkata': [
    { id: 'r1', type: 'storm', level: 'high', title: 'Thunderstorm Warning', description: 'Severe thunderstorms with lightning expected. Stay indoors.', icon: 'cloud-lightning', timePeriod: 'Today, 4 PM – 10 PM', isActive: true },
    { id: 'r2', type: 'rain', level: 'high', title: 'Heavy Rain Alert', description: 'Heavy rainfall may cause waterlogging in several areas.', icon: 'cloud-rain', timePeriod: 'Next 24 hours', isActive: true },
    { id: 'r3', type: 'wind', level: 'moderate', title: 'Wind Advisory', description: 'Strong winds up to 45 km/h during thunderstorms.', icon: 'wind', timePeriod: 'Today evening', isActive: true },
  ],
  'jaipur': [
    { id: 'r1', type: 'heat', level: 'severe', title: 'Extreme Heat Alert', description: 'Temperature may exceed 42°C. Heatstroke risk is very high.', icon: 'thermometer', timePeriod: 'Today – Tomorrow', isActive: true },
    { id: 'r2', type: 'uv', level: 'high', title: 'UV Radiation Alert', description: 'UV index extremely high. Use sun protection.', icon: 'sun', timePeriod: 'Today, 10 AM – 4 PM', isActive: true },
  ],
};
