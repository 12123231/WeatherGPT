import { useWeatherContext } from '../context/useWeatherContext';
import ChatUI from '../components/chat/ChatUI';
import LocationSearch from '../components/map/LocationSearch';
import ConnectionStatus from '../components/common/ConnectionStatus';

export default function ChatPage() {
  const { selectedLocation, setLocation, connectionStatus, lastSynced } = useWeatherContext();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-65px)] lg:h-screen flex flex-col space-y-4">
      {/* Header Context Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">
              WeatherGPT Intelligence Chat
            </h2>
            <ConnectionStatus status={connectionStatus} lastSynced={lastSynced} />
          </div>
          <p className="text-xs text-slate-500">
            Natural language conversational weather reasoning & travel advisories
          </p>
        </div>

        <LocationSearch
          selectedLocation={selectedLocation}
          onSelectLocation={setLocation}
          className="w-full sm:w-60"
        />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatUI locationId={selectedLocation.id} className="h-full" />
      </div>
    </div>
  );
}
