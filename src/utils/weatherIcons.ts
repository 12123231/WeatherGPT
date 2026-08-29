import React from 'react';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudSun, CloudSnow, CloudDrizzle,
  Thermometer, Wind, Droplets, Eye, Gauge, SunDim, AlertTriangle, Waves,
  type LucideIcon,
} from 'lucide-react';

/**
 * Centralized mapping from weather icon string identifiers (used in mock data)
 * to Lucide React icon components.
 */
const iconMap: Record<string, LucideIcon> = {
  'sun': Sun,
  'cloud': Cloud,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
  'cloud-sun': CloudSun,
  'cloud-snow': CloudSnow,
  'cloud-drizzle': CloudDrizzle,
  'thermometer': Thermometer,
  'wind': Wind,
  'droplets': Droplets,
  'eye': Eye,
  'gauge': Gauge,
  'sun-dim': SunDim,
  'alert-triangle': AlertTriangle,
  'waves': Waves,
};

export function getWeatherIcon(iconId: string): LucideIcon {
  return iconMap[iconId] ?? Cloud;
}

export function WeatherIcon({
  icon = '',
  className = '',
  size = 24,
}: {
  icon?: string;
  className?: string;
  size?: number;
}) {
  const IconComponent = iconMap[icon] ?? Cloud;
  return React.createElement(IconComponent, { size, className });
}

export { iconMap };

