import { Link } from 'react-router-dom';
import type { CurrentWeather } from '../../types/weather';
import { MapPin } from 'lucide-react';
import windMapTexture from '../../assets/wind_map_texture.jpg';

interface WindMapCardProps {
  weather?: CurrentWeather | null;
  className?: string;
}

export default function WindMapCard({
  weather,
  className = '',
}: WindMapCardProps) {
  const windSpeed = weather ? weather.windSpeed : 12;
  const windDir = weather ? weather.windDirection : 'Northwest';

  // Map abbreviation to full direction name if short
  const fullDirection = windDir === 'NW' ? 'Northwest'
    : windDir === 'SW' ? 'Southwest'
    : windDir === 'NE' ? 'Northeast'
    : windDir === 'SE' ? 'Southeast'
    : windDir === 'N' ? 'North'
    : windDir === 'S' ? 'South'
    : windDir === 'E' ? 'East'
    : windDir === 'W' ? 'West'
    : windDir;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] p-6 min-h-[145px] border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.35)] flex items-center justify-between select-none ${className}`}
      style={{
        backgroundImage: `url(${windMapTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Subtle Atmospheric Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60 pointer-events-none" />

      {/* Left Info */}
      <div className="relative z-10">
        <span className="text-xs text-slate-300 font-medium">
          Wind Map
        </span>
        <div className="text-xl font-bold text-white tracking-tight mt-1.5 leading-none">
          {windSpeed} km/h
        </div>
        <p className="text-xs text-slate-400 font-normal mt-1">
          {fullDirection}
        </p>
      </div>

      {/* Right Map Pin Button Link to Interactive Map */}
      <div className="relative z-10">
        <Link
          to="/map"
          title="Open interactive spatial radar & map"
          className="w-12 h-12 rounded-full bg-[#1e1f24]/85 hover:bg-[#282a32] backdrop-blur-xl border border-white/25 flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer group"
        >
          <MapPin size={18} className="text-white fill-white group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
