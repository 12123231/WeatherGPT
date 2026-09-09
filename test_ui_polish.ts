import { getWeatherMood } from './src/utils/weatherMood';
import type { CurrentWeather } from './src/types/weather';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error('FAIL: ' + msg);
    process.exit(1);
  }
  console.log('PASS: ' + msg);
}

console.log('\n--- Running Weather Mood System Verification Tests ---');

const baseWeather: CurrentWeather = {
  location: 'New Delhi',
  region: 'Delhi',
  country: 'India',
  temperature: 30,
  feelsLike: 32,
  condition: { main: 'Clear', description: 'Sunny', icon: 'sun' },
  humidity: 50,
  windSpeed: 10,
  windDirection: 'NW',
  visibility: 8,
  pressure: 1010,
  uvIndex: 6,
  lastUpdated: '2026-09-09 12:00',
};

// 1. Clear / Sunny
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Clear', description: 'Sunny', icon: 'sun' }, localtime: '2026-09-09 12:00' });
  assert(mood.id === 'clear', 'Clear/Sunny weather must produce "clear" mood');
  assert(mood.isNight === false, 'Midday sunny weather must be day mood');
}

// 2. Cloudy / Overcast
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Cloudy', description: 'Overcast skies', icon: 'cloud' }, localtime: '2026-09-09 14:00' });
  assert(mood.id === 'cloudy', 'Overcast weather must produce "cloudy" mood');
  assert(mood.isNight === false, 'Day overcast must not be night mood');
}

// 3. Rain / Drizzle
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Rain', description: 'Moderate rain', icon: 'cloud-rain' }, localtime: '2026-09-09 15:00' });
  assert(mood.id === 'rain', 'Rain/Drizzle weather must produce "rain" mood');
}

// 4. Thunderstorm
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Thunderstorm', description: 'Heavy thunderstorm with lightning', icon: 'cloud-lightning' }, localtime: '2026-09-09 16:00' });
  assert(mood.id === 'thunderstorm', 'Thunderstorm weather must produce "thunderstorm" mood');
}

// 5. Fog / Mist
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Mist', description: 'Dense fog', icon: 'cloud' }, localtime: '2026-09-09 08:00' });
  assert(mood.id === 'fog', 'Fog/Mist weather must produce "fog" mood');
}

// 6. Snow
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Snow', description: 'Light snow flurries', icon: 'cloud-snow' }, localtime: '2026-09-09 10:00' });
  assert(mood.id === 'snow', 'Snow weather must produce "snow" mood');
}

// 7. Dust / Sand / Smoke / Haze
{
  const mood = getWeatherMood({ ...baseWeather, condition: { main: 'Haze', description: 'Widespread dust and haze', icon: 'cloud' }, localtime: '2026-09-09 11:00' });
  assert(mood.id === 'dust', 'Dust/Sand/Haze weather must produce "dust" mood');
}

// 8. Night Mode Integration
{
  const nightMood = getWeatherMood({ ...baseWeather, condition: { main: 'Clear', description: 'Clear sky', icon: 'moon' }, localtime: '2026-09-09 23:00' });
  assert(nightMood.isNight === true, 'Late hour/moon icon must produce night mood');
  assert(nightMood.id === 'night', 'Night clear sky must produce "night" mood id');
}

// 9. Location switching transitions: Delhi -> Mumbai -> Bengaluru -> Kolkata -> Jaipur
{
  const cities = [
    { name: 'Delhi', cond: 'Haze', expectedMood: 'dust' },
    { name: 'Mumbai', cond: 'Moderate Rain', expectedMood: 'rain' },
    { name: 'Bengaluru', cond: 'Partly Cloudy', expectedMood: 'cloudy' },
    { name: 'Kolkata', cond: 'Thunderstorm', expectedMood: 'thunderstorm' },
    { name: 'Jaipur', cond: 'Sunny', expectedMood: 'clear' },
  ];

  for (const c of cities) {
    const mood = getWeatherMood({
      ...baseWeather,
      location: c.name,
      condition: { main: c.cond, description: c.cond, icon: 'sun' },
      localtime: '2026-09-09 14:00',
    });
    assert(mood.id === c.expectedMood, `City ${c.name} with ${c.cond} must produce "${c.expectedMood}" mood`);
  }
}

// 10. Fallback / Null Weather
{
  const mood = getWeatherMood(null);
  assert(mood.id === 'cloudy', 'Null weather must return default calm atmosphere');
  assert(mood.gradient.length > 0, 'Must have valid CSS background gradient');
}

console.log('\nALL WEATHER MOOD TESTS PASSED SUCCESSFULLY!\n');
