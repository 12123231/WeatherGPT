import { useMemo } from 'react';
import type { CurrentWeather, ForecastDay } from '../../types/weather';
import { formatTemp } from '../../utils/formatters';
import { getWeatherMood } from '../../utils/weatherMood';

import stormBackdrop from '../../assets/storm_backdrop.jpg';
import clearBackdrop from '../../assets/moods/clear.svg';
import cloudyBackdrop from '../../assets/moods/cloudy.svg';
import rainBackdrop from '../../assets/moods/rain.svg';
import fogBackdrop from '../../assets/moods/fog.svg';
import snowBackdrop from '../../assets/moods/snow.svg';
import dustBackdrop from '../../assets/moods/dust.svg';
import nightBackdrop from '../../assets/moods/night.svg';

interface HeroWeatherCardProps {
  weather: CurrentWeather;
  todayForecast?: ForecastDay;
  className?: string;
}

const MOOD_BACKDROPS: Record<string, string> = {
  clear: clearBackdrop,
  cloudy: cloudyBackdrop,
  rain: rainBackdrop,
  thunderstorm: stormBackdrop,
  fog: fogBackdrop,
  snow: snowBackdrop,
  dust: dustBackdrop,
  night: nightBackdrop,
};

export default function HeroWeatherCard({
  weather,
  todayForecast,
  className = '',
}: HeroWeatherCardProps) {
  // Determine High / Low values
  const highTemp = todayForecast ? todayForecast.high : Math.round(weather.temperature + 5);
  const lowTemp = todayForecast ? todayForecast.low : Math.round(weather.temperature - 6);

  const mainCondition = weather.condition.main || 'Stormy';
  const subCondition = weather.condition.description
    ? `with ${weather.condition.description.toLowerCase()}`
    : 'with partly cloudy';

  // Reuse existing centralized weather mood detection
  const mood = useMemo(() => getWeatherMood(weather), [weather]);
  const activeBackdrop = MOOD_BACKDROPS[mood.id] || cloudyBackdrop;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.4)] min-h-[250px] sm:min-h-[280px] p-6 sm:p-8 flex flex-col justify-between select-none ${className}`}
    >
      {/* Dynamic Mood Background Layer with subtle crossfade */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out pointer-events-none"
        style={{
          backgroundImage: `url(${activeBackdrop})`,
          backgroundPosition: 'center 40%',
        }}
      />

      {/* Dark Subtle Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/55 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

      {/* Top / Main Temperature Section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          {/* Temperature in large clean typography */}
          <div className="text-6xl sm:text-7xl lg:text-[84px] font-light text-white tracking-tighter leading-none mb-3">
            {formatTemp(weather.temperature, '')}
          </div>

          {/* Condition Title */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
            {mainCondition}
          </h2>

          {/* Sub Condition Description */}
          <p className="text-sm text-slate-300 font-normal mt-0.5 capitalize">
            {subCondition}
          </p>

          {/* High / Low Pills */}
          <div className="flex items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/[0.12] text-xs font-medium text-white shadow-sm">
              H {highTemp}°
            </span>
            <span className="px-3 py-1 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/[0.12] text-xs font-medium text-slate-200 shadow-sm">
              L {lowTemp}°
            </span>
          </div>
        </div>

        {/* Floating AI / Weather Intelligence Insight Card */}
        <div className="hidden sm:block max-w-[230px] lg:max-w-[250px] p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.1] shadow-xl text-xs text-slate-200 leading-relaxed self-center sm:self-start">
          <p className="font-normal text-slate-200/90 text-[12px]">
            With real-time data and advanced technology, we provide reliable forecasts for any location around the world.
          </p>
        </div>
      </div>
    </div>
  );
}
