import { Router } from 'express';
import weatherRoutes from './weatherRoutes.js';
import chatRoutes from './chatRoutes.js';
import { searchLocations } from '../controllers/weatherController.js';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'WeatherGPT Backend Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    weatherMode: process.env.WEATHER_API_KEY ? 'live-weatherapi' : 'fallback-simulation',
    aiMode: process.env.AI_API_KEY ? 'live-gemini-ai' : 'deterministic-meteorological-engine',
  });
});

// Weather API Sub-routes
router.use('/weather', weatherRoutes);

// Location Search Route (supports /api/locations/search and /api/location/search)
router.get('/locations/search', searchLocations);
router.get('/location/search', searchLocations);

// Chat API Route
router.use('/chat', chatRoutes);

export default router;
