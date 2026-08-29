import { useWeatherContext } from '../context/useWeatherContext';
import ChatUI from '../components/chat/ChatUI';
import LocationSearch from '../components/map/LocationSearch';
import ConnectionStatus from '../components/common/ConnectionStatus';

export default function ChatPage() {
  const { selectedLocation, setLocation, connectionStatus, lastSynced } = useWeatherContext();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-75px)] lg:h-screen flex flex-col space-y-4 relative z-10">
      {/* Header Context Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 sm:p-5 rounded-2xl border border-white/[0.07] shrink-0 relative z-30">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              WeatherGPT Intelligence Chat
            </h2>
            <ConnectionStatus status={connectionStatus} lastSynced={lastSynced} />
          </div>
          <p className="text-xs text-slate-400">
            Natural language conversational weather reasoning & travel advisories
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-64 relative z-20"
        />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatUI locationId={selectedLocation.id} className="h-full" />
      </div>
    </div>
  );
}
