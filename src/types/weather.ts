export interface WeatherCondition {
  main: string;
  description: string;
  icon: string; // icon identifier for mapping to Lucide icons
}

export interface CurrentWeather {
  location: string;
  region: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  uvIndex: number;
  lastUpdated: string;
}

export interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  rainProbability: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface WeatherRisk {
  id: string;
  type: string;
  level: RiskLevel;
  title: string;
  description: string;
  icon: string;
  timePeriod: string;
  isActive: boolean;
}

export interface LocationData {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
