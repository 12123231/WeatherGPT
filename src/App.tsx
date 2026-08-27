import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WeatherProvider } from './context/WeatherContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/Chat';
import ForecastPage from './pages/Forecast';
import RiskPage from './pages/Risk';
import MapPage from './pages/Map';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <WeatherProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WeatherProvider>
  );
}
