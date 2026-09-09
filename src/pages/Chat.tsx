import { useWeatherContext } from '../context/useWeatherContext';
import ChatUI from '../components/chat/ChatUI';
import LocationSearch from '../components/map/LocationSearch';
import ConnectionStatus from '../components/common/ConnectionStatus';

export default function ChatPage() {
  const { selectedLocation, setLocation, connectionStatus, lastSynced } = useWeatherContext();

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full h-[calc(100dvh-130px)] lg:h-[calc(100vh-40px)] flex flex-col space-y-3 sm:space-y-4 relative z-10 overflow-x-hidden">
      {/* Header Context Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-3.5 sm:p-5 rounded-2xl border border-white/[0.07] shrink-0 relative z-30 max-w-full">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
              WeatherGPT Intelligence Chat
            </h2>
            <ConnectionStatus status={connectionStatus} lastSynced={lastSynced} />
          </div>
          <p className="text-xs text-slate-400 truncate">
            Natural language conversational weather reasoning & travel advisories
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-64 max-w-full relative z-20 shrink-0"
        />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0 w-full max-w-full">
        <ChatUI locationId={selectedLocation.id} className="h-full w-full max-w-full" />
      </div>
    </div>
  );
}
