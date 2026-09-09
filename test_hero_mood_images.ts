import fs from 'fs';
import path from 'path';
import { getWeatherMood } from './src/utils/weatherMood';
import type { CurrentWeather } from './src/types/weather';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error('FAIL: ' + msg);
    process.exit(1);
  }
  console.log('PASS: ' + msg);
}

console.log('\n--- Running Hero Mood Image Verification Tests ---');

// 1. Verify all 8 environment assets exist on disk and are valid
const assetPaths = [
  'src/assets/moods/clear.svg',
  'src/assets/moods/cloudy.svg',
  'src/assets/moods/rain.svg',
  'src/assets/storm_backdrop.jpg',
  'src/assets/moods/fog.svg',
  'src/assets/moods/snow.svg',
  'src/assets/moods/dust.svg',
  'src/assets/moods/night.svg',
];

for (const p of assetPaths) {
  assert(fs.existsSync(p), `Asset must exist: ${p}`);
  const stats = fs.statSync(p);
  assert(stats.size > 100, `Asset must be non-empty (>100 bytes): ${p} (${stats.size} bytes)`);
}

const baseWeather: CurrentWeather = {
  location: 'New Delhi',
  region: 'Delhi',
  country: 'India',
  temperature: 28,
  feelsLike: 30,
  condition: { main: 'Clear', description: 'Clear sky', icon: 'sun' },
  humidity: 50,
  windSpeed: 10,
  windDirection: 'NW',
  visibility: 10,
  pressure: 1012,
  uvIndex: 5,
  lastUpdated: '2026-09-09 12:00',
};

// 2. Sunny -> sunny environment
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Sunny', description: 'Sunny', icon: 'sun' }, localtime: '2026-09-09 13:00' });
  assert(mood.id === 'clear', 'Sunny must map to clear mood');
}

// 3. Cloudy -> cloudy environment
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Overcast', description: 'Overcast', icon: 'cloud' }, localtime: '2026-09-09 14:00' });
  assert(mood.id === 'cloudy', 'Overcast must map to cloudy mood');
}

// 4. Rain -> rainy environment
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Heavy Rain', description: 'Heavy Rain', icon: 'cloud-rain' }, localtime: '2026-09-09 15:00' });
  assert(mood.id === 'rain', 'Heavy Rain must map to rain mood');
}

// 5. Thunderstorm -> storm environment
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Thunderstorm', description: 'Severe thunderstorm', icon: 'cloud-lightning' }, localtime: '2026-09-09 16:00' });
  assert(mood.id === 'thunderstorm', 'Thunderstorm must map to thunderstorm mood');
}

// 6. Dust / Haze -> dusty environment
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Haze', description: 'Dense dust haze', icon: 'cloud' }, localtime: '2026-09-09 11:00' });
  assert(mood.id === 'dust', 'Haze/Dust must map to dust mood');
}

// 7. Night -> night environment
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Clear', description: 'Clear sky', icon: 'moon' }, localtime: '2026-09-09 23:00' });
  assert(mood.id === 'night', 'Nighttime clear sky must map to night mood');
}

// 8. Location switching updates hero image mood automatically
{
  const testLocations = [
    { city: 'Mumbai', cond: 'Moderate Rain', expected: 'rain' },
    { city: 'Kolkata', cond: 'Thunderstorm', expected: 'thunderstorm' },
    { city: 'Delhi', cond: 'Haze', expected: 'dust' },
    { city: 'Jaipur', cond: 'Sunny', expected: 'clear' },
    { city: 'Shimla', cond: 'Light Snow', expected: 'snow' },
    { city: 'London', cond: 'Mist', expected: 'fog' },
  ];

  for (const loc of testLocations) {
    const mood = getWeatherMood({
      ...baseWeather,
      location: loc.city,
      condition: { main: loc.cond, description: loc.cond, icon: 'sun' },
      localtime: '2026-09-09 12:00',
    });
    assert(mood.id === loc.expected, `${loc.city} (${loc.cond}) must resolve to ${loc.expected}`);
  }
}

console.log('\nALL HERO MOOD IMAGE TESTS PASSED SUCCESSFULLY!\n');
