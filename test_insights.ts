import { generateWeatherInsights } from './src/services/insightService';
import type { CurrentWeather, HourlyForecast, ForecastDay } from './src/types/weather';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error('FAIL: ' + msg);
    process.exit(1);
  }
  console.log('PASS: ' + msg);
}

const baseWeather: CurrentWeather = {
  temperature: 28,
  feelsLike: 30,
  condition: { main: 'Clear', description: 'Clear sky', icon: 'sun' },
  humidity: 65,
  windSpeed: 12,
  windDirection: 'SW',
  visibility: 10,
  pressure: 1012,
  uvIndex: 7,
  lastUpdated: '2026-09-09 12:00',
  location: 'Kolkata',
  country: 'India',
};

const baseForecast: ForecastDay[] = [
  {
    date: '2026-09-09',
    day: 'Wednesday',
    high: 34,
    low: 26,
    condition: { main: 'Clear', description: 'Clear sky', icon: 'sun' },
    rainProbability: 20,
    humidity: 65,
    windSpeed: 12,
  },
];

console.log('\n--- Running Phase 6 Focused Verification Tests ---');

// Test 1: UTF-8 degree sign and dash output verification
{
  const hourly: HourlyForecast[] = [
    { time: 'Now', temperature: 28, condition: { main: 'Clear', description: 'Clear', icon: 'sun' }, rainProbability: 10, hour: 12, isDay: true },
    { time: '1 PM', temperature: 30, condition: { main: 'Clear', description: 'Clear', icon: 'sun' }, rainProbability: 10, hour: 13, isDay: true },
  ];
  const res = generateWeatherInsights('Kolkata', baseWeather, hourly, baseForecast, true);
  assert(res.dailySummary.includes('°C'), 'Summary must contain clean degree symbol °C');
  assert(!res.dailySummary.includes('\uFFFD'), 'Summary must have zero replacement characters');
  assert(res.keyWindows.every((w) => !w.timeRange.includes('\uFFFD')), 'Windows must have zero replacement characters');
}

// Test 2: Tropical nighttime hours cannot become Best Outside
{
  const nightHourly: HourlyForecast[] = [
    { time: 'Now', temperature: 26, condition: { main: 'Clear', description: 'Clear', icon: 'moon' }, rainProbability: 5, hour: 22, isDay: false },
    { time: '11 PM', temperature: 25, condition: { main: 'Clear', description: 'Clear', icon: 'moon' }, rainProbability: 5, hour: 23, isDay: false },
    { time: '12 AM', temperature: 25, condition: { main: 'Clear', description: 'Clear', icon: 'moon' }, rainProbability: 5, hour: 0, isDay: false },
    { time: '1 AM', temperature: 24, condition: { main: 'Clear', description: 'Clear', icon: 'moon' }, rainProbability: 5, hour: 1, isDay: false },
    { time: '2 AM', temperature: 24, condition: { main: 'Clear', description: 'Clear', icon: 'moon' }, rainProbability: 5, hour: 2, isDay: false },
  ];
  const res = generateWeatherInsights('Mumbai', { ...baseWeather, temperature: 26 }, nightHourly, baseForecast, true);
  const outdoorWin = res.keyWindows.find((w) => w.type === 'outdoor');
  assert(!outdoorWin, 'Tropical nighttime hours must NOT be selected as Best Outside window');
}

// Test 3: After 15:00, a past midday period cannot become High UV
{
  const eveningHourly: HourlyForecast[] = [
    { time: 'Now', temperature: 32, condition: { main: 'Clear', description: 'Clear', icon: 'sun' }, rainProbability: 5, hour: 17, isDay: true },
    { time: '6 PM', temperature: 30, condition: { main: 'Clear', description: 'Clear', icon: 'sun' }, rainProbability: 5, hour: 18, isDay: true },
    { time: '7 PM', temperature: 28, condition: { main: 'Clear', description: 'Clear', icon: 'moon' }, rainProbability: 5, hour: 19, isDay: false },
  ];
  const res = generateWeatherInsights('Delhi', { ...baseWeather, uvIndex: 8 }, eveningHourly, baseForecast, true);
  const uvWin = res.keyWindows.find((w) => w.type === 'uv');
  assert(!uvWin, 'After 15:00, past midday period must NOT be emitted as High UV window');
}

// Test 4: Rain crossing midnight produces context-correct wording without contradiction
{
  const crossMidnightRain: HourlyForecast[] = [
    { time: 'Now', temperature: 27, condition: { main: 'Rain', description: 'Rain', icon: 'cloud-rain' }, rainProbability: 40, hour: 21, isDay: false },
    { time: '10 PM', temperature: 26, condition: { main: 'Rain', description: 'Rain', icon: 'cloud-rain' }, rainProbability: 50, hour: 22, isDay: false },
    { time: '11 PM', temperature: 25, condition: { main: 'Rain', description: 'Heavy Rain', icon: 'cloud-rain' }, rainProbability: 75, hour: 23, isDay: false },
    { time: '12 AM', temperature: 25, condition: { main: 'Rain', description: 'Heavy Rain', icon: 'cloud-rain' }, rainProbability: 75, hour: 0, isDay: false },
    { time: '1 AM', temperature: 24, condition: { main: 'Rain', description: 'Heavy Rain', icon: 'cloud-rain' }, rainProbability: 70, hour: 1, isDay: false },
  ];
  const res = generateWeatherInsights('Kolkata', { ...baseWeather, condition: { main: 'Rain', description: 'Rain', icon: 'cloud-rain' } }, crossMidnightRain, baseForecast, true);
  assert(!res.dailySummary.includes('during the day'), 'Rain crossing midnight must not claim "during the day"');
  assert(res.dailySummary.includes('Rain is likely over the next several hours'), 'Summary must use neutral temporal phrasing');
  assert(!res.dailySummary.includes('Low chance of rain'), 'Must not produce contradictory low chance rain wording');
}

// Test 5: isLive === false produces no live insights
{
  const res = generateWeatherInsights('Kolkata', baseWeather, [], baseForecast, false);
  assert(res.dataAvailable === false, 'isLive === false must return dataAvailable: false');
  assert(res.keyWindows.length === 0, 'Offline data must return 0 keyWindows');
  assert(res.clothingAdvice.length === 0, 'Offline data must return 0 clothingAdvice');
  assert(res.dailySummary.includes('Live weather data offline'), 'Offline summary must state live weather data offline');
}

console.log('\nALL PHASE 6 FOCUSED TESTS PASSED SUCCESSFULLY!\n');
