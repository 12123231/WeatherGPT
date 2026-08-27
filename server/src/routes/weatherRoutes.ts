import { Router } from 'express';
import {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  getWeatherAlerts,
  getMapData,
} from '../controllers/weatherController.js';

const router = Router();

router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);
router.get('/hourly', getHourlyForecast);
router.get('/alerts', getWeatherAlerts);
router.get('/risks', getWeatherAlerts); // Alias for backward compatibility
router.get('/map', getMapData);

export default router;
