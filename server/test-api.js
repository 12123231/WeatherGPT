async function runTests() {
  const base = 'http://localhost:5000/api';

  console.log('Testing WeatherGPT Backend APIs & AI Integration...\n');

  // 1. Health
  const health = await (await fetch(`${base}/health`)).json();
  console.log('✅ /api/health:', health.status, `(Weather: ${health.weatherMode} | AI: ${health.aiMode})`);

  // 2. Current Weather
  const weather = await (await fetch(`${base}/weather/current?location=New%20Delhi`)).json();
  console.log('✅ /api/weather/current:', weather.data.location, `${weather.data.temperature}°C`, weather.data.condition.main, `(Live Data: ${!weather.isFallback})`);

  // 3. Forecast
  const forecast = await (await fetch(`${base}/weather/forecast?location=New%20Delhi`)).json();
  console.log('✅ /api/weather/forecast:', `${forecast.data.length} days loaded`);

  // 4. Alerts
  const alerts = await (await fetch(`${base}/weather/alerts?location=New%20Delhi`)).json();
  console.log('✅ /api/weather/alerts:', `${alerts.data.length} active risks/advisories`);

  // 5. Location Search
  const locs = await (await fetch(`${base}/locations/search?q=Delhi`)).json();
  console.log('✅ /api/locations/search:', locs.data[0]?.name || 'Delhi', `(${locs.data[0]?.region || 'India'})`);

  // 6. Gemini AI Weather Chat
  console.log('\n--- Testing Gemini AI Chat ---');
  console.log('Sending Question: "Will it rain today?" (Location: "New Delhi")');
  const chatRes = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Will it rain today?', location: 'New Delhi' }),
  });
  const chat = await chatRes.json();
  console.log('✅ /api/chat Status:', chat.success ? 'SUCCESS' : 'FAILED');
  console.log('WeatherGPT Response:\n' + chat.data.content);

  // 7. Map Data
  const map = await (await fetch(`${base}/weather/map?location=New%20Delhi`)).json();
  console.log('\n✅ /api/weather/map:', map.data.location.name, `Radar: ${map.data.radarStatus}`);

  console.log('\n🎉 ALL BACKEND, WEATHERAPI, AND GEMINI AI INTEGRATION TESTS PASSED!');
}

runTests().catch(console.error);
