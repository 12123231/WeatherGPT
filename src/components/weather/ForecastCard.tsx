import type { ForecastDay } from '../../types/weather';
import { getWeatherIcon } from '../../utils/weatherIcons';
import { formatTemp, formatRainProbability } from '../../utils/formatters';
import { Calendar, Droplets } from 'lucide-react';

interface ForecastCardProps {
  forecast: ForecastDay[];
  className?: string;
}

export default function ForecastCard({ forecast, className = '' }: ForecastCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">7-Day Forecast</h3>
            <p className="text-[11px] text-slate-500">Upcoming weather trends & precipitation</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
          {forecast.length} Days
        </span>
      </div>

      {/* Forecast list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {forecast.map((item, idx) => {
          const Icon = getWeatherIcon(item.condition.icon);
          const isToday = idx === 0;

          return (
            <div
              key={item.date}
              className={`flex sm:flex-col items-center justify-between p-3 rounded-xl border transition-all ${
                isToday
                  ? 'bg-blue-50/40 border-blue-200'
                  : 'bg-slate-50/60 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              {/* Day & Date */}
              <div className="text-left sm:text-center">
                <p className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                  {item.day}
                </p>
                <p className="text-[10px] text-slate-400">
                  {item.date.slice(5)}
                </p>
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center sm:flex-col gap-1.5 my-1 sm:my-2">
                <Icon
                  size={24}
                  className={
                    item.condition.icon.includes('sun') || item.condition.icon === 'sun'
                      ? 'text-amber-500'
                      : item.condition.icon.includes('rain')
                      ? 'text-blue-500'
                      : item.condition.icon.includes('lightning')
                      ? 'text-indigo-500'
                      : 'text-slate-500'
                  }
                />
                <span className="text-[11px] font-medium text-slate-600 sm:text-center line-clamp-1 max-w-[90px]">
                  {item.condition.main}
                </span>
              </div>

              {/* High / Low Temp */}
              <div className="text-right sm:text-center">
                <div className="flex items-baseline justify-end sm:justify-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>{formatTemp(item.high)}</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    {formatTemp(item.low)}
                  </span>
                </div>

                {/* Rain probability */}
                <div className="flex items-center justify-end sm:justify-center gap-0.5 text-[10px] text-blue-600 font-medium mt-0.5">
                  <Droplets size={10} />
                  <span>{formatRainProbability(item.rainProbability)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
