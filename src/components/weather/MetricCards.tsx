import type { CurrentWeather } from '../../types/weather';
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  SunMedium,
} from 'lucide-react';
import {
  formatHumidity,
  formatWind,
  formatVisibility,
  formatPressure,
  formatUVIndex,
} from '../../utils/formatters';

interface MetricCardsProps {
  weather: CurrentWeather;
  className?: string;
}

export default function MetricCards({ weather, className = '' }: MetricCardsProps) {
  const uvInfo = formatUVIndex(weather.uvIndex);

  const metrics = [
    {
      id: 'humidity',
      label: 'Humidity',
      value: formatHumidity(weather.humidity),
      subtext: weather.humidity > 70 ? 'High moisture' : 'Comfortable',
      icon: Droplets,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50/50',
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: formatWind(weather.windSpeed, weather.windDirection),
      subtext: `${weather.windSpeed > 20 ? 'Breezy' : 'Gentle'} flow`,
      icon: Wind,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-50/50',
    },
    {
      id: 'visibility',
      label: 'Visibility',
      value: formatVisibility(weather.visibility),
      subtext: weather.visibility >= 10 ? 'Clear line of sight' : 'Moderate haze',
      icon: Eye,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50/50',
    },
    {
      id: 'pressure',
      label: 'Atmospheric Pressure',
      value: formatPressure(weather.pressure),
      subtext: weather.pressure >= 1013 ? 'High pressure' : 'Standard',
      icon: Gauge,
      iconColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
    {
      id: 'uvIndex',
      label: 'UV Index',
      value: `${uvInfo.value} / 12`,
      subtext: `${uvInfo.label} risk`,
      icon: SunMedium,
      iconColor: weather.uvIndex >= 8 ? 'text-rose-500' : 'text-amber-500',
      bgColor: weather.uvIndex >= 8 ? 'bg-rose-50/50' : 'bg-amber-50/50',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${className}`}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.id}
            className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500 line-clamp-1">
                {metric.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${metric.bgColor} ${metric.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon size={16} />
              </div>
            </div>

            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {metric.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                {metric.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
