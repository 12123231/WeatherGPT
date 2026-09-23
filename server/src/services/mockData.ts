import type { LocationData, CurrentWeather, ForecastDay, HourlyForecast, WeatherRisk } from '../types/index.js';

export const mockLocations: LocationData[] = [
  { id: 'new-delhi', name: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209 },
  { id: 'mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.076, lon: 72.8777 },
  { id: 'bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  { id: 'chennai', name: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  { id: 'kolkata', name: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  { id: 'jaipur', name: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
  { id: 'patna', name: 'Patna', region: 'Bihar', country: 'India', lat: 25.5941, lon: 85.1376 },
  { id: 'chandigarh', name: 'Chandigarh', region: 'Chandigarh', country: 'India', lat: 30.7333, lon: 76.7794 },
  { id: 'indore', name: 'Indore', region: 'Madhya Pradesh', country: 'India', lat: 22.7196, lon: 75.8577 },
  { id: 'hyderabad', name: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.385, lon: 78.4867 },
  { id: 'pune', name: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  { id: 'lucknow', name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462 },
  { id: 'ahmedabad', name: 'Ahmedabad', region: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714 },
  { id: 'bhopal', name: 'Bhopal', region: 'Madhya Pradesh', country: 'India', lat: 23.2599, lon: 77.4126 },
  { id: 'shimla', name: 'Shimla', region: 'Himachal Pradesh', country: 'India', lat: 31.1048, lon: 77.1734 },
  { id: 'goa', name: 'Goa', region: 'Goa', country: 'India', lat: 15.2993, lon: 74.124 },
  { id: 'surat', name: 'Surat', region: 'Gujarat', country: 'India', lat: 21.1702, lon: 72.8311 },
  { id: 'varanasi', name: 'Varanasi', region: 'Uttar Pradesh', country: 'India', lat: 25.3176, lon: 82.9739 },
  { id: 'agra', name: 'Agra', region: 'Uttar Pradesh', country: 'India', lat: 27.1767, lon: 78.0081 },
  { id: 'nagpur', name: 'Nagpur', region: 'Maharashtra', country: 'India', lat: 21.1458, lon: 79.0882 },
  { id: 'kanpur', name: 'Kanpur', region: 'Uttar Pradesh', country: 'India', lat: 26.4499, lon: 80.3319 },
];

export const mockWeatherData: Record<string, CurrentWeather> = {
  'new-delhi': {
    location: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    temperature: 34,
    feelsLike: 38,
    condition: { main: 'Partly Cloudy', description: 'Partly cloudy with haze', icon: 'cloud-sun' },
    humidity: 62,
    windSpeed: 14,
    windDirection: 'SW',
    visibility: 6,
    pressure: 1006,
    uvIndex: 8,
    lastUpdated: new Date().toISOString(),
  },
  'mumbai': {
    location: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    temperature: 29,
    feelsLike: 34,
    condition: { main: 'Heavy Rain', description: 'Heavy rainfall expected', icon: 'cloud-rain' },
    humidity: 88,
    windSpeed: 22,
    windDirection: 'W',
    visibility: 3,
    pressure: 1004,
    uvIndex: 3,
    lastUpdated: new Date().toISOString(),
  },
  'bengaluru': {
    location: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    temperature: 24,
    feelsLike: 25,
    condition: { main: 'Cloudy', description: 'Overcast skies', icon: 'cloud' },
    humidity: 72,
    windSpeed: 10,
    windDirection: 'E',
    visibility: 8,
    pressure: 1012,
    uvIndex: 4,
    lastUpdated: new Date().toISOString(),
  },
  'chennai': {
    location: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    temperature: 33,
    feelsLike: 39,
    condition: { main: 'Sunny', description: 'Clear and sunny', icon: 'sun' },
    humidity: 70,
    windSpeed: 16,
    windDirection: 'SE',
    visibility: 10,
    pressure: 1008,
    uvIndex: 9,
    lastUpdated: new Date().toISOString(),
  },
  'kolkata': {
    location: 'Kolkata',
    region: 'West Bengal',
    country: 'India',
    temperature: 31,
    feelsLike: 36,
    condition: { main: 'Thunderstorm', description: 'Thunderstorm expected', icon: 'cloud-lightning' },
    humidity: 80,
    windSpeed: 20,
    windDirection: 'S',
    visibility: 5,
    pressure: 1003,
    uvIndex: 5,
    lastUpdated: new Date().toISOString(),
  },
  'jaipur': {
    location: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    temperature: 38,
    feelsLike: 42,
    condition: { main: 'Hot', description: 'Extreme heat', icon: 'sun' },
    humidity: 35,
    windSpeed: 12,
    windDirection: 'NW',
    visibility: 12,
    pressure: 1005,
    uvIndex: 11,
    lastUpdated: new Date().toISOString(),
  },
  'patna': {
    location: 'Patna',
    region: 'Bihar',
    country: 'India',
    temperature: 33,
    feelsLike: 37,
    condition: { main: 'Partly Cloudy', description: 'Partly cloudy with humidity', icon: 'cloud-sun' },
    humidity: 72,
    windSpeed: 10,
    windDirection: 'E',
    visibility: 7,
    pressure: 1008,
    uvIndex: 7,
    lastUpdated: new Date().toISOString(),
  },
  'chandigarh': {
    location: 'Chandigarh',
    region: 'Chandigarh',
    country: 'India',
    temperature: 30,
    feelsLike: 33,
    condition: { main: 'Partly Cloudy', description: 'Partly cloudy skies', icon: 'cloud-sun' },
    humidity: 60,
    windSpeed: 14,
    windDirection: 'NW',
    visibility: 10,
    pressure: 1010,
    uvIndex: 7,
    lastUpdated: new Date().toISOString(),
  },
  'indore': {
    location: 'Indore',
    region: 'Madhya Pradesh',
    country: 'India',
    temperature: 29,
    feelsLike: 32,
    condition: { main: 'Cloudy', description: 'Overcast with light breeze', icon: 'cloud' },
    humidity: 68,
    windSpeed: 12,
    windDirection: 'SW',
    visibility: 9,
    pressure: 1009,
    uvIndex: 6,
    lastUpdated: new Date().toISOString(),
  },
  'hyderabad': {
    location: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    temperature: 31,
    feelsLike: 35,
    condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' },
    humidity: 65,
    windSpeed: 13,
    windDirection: 'SE',
    visibility: 8,
    pressure: 1007,
    uvIndex: 8,
    lastUpdated: new Date().toISOString(),
  },
  'pune': {
    location: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    temperature: 27,
    feelsLike: 29,
    condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' },
    humidity: 74,
    windSpeed: 11,
    windDirection: 'W',
    visibility: 7,
    pressure: 1011,
    uvIndex: 5,
    lastUpdated: new Date().toISOString(),
  },
  'lucknow': {
    location: 'Lucknow',
    region: 'Uttar Pradesh',
    country: 'India',
    temperature: 34,
    feelsLike: 38,
    condition: { main: 'Hazy', description: 'Hazy and humid', icon: 'cloud-sun' },
    humidity: 66,
    windSpeed: 9,
    windDirection: 'E',
    visibility: 6,
    pressure: 1006,
    uvIndex: 8,
    lastUpdated: new Date().toISOString(),
  },
  'ahmedabad': {
    location: 'Ahmedabad',
    region: 'Gujarat',
    country: 'India',
    temperature: 36,
    feelsLike: 40,
    condition: { main: 'Hot', description: 'Hot and dry', icon: 'sun' },
    humidity: 38,
    windSpeed: 15,
    windDirection: 'W',
    visibility: 11,
    pressure: 1006,
    uvIndex: 10,
    lastUpdated: new Date().toISOString(),
  },
  'bhopal': {
    location: 'Bhopal',
    region: 'Madhya Pradesh',
    country: 'India',
    temperature: 30,
    feelsLike: 33,
    condition: { main: 'Cloudy', description: 'Cloudy with chance of rain', icon: 'cloud' },
    humidity: 70,
    windSpeed: 11,
    windDirection: 'SW',
    visibility: 8,
    pressure: 1009,
    uvIndex: 6,
    lastUpdated: new Date().toISOString(),
  },
  'shimla': {
    location: 'Shimla',
    region: 'Himachal Pradesh',
    country: 'India',
    temperature: 18,
    feelsLike: 15,
    condition: { main: 'Cloudy', description: 'Cool and cloudy', icon: 'cloud' },
    humidity: 78,
    windSpeed: 10,
    windDirection: 'N',
    visibility: 6,
    pressure: 900,
    uvIndex: 4,
    lastUpdated: new Date().toISOString(),
  },
  'goa': {
    location: 'Goa',
    region: 'Goa',
    country: 'India',
    temperature: 28,
    feelsLike: 32,
    condition: { main: 'Rain', description: 'Monsoon showers', icon: 'cloud-rain' },
    humidity: 88,
    windSpeed: 18,
    windDirection: 'W',
    visibility: 5,
    pressure: 1005,
    uvIndex: 4,
    lastUpdated: new Date().toISOString(),
  },
  'surat': {
    location: 'Surat',
    region: 'Gujarat',
    country: 'India',
    temperature: 30,
    feelsLike: 34,
    condition: { main: 'Partly Cloudy', description: 'Partly cloudy with humidity', icon: 'cloud-sun' },
    humidity: 72,
    windSpeed: 16,
    windDirection: 'SW',
    visibility: 8,
    pressure: 1006,
    uvIndex: 7,
    lastUpdated: new Date().toISOString(),
  },
  'varanasi': {
    location: 'Varanasi',
    region: 'Uttar Pradesh',
    country: 'India',
    temperature: 33,
    feelsLike: 37,
    condition: { main: 'Hazy', description: 'Hazy and hot', icon: 'cloud-sun' },
    humidity: 68,
    windSpeed: 8,
    windDirection: 'E',
    visibility: 6,
    pressure: 1007,
    uvIndex: 8,
    lastUpdated: new Date().toISOString(),
  },
  'agra': {
    location: 'Agra',
    region: 'Uttar Pradesh',
    country: 'India',
    temperature: 35,
    feelsLike: 39,
    condition: { main: 'Hot', description: 'Hot and sunny', icon: 'sun' },
    humidity: 40,
    windSpeed: 10,
    windDirection: 'NW',
    visibility: 9,
    pressure: 1005,
    uvIndex: 10,
    lastUpdated: new Date().toISOString(),
  },
  'nagpur': {
    location: 'Nagpur',
    region: 'Maharashtra',
    country: 'India',
    temperature: 32,
    feelsLike: 36,
    condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' },
    humidity: 62,
    windSpeed: 12,
    windDirection: 'S',
    visibility: 9,
    pressure: 1008,
    uvIndex: 8,
    lastUpdated: new Date().toISOString(),
  },
  'kanpur': {
    location: 'Kanpur',
    region: 'Uttar Pradesh',
    country: 'India',
    temperature: 34,
    feelsLike: 38,
    condition: { main: 'Hot', description: 'Hot and dry', icon: 'sun' },
    humidity: 45,
    windSpeed: 10,
    windDirection: 'NW',
    visibility: 8,
    pressure: 1006,
    uvIndex: 9,
    lastUpdated: new Date().toISOString(),
  },
};

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
  'patna': [
    { date: '2026-08-27', day: 'Today', high: 34, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy and humid', icon: 'cloud-sun' }, rainProbability: 30, humidity: 72, windSpeed: 10 },
    { date: '2026-08-28', day: 'Thu', high: 33, low: 26, condition: { main: 'Rain', description: 'Light rain showers', icon: 'cloud-rain' }, rainProbability: 60, humidity: 78, windSpeed: 12 },
    { date: '2026-08-29', day: 'Fri', high: 32, low: 25, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 80, windSpeed: 14 },
  ],
  'chandigarh': [
    { date: '2026-08-27', day: 'Today', high: 32, low: 23, condition: { main: 'Partly Cloudy', description: 'Partly cloudy skies', icon: 'cloud-sun' }, rainProbability: 20, humidity: 60, windSpeed: 14 },
    { date: '2026-08-28', day: 'Thu', high: 31, low: 22, condition: { main: 'Cloudy', description: 'Overcast skies', icon: 'cloud' }, rainProbability: 40, humidity: 65, windSpeed: 16 },
    { date: '2026-08-29', day: 'Fri', high: 29, low: 21, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 60, humidity: 70, windSpeed: 14 },
  ],
  'indore': [
    { date: '2026-08-27', day: 'Today', high: 30, low: 22, condition: { main: 'Cloudy', description: 'Overcast with breeze', icon: 'cloud' }, rainProbability: 40, humidity: 68, windSpeed: 12 },
    { date: '2026-08-28', day: 'Thu', high: 29, low: 21, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 60, humidity: 74, windSpeed: 14 },
    { date: '2026-08-29', day: 'Fri', high: 28, low: 20, condition: { main: 'Rain', description: 'Moderate showers', icon: 'cloud-rain' }, rainProbability: 70, humidity: 78, windSpeed: 12 },
  ],
  'hyderabad': [
    { date: '2026-08-27', day: 'Today', high: 32, low: 24, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 30, humidity: 65, windSpeed: 13 },
    { date: '2026-08-28', day: 'Thu', high: 31, low: 23, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 55, humidity: 70, windSpeed: 15 },
    { date: '2026-08-29', day: 'Fri', high: 30, low: 23, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 65, humidity: 74, windSpeed: 14 },
  ],
  'pune': [
    { date: '2026-08-27', day: 'Today', high: 28, low: 21, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 60, humidity: 74, windSpeed: 11 },
    { date: '2026-08-28', day: 'Thu', high: 27, low: 20, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 78, windSpeed: 12 },
    { date: '2026-08-29', day: 'Fri', high: 27, low: 20, condition: { main: 'Cloudy', description: 'Cloudy skies', icon: 'cloud' }, rainProbability: 45, humidity: 72, windSpeed: 10 },
  ],
  'lucknow': [
    { date: '2026-08-27', day: 'Today', high: 35, low: 27, condition: { main: 'Hazy', description: 'Hazy and humid', icon: 'cloud-sun' }, rainProbability: 25, humidity: 66, windSpeed: 9 },
    { date: '2026-08-28', day: 'Thu', high: 34, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 35, humidity: 68, windSpeed: 10 },
    { date: '2026-08-29', day: 'Fri', high: 33, low: 26, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 55, humidity: 72, windSpeed: 12 },
  ],
  'ahmedabad': [
    { date: '2026-08-27', day: 'Today', high: 37, low: 28, condition: { main: 'Hot', description: 'Hot and dry', icon: 'sun' }, rainProbability: 5, humidity: 38, windSpeed: 15 },
    { date: '2026-08-28', day: 'Thu', high: 36, low: 27, condition: { main: 'Sunny', description: 'Clear skies', icon: 'sun' }, rainProbability: 5, humidity: 40, windSpeed: 14 },
    { date: '2026-08-29', day: 'Fri', high: 35, low: 27, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 15, humidity: 44, windSpeed: 13 },
  ],
  'bhopal': [
    { date: '2026-08-27', day: 'Today', high: 31, low: 23, condition: { main: 'Cloudy', description: 'Cloudy skies', icon: 'cloud' }, rainProbability: 45, humidity: 70, windSpeed: 11 },
    { date: '2026-08-28', day: 'Thu', high: 30, low: 22, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 60, humidity: 74, windSpeed: 12 },
    { date: '2026-08-29', day: 'Fri', high: 29, low: 22, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 70, humidity: 76, windSpeed: 13 },
  ],
  'shimla': [
    { date: '2026-08-27', day: 'Today', high: 20, low: 13, condition: { main: 'Cloudy', description: 'Cool and cloudy', icon: 'cloud' }, rainProbability: 50, humidity: 78, windSpeed: 10 },
    { date: '2026-08-28', day: 'Thu', high: 18, low: 12, condition: { main: 'Rain', description: 'Light drizzle', icon: 'cloud-rain' }, rainProbability: 65, humidity: 82, windSpeed: 12 },
    { date: '2026-08-29', day: 'Fri', high: 19, low: 13, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 35, humidity: 74, windSpeed: 10 },
  ],
  'goa': [
    { date: '2026-08-27', day: 'Today', high: 29, low: 24, condition: { main: 'Rain', description: 'Heavy monsoon showers', icon: 'cloud-rain' }, rainProbability: 85, humidity: 88, windSpeed: 18 },
    { date: '2026-08-28', day: 'Thu', high: 28, low: 24, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 80, humidity: 86, windSpeed: 16 },
    { date: '2026-08-29', day: 'Fri', high: 29, low: 24, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 70, humidity: 84, windSpeed: 14 },
  ],
  'surat': [
    { date: '2026-08-27', day: 'Today', high: 31, low: 25, condition: { main: 'Partly Cloudy', description: 'Partly cloudy and humid', icon: 'cloud-sun' }, rainProbability: 35, humidity: 72, windSpeed: 16 },
    { date: '2026-08-28', day: 'Thu', high: 30, low: 25, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 55, humidity: 76, windSpeed: 14 },
    { date: '2026-08-29', day: 'Fri', high: 30, low: 24, condition: { main: 'Cloudy', description: 'Overcast', icon: 'cloud' }, rainProbability: 40, humidity: 74, windSpeed: 12 },
  ],
  'varanasi': [
    { date: '2026-08-27', day: 'Today', high: 34, low: 26, condition: { main: 'Hazy', description: 'Hazy skies', icon: 'cloud-sun' }, rainProbability: 20, humidity: 68, windSpeed: 8 },
    { date: '2026-08-28', day: 'Thu', high: 33, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 30, humidity: 70, windSpeed: 9 },
    { date: '2026-08-29', day: 'Fri', high: 32, low: 25, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 55, humidity: 74, windSpeed: 11 },
  ],
  'agra': [
    { date: '2026-08-27', day: 'Today', high: 36, low: 27, condition: { main: 'Hot', description: 'Hot and sunny', icon: 'sun' }, rainProbability: 10, humidity: 40, windSpeed: 10 },
    { date: '2026-08-28', day: 'Thu', high: 35, low: 26, condition: { main: 'Sunny', description: 'Clear skies', icon: 'sun' }, rainProbability: 10, humidity: 42, windSpeed: 9 },
    { date: '2026-08-29', day: 'Fri', high: 34, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 46, windSpeed: 11 },
  ],
  'nagpur': [
    { date: '2026-08-27', day: 'Today', high: 33, low: 24, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 30, humidity: 62, windSpeed: 12 },
    { date: '2026-08-28', day: 'Thu', high: 32, low: 24, condition: { main: 'Rain', description: 'Light showers', icon: 'cloud-rain' }, rainProbability: 55, humidity: 68, windSpeed: 13 },
    { date: '2026-08-29', day: 'Fri', high: 31, low: 23, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, rainProbability: 65, humidity: 72, windSpeed: 14 },
  ],
  'kanpur': [
    { date: '2026-08-27', day: 'Today', high: 35, low: 27, condition: { main: 'Hot', description: 'Hot and dry', icon: 'sun' }, rainProbability: 10, humidity: 45, windSpeed: 10 },
    { date: '2026-08-28', day: 'Thu', high: 34, low: 26, condition: { main: 'Partly Cloudy', description: 'Partly cloudy', icon: 'cloud-sun' }, rainProbability: 20, humidity: 48, windSpeed: 11 },
    { date: '2026-08-29', day: 'Fri', high: 33, low: 25, condition: { main: 'Rain', description: 'Light rain', icon: 'cloud-rain' }, rainProbability: 45, humidity: 54, windSpeed: 12 },
  ],
};

const LOCATION_TIMEZONE_MAP: Record<string, string> = {
  'new-delhi': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'mumbai': 'Asia/Kolkata',
  'bengaluru': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'chennai': 'Asia/Kolkata',
  'madras': 'Asia/Kolkata',
  'kolkata': 'Asia/Kolkata',
  'calcutta': 'Asia/Kolkata',
  'jaipur': 'Asia/Kolkata',
  'pune': 'Asia/Kolkata',
  'hyderabad': 'Asia/Kolkata',
  'ahmedabad': 'Asia/Kolkata',
  'london': 'Europe/London',
  'new-york': 'America/New_York',
  'new york': 'America/New_York',
  'tokyo': 'Asia/Tokyo',
  'paris': 'Europe/Paris',
  'dubai': 'Asia/Dubai',
  'singapore': 'Asia/Singapore',
  'sydney': 'Australia/Sydney',
};

function resolveTimezone(locationId?: string): string {
  if (!locationId) return 'Asia/Kolkata';
  const clean = locationId.toLowerCase().trim().replace(/\s+/g, '-');
  return LOCATION_TIMEZONE_MAP[clean] || LOCATION_TIMEZONE_MAP[locationId.toLowerCase().trim()] || 'Asia/Kolkata';
}

function formatHour(hour: number, isNow: boolean): string {
  if (isNow) return 'Now';
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

function getBaseEpoch(timezone: string = 'Asia/Kolkata'): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      minute: 'numeric',
      second: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
    return Math.floor(now.getTime() / 1000) - (minute * 60 + second);
  } catch {
    const epochSec = Math.floor(Date.now() / 1000);
    return epochSec - (epochSec % 3600);
  }
}

export function generateMockHourlyForecast(
  locationId: string = 'new-delhi',
  explicitTimezone?: string,
  baseWeather?: CurrentWeather | null
): HourlyForecast[] {
  const timezone = explicitTimezone || resolveTimezone(locationId);
  const baseEpoch = getBaseEpoch(timezone);
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
    const d = new Date(itemEpoch * 1000);
    let hour = 0;
    let itemDateStr = '';
    let timeLabel = '';
    try {
      hour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }).format(d), 10) % 24;
      itemDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
      timeLabel = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: true }).format(d);
    } catch {
      hour = (d.getHours() + offset) % 24;
      itemDateStr = d.toISOString().split('T')[0];
      timeLabel = formatHour(hour, offset === 0);
    }

    const isDay = hour >= 6 && hour < 19;
    const isNow = offset === 0;

    const isNextDay = offset >= 24;
    const activeHigh = isNextDay ? (tomorrowForecast?.high ?? baseHigh) : baseHigh;
    const activeLow = isNextDay ? (tomorrowForecast?.low ?? baseLow) : baseLow;

    const diurnalFactor = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    const midTemp = (activeHigh + activeLow) / 2;
    const tempAmp = (activeHigh - activeLow) / 2;

    let computedTemp = Math.round(midTemp + tempAmp * diurnalFactor);
    if (isNow && baseWeather) {
      computedTemp = Math.round(baseTemp);
    }

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
      if (isDay) {
        mainCondition = 'Sunny';
        icon = 'sun';
      } else {
        mainCondition = 'Clear';
        icon = 'moon';
      }
      rainProb = 5;
    } else if (locType === 'mild') {
      if (isDay) {
        mainCondition = hour >= 11 && hour <= 16 ? 'Partly Cloudy' : 'Cloudy';
        icon = hour >= 11 && hour <= 16 ? 'cloud-sun' : 'cloud';
      } else {
        mainCondition = 'Partly Cloudy';
        icon = 'moon';
      }
      rainProb = hour >= 14 && hour <= 19 ? 55 : 25;
    } else {
      if (isDay) {
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
      time: timeLabel,
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
      isDay,
    });
  }

  return hourly;
}

export const mockHourlyForecast: HourlyForecast[] = generateMockHourlyForecast('new-delhi');

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
