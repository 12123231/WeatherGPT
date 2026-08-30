import { useWeatherContext } from '../context/useWeatherContext';
import HeroWeatherCard from '../components/weather/HeroWeatherCard';
import HourlyForecastStrip from '../components/weather/HourlyForecastStrip';
import DailyForecastGrid from '../components/weather/DailyForecastGrid';
import LiveConditionsCard from '../components/weather/LiveConditionsCard';
import RecentlySearchedCard from '../components/weather/RecentlySearchedCard';
import WindMapCard from '../components/weather/WindMapCard';
import LocationSearch from '../components/map/LocationSearch';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { formatCurrentDateTime } from '../utils/formatters';
import { MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    currentWeather,
    forecast,
    risks,
    selectedLocation,
    loading,
    error,
    setLocation,
    refresh,
  } = useWeatherContext();

  return (
    <div className="p-3 sm:p-5 lg:p-7 max-w-[1400px] mx-auto w-full space-y-5 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 px-1">
        {/* Left: Location Pin & Date */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white shrink-0 shadow-sm">
            <MapPin size={16} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-tight">
              {currentWeather ? `${currentWeather.location}, ${currentWeather.country}` : `${selectedLocation.name}, ${selectedLocation.country}`}
            </h1>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              {formatCurrentDateTime()}
            </p>
          </div>
        </div>

        {/* Right: Search Icon Button & Action Button */}
        <div className="flex items-center gap-2.5">
          <LocationSearch
            selectedLocation={selectedLocation}
            onSelectLocation={setLocation}
            variant="icon"
          />

          <Link
            to="/chat"
            className="px-4 py-2 rounded-full bg-[#26272c] hover:bg-[#303138] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} className="text-sky-300" />
            <span className="hidden sm:inline">WeatherGPT Assistant</span>
            <span className="sm:hidden">AI Chat</span>
          </Link>
        </div>
      </div>

      {/* Main Content States */}
      {loading && !currentWeather ? (
        <LoadingState message="Fetching live meteorological telemetry..." />
      ) : error && !currentWeather ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : currentWeather ? (
        /* Primary 2-Column Dashboard Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Hero, Hourly, 7-Day) - spans 8 columns on large screens */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* 1. Hero Weather Card */}
            <HeroWeatherCard
              weather={currentWeather}
              todayForecast={forecast[0]}
            />

            {/* 2. Hourly Forecast Strip */}
            <HourlyForecastStrip
              weather={currentWeather}
            />

            {/* 3. 7-Day Forecast Grid */}
            <DailyForecastGrid
              forecast={forecast}
            />
          </div>

          {/* Right Column (Live Conditions, Recently Searched, Wind Map) - spans 4 columns on large screens */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* 1. Live Conditions Card */}
            <LiveConditionsCard
              weather={currentWeather}
              risks={risks}
            />

            {/* 2. Recently Searched Card */}
            <RecentlySearchedCard
              onSelectLocation={setLocation}
              selectedLocation={selectedLocation}
            />

            {/* 3. Wind Map Card */}
            <WindMapCard
              weather={currentWeather}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

