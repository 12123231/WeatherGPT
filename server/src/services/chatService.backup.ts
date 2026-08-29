import type { ChatMessage } from '../types/index.js';
import { getCurrentWeather, getForecast, getWeatherRisks, searchLocations } from './weatherService.js';

export type DetectedLanguage = 'hindi' | 'hinglish' | 'english';

/**
 * Hindi transliteration mapping for common Indian cities to ensure accurate WeatherAPI resolution.
 */
const HINDI_CITY_MAP: Record<string, string> = {
  'दिल्ली': 'Delhi',
  'नई दिल्ली': 'New Delhi',
  'मुंबई': 'Mumbai',
  'बम्बई': 'Mumbai',
  'बेंगलुरु': 'Bengaluru',
  'बैंगलोर': 'Bengaluru',
  'चेन्नई': 'Chennai',
  'मद्रास': 'Chennai',
  'कोलकाता': 'Kolkata',
  'कलकत्ता': 'Kolkata',
  'जयपुर': 'Jaipur',
  'पुणे': 'Pune',
  'हैदराबाद': 'Hyderabad',
  'लखनऊ': 'Lucknow',
  'अहमदाबाद': 'Ahmedabad',
  'चंडीगढ़': 'Chandigarh',
  'शिमला': 'Shimla',
  'गोवा': 'Goa',
  'पटना': 'Patna',
  'भोपाल': 'Bhopal',
  'इंदौर': 'Indore',
  'सूरत': 'Surat',
  'कानपुर': 'Kanpur',
  'नागपुर': 'Nagpur',
  'वाराणसी': 'Varanasi',
  'आगरा': 'Agra',
};

/**
 * Common non-location words and stopwords that must not be treated as city names.
 */
const NON_LOCATION_WORDS = new Set([
  'today', 'tomorrow', 'tonight', 'yesterday', 'weather', 'forecast', 'rain',
  'raining', 'rainy', 'temperature', 'temp', 'humidity', 'wind', 'sun', 'sunny',
  'hot', 'cold', 'heat', 'air', 'quality', 'aqi', 'here', 'there', 'now', 'this',
  'week', 'weekly', 'weekend', 'days', 'day', 'next', 'current', 'live', 'morning',
  'evening', 'afternoon', 'night', 'hourly', 'daily', 'safe', 'safety', 'travel',
  'umbrella', 'report', 'update', 'status', 'condition', 'conditions', 'alerts',
  'warning', 'advisories', 'advice', 'help', 'info', 'information', 'details',
  'please', 'tell', 'give', 'show', 'check', 'know', 'can', 'will', 'what', 'how',
  'whats', "what's", 'hows', "how's", 'is', 'the', 'a', 'an', 'in', 'of', 'for', 'at',
  'near', 'to', 'from', 'with', 'about', 'like', 'aaj', 'kal', 'parson', 'kya', 'hai',
  'hain', 'hein', 'hoga', 'hogi', 'honge', 'batao', 'bataiye', 'bataye', 'mausam',
  'mosam', 'baarish', 'barish', 'barsaat', 'garmi', 'thand', 'hawa', 'badal', 'dhoop',
  'chahiye', 'chhatri', 'safari', 'safar', 'mein', 'mai', 'pe', 'ka', 'ki', 'ke', 'ko',
  'se', 'rahega', 'rahegi', 'kaisa', 'kaisi', 'kaise', 'kitna', 'kitni', 'kitne',
  'give', 'me', 'full', 'complete', 'overview', 'summary', 'city', 'place', 'location',
  'area', 'region', 'zone', 'state', 'country', 'world', 'globe', 'sky', 'skies', 'cloud',
  'clouds', 'cloudy', 'clear', 'overcast', 'thunder', 'storm', 'visibility', 'pressure',
  'आज', 'कल', 'परसों', 'क्या', 'है', 'हैं', 'होगा', 'होगी', 'होंगे', 'बताओ', 'बताइए',
  'बताएं', 'मौसम', 'बारिश', 'वर्षा', 'बरसात', 'गर्मी', 'ठंड', 'हवा', 'बादल', 'धूप',
  'चाहिए', 'छाता', 'सफर', 'में', 'का', 'की', 'के', 'को', 'से', 'रहेगा', 'रहेगी', 'कैसा',
  'कैसी', 'कैसे', 'कितना', 'कितनी', 'कितने'
]);

/**
 * Detects the language intent of the user message.
 */
export function detectLanguage(message: string): DetectedLanguage {
  const text = message.trim().toLowerCase();

  // 1. Devanagari script detection (Unicode range \u0900-\u097F)
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    return 'hindi';
  }

  // 2. Explicit request for Hindi
  if (
    text.includes('in hindi') ||
    text.includes('hindi me') ||
    text.includes('hindi mein') ||
    text.includes('hindi mai') ||
    text.includes('answer in hindi') ||
    text.includes('tell in hindi')
  ) {
    return 'hindi';
  }

  // 3. Hinglish detection: Common Romanized Hindi words
  const hinglishTokens = [
    'aaj', 'kal', 'parson', 'kya', 'hogi', 'hoga', 'honge', 'baarish', 'barish',
    'barsaat', 'mausam', 'mosam', 'kaisa', 'kaisi', 'kaise', 'hai', 'hain', 'hein',
    'batao', 'bataiye', 'bataye', 'garmi', 'thand', 'hawa', 'badal', 'dhoop',
    'kripya', 'aap', 'tum', 'mein', 'mai', 'pe', 'rahega', 'rahegi', 'chahiye',
    'chhatri', 'safari', 'jaana', 'ja sakte', 'safar', 'safe hai', 'kitna', 'kitni'
  ];

  const words = text.replace(/[^\w\s]/g, '').split(/\s+/);
  const matchCount = words.filter((w) => hinglishTokens.includes(w)).length;

  if (matchCount >= 2 || (words.length <= 4 && matchCount >= 1)) {
    return 'hinglish';
  }

  return 'english';
}

/**
 * Detects if the user is asking for a weekly or 7-day weather forecast.
 */
function isWeeklyForecastQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('7 day') ||
    lower.includes('7-day') ||
    lower.includes('7 days') ||
    lower.includes('seven day') ||
    lower.includes('weekly') ||
    lower.includes('week forecast') ||
    lower.includes('next 7 days') ||
    lower.includes('for the week') ||
    lower.includes('whole week') ||
    lower.includes('full week') ||
    lower.includes('complete forecast') ||
    lower.includes('हफ्ते') ||
    lower.includes('सप्ताह') ||
    lower.includes('7 दिन') ||
    lower.includes('hafta') ||
    lower.includes('hafte')
  );
}

/**
 * Extracts and resolves an explicit location mentioned in the user message.
 * Falls back to fallbackLocation if no explicit valid location is mentioned.
 */
export async function extractLocationFromMessage(message: string, fallbackLocation: string): Promise<string> {
  if (!message || !message.trim()) return fallbackLocation;

  const raw = message.trim();

  // Pattern candidates without relying on Unicode-incompatible \b
  const candidatePatterns = [
    // Preposition patterns: "weather in Delhi", "forecast for Mumbai", "temperature of Kolkata", "in New Delhi"
    /(?:^|\s+)(?:in|of|for|at|around|near)\s+([a-zA-Z\u0900-\u097F\s]{2,30}?)(?=[?,.!;]|\s+(?:today|tomorrow|tonight|now|this|please|right|next|weather|forecast|kaisa|kaisi|mein|ka|ki|ke)|$)/gi,
    // Leading location patterns: "Delhi weather", "Mumbai 7 day forecast", "Jaipur temperature"
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s]{2,30}?)\s+(?:weather|forecast|temperature|temp|climate|alerts?|mausam|mosam|baarish|barish|garmi|thand)(?:\s+|$|[?,.!;])/gi,
    // Hindi/Hinglish patterns: "Delhi mein", "Mumbai ka mausam", "दिल्ली में", "जयपुर का"
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s]{2,30}?)\s+(?:mein|mai|ka|ki|ke|pe|में|का|की|के)(?:\s+|$|[?,.!;])/gi,
  ];

  const extractedCandidates: string[] = [];

  for (const pattern of candidatePatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(raw)) !== null) {
      if (match[1]) {
        extractedCandidates.push(match[1].trim());
      }
    }
  }

  // Clean candidates and filter out stopwords
  for (const rawCandidate of extractedCandidates) {
    const words = rawCandidate
      .replace(/[^\w\s\u0900-\u097F]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    // Strip leading/trailing stop words
    while (words.length > 0 && NON_LOCATION_WORDS.has(words[0].toLowerCase())) {
      words.shift();
    }
    while (words.length > 0 && NON_LOCATION_WORDS.has(words[words.length - 1].toLowerCase())) {
      words.pop();
    }

    if (words.length === 0) continue;

    let cleaned = words.join(' ');
    if (cleaned.length < 2) continue;

    // Check direct Hindi transliteration mapping
    if (HINDI_CITY_MAP[cleaned]) {
      cleaned = HINDI_CITY_MAP[cleaned];
    }

    // Check if candidate is all non-location words
    const allStopWords = words.every((w) => NON_LOCATION_WORDS.has(w.toLowerCase()));
    if (allStopWords) continue;

    // Verify candidate with searchLocations()
    try {
      const searchResults = await searchLocations(cleaned);
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        // Return top matched location name
        const match = searchResults.find(
          (loc) =>
            loc.name.toLowerCase() === cleaned.toLowerCase() ||
            loc.name.toLowerCase().includes(cleaned.toLowerCase()) ||
            cleaned.toLowerCase().includes(loc.name.toLowerCase())
        );
        return match ? match.name : searchResults[0].name;
      }
    } catch {
      return cleaned;
    }
  }

  // Fallback: If no preposition matched, test individual 1-2 word potential city tokens in query
  const cleanTokens = raw
    .replace(/[^\w\s\u0900-\u097F]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !NON_LOCATION_WORDS.has(w.toLowerCase()));

  for (let token of cleanTokens) {
    if (HINDI_CITY_MAP[token]) {
      token = HINDI_CITY_MAP[token];
    }
    try {
      const searchResults = await searchLocations(token);
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        const exact = searchResults.find(
          (loc) => loc.name.toLowerCase() === token.toLowerCase()
        );
        if (exact) {
          return exact.name;
        }
      }
    } catch {
      // Continue search
    }
  }

  return fallbackLocation;
}

export async function processChatQuery(message: string, locationQuery: string = 'new-delhi'): Promise<ChatMessage> {
  const apiKey = process.env.AI_API_KEY;
  const language = detectLanguage(message);
  const isWeekly = isWeeklyForecastQuery(message);

  // 1. Resolve target location (Explicit message location takes priority over UI selected location)
  const targetLocation = await extractLocationFromMessage(message, locationQuery);

  // 2. Retrieve live weather telemetry context consistently for the target location
  const [currentResult, forecastResult, risksResult] = await Promise.all([
    getCurrentWeather(targetLocation),
    getForecast(targetLocation),
    getWeatherRisks(targetLocation),
  ]);

  const weather = currentResult.data;
  const forecast = forecastResult.data;
  const risks = risksResult.data;

  // 3. If Gemini AI API key is provided, attempt Gemini generation
  if (apiKey) {
    try {
      const geminiResponse = await callGeminiApi(apiKey, message, language, isWeekly, weather, forecast, risks);
      if (geminiResponse && geminiResponse.trim()) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: geminiResponse.trim(),
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      // Fall through gracefully to deterministic meteorological reasoning engine
    }
  }

  // 4. Meteorological Rule Engine Fallback with Language & Weekly Forecast Support
  const responseText = generateContextualWeatherResponse(message, language, isWeekly, weather, forecast, risks);

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
  };
}

async function callGeminiApi(
  apiKey: string,
  userMessage: string,
  language: DetectedLanguage,
  isWeekly: boolean,
  weather: { location: string; region?: string; country?: string; temperature: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; visibility: number; pressure: number; uvIndex: number; condition: { main: string; description: string } },
  forecast: Array<{ date: string; day: string; high: number; low: number; condition: { main: string }; rainProbability: number }>,
  risks: Array<{ title: string; level: string; description: string; timePeriod: string; isActive: boolean }>
): Promise<string | null> {
  let languageDirective = '';

  if (language === 'hindi') {
    languageDirective = `CRITICAL MANDATORY LANGUAGE REQUIREMENT:
- You MUST write your entire response strictly in HINDI using the DEVANAGARI script (हिंदी लिपि).
- Do NOT reply in English. Do NOT write Hindi words using the English alphabet.
- Use natural, accurate Hindi for weather terms (जैसे: तापमान, बारिश/वर्षा, बादल, आर्द्रता/नमी, हवा की गति, यूवी इंडेक्स, सावधानी).`;
  } else if (language === 'hinglish') {
    languageDirective = `CRITICAL MANDATORY LANGUAGE REQUIREMENT:
- The user is communicating in Hinglish (Hindi written using English/Latin alphabet).
- You MUST respond naturally in HINGLISH using the Latin/English alphabet (e.g. "Aaj New Delhi mein...", "Baarish hone ki sambhavna...").
- Match the user's conversational Hinglish style. Do not respond in pure English or pure Devanagari.`;
  } else {
    languageDirective = `CRITICAL MANDATORY LANGUAGE REQUIREMENT:
- Respond in clear, concise ENGLISH.`;
  }

  const weeklyDirective = isWeekly
    ? `CRITICAL MANDATORY 7-DAY FORECAST REQUIREMENT:
- The user is asking for the weekly / 7-day forecast for ${weather.location}.
- You MUST list ALL ${forecast.length} supplied forecast days in exact chronological order.
- For each day, include: Day, Date, High temp, Low temp, Condition, and Rain probability%.
- Use ONLY the supplied forecast data below. Do NOT invent, change, estimate, or omit any values.`
    : '';

  const systemPrompt = `You are WeatherGPT, an AI-powered conversational weather intelligence platform for the Smart India Hackathon (SIH 2026).
Your goal is to provide clear, actionable, accurate, and concise weather answers based on the live meteorological telemetry provided below.

Target Weather Location: ${weather.location}, ${weather.region || ''} ${weather.country || ''}
(Note: All data provided below is strictly for ${weather.location}. Explicitly refer to ${weather.location} in your response.)

${languageDirective}

${weeklyDirective}

Live Meteorological Telemetry for ${weather.location}:
- Location: ${weather.location}, ${weather.region || ''} ${weather.country || ''}
- Current Temp: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Condition: ${weather.condition.main} (${weather.condition.description})
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} km/h from ${weather.windDirection}
- Visibility: ${weather.visibility} km
- Atmospheric Pressure: ${weather.pressure} hPa
- UV Index: ${weather.uvIndex}

Forecast (Upcoming Days for ${weather.location}):
${forecast.map((f) => `- ${f.day} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`).join('\n')}

Active Risks / Alerts for ${weather.location}:
${risks.length > 0 ? risks.map((r) => `- [${r.level.toUpperCase()}] ${r.title}: ${r.description} (${r.timePeriod})`).join('\n') : 'No severe alerts currently active.'}

Formatting Instructions:
- Answer the user's question directly, conversationally, and accurately using the live data above for ${weather.location}.
- Mention specific temperatures, rain probabilities, or precautions when relevant.
${isWeekly ? '- Format the complete 7-day forecast clearly with bullet points for every supplied day.' : '- Keep the response concise, practical, and easy to read (2-4 sentences).'}`;

  // Standard gemini models
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nUser Question: ${userMessage}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          }
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };

        const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) return reply.trim();
      }
    } catch {
      // Continue to next model
    }
  }

  return null;
}

function generateContextualWeatherResponse(
  query: string,
  language: DetectedLanguage,
  isWeekly: boolean,
  weather: { location: string; temperature: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; uvIndex: number; condition: { main: string; description: string } },
  forecast: Array<{ day: string; date: string; high: number; low: number; condition: { main: string }; rainProbability: number }>,
  risks: Array<{ title: string; level: string; description: string; isActive: boolean }>
): string {
  const q = query.toLowerCase();
  const todayForecast = forecast[0];
  const rainChance = todayForecast ? todayForecast.rainProbability : 20;

  // --- WEEKLY FORECAST FALLBACK ---
  if (isWeekly && forecast.length > 0) {
    if (language === 'hindi') {
      const lines = forecast.map(
        (f) => `• ${f.day} (${f.date}): अधिकतम ${f.high}°C / न्यूनतम ${f.low}°C, ${f.condition.main}, बारिश: ${f.rainProbability}%`
      );
      return `${weather.location} के लिए 7 दिनों का मौसम पूर्वानुमान:\n\n${lines.join('\n')}`;
    }
    if (language === 'hinglish') {
      const lines = forecast.map(
        (f) => `• ${f.day} (${f.date}): High ${f.high}°C / Low ${f.low}°C, ${f.condition.main}, Rain chance: ${f.rainProbability}%`
      );
      return `Yeh raha ${weather.location} ka weekly forecast:\n\n${lines.join('\n')}`;
    }
    const lines = forecast.map(
      (f) => `• ${f.day} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`
    );
    return `Here is the complete 7-day forecast for ${weather.location}:\n\n${lines.join('\n')}`;
  }

  // --- HINDI (Devanagari) Fallback ---
  if (language === 'hindi') {
    if (q.includes('बारिश') || q.includes('वर्षा') || q.includes('पानी') || q.includes('rain')) {
      if (rainChance > 50) {
        return `आज ${weather.location} में बारिश होने की ${rainChance}% संभावना है। यदि आप बाहर जा रहे हैं, तो छाता साथ रखना सुरक्षित रहेगा।`;
      }
      return `आज ${weather.location} में बारिश की संभावना केवल ${rainChance}% है। आसमान में ज्यादातर ${weather.condition.main === 'Overcast' ? 'बादल छाए रहेंगे' : weather.condition.main}।`;
    }

    if (q.includes('तापमान') || q.includes('गर्मी') || q.includes('मौसम') || q.includes('temp') || q.includes('hot')) {
      return `${weather.location} में वर्तमान तापमान ${weather.temperature}°C है (महसूस ${weather.feelsLike}°C हो रहा है)। नमी ${weather.humidity}% है और हवा ${weather.windSpeed} किमी/घंटा की गति से चल रही है।`;
    }

    if (q.includes('कल') || q.includes('tomorrow')) {
      const tomorrow = forecast[1] || forecast[0];
      return `कल ${weather.location} में अधिकतम तापमान ${tomorrow.high}°C और न्यूनतम तापमान ${tomorrow.low}°C रहने का अनुमान है। बारिश की संभावना ${tomorrow.rainProbability}% है।`;
    }

    return `वर्तमान में ${weather.location} में तापमान ${weather.temperature}°C है और मौसम ${weather.condition.main} बना हुआ है। नमी ${weather.humidity}% और हवा की गति ${weather.windSpeed} किमी/घंटा है।`;
  }

  // --- HINGLISH Fallback ---
  if (language === 'hinglish') {
    if (q.includes('baarish') || q.includes('barish') || q.includes('rain')) {
      if (rainChance > 50) {
        return `Aaj ${weather.location} mein baarish hone ke ${rainChance}% chances hain. Agar aap bahar ja rahe hain toh umbrella zaroor carry karein.`;
      }
      return `Aaj ${weather.location} mein baarish ki sambhavna kafi kam (${rainChance}%) hai. Aasman mein mostly ${weather.condition.main.toLowerCase()} rahega.`;
    }

    if (q.includes('mausam') || q.includes('mosam') || q.includes('temp') || q.includes('garmi')) {
      return `${weather.location} mein abhi temperature ${weather.temperature}°C hai (feels like ${weather.feelsLike}°C). Humidity ${weather.humidity}% hai aur hawa ${weather.windSpeed} km/h ki speed se chal rahi hai.`;
    }

    if (q.includes('kal')) {
      const tomorrow = forecast[1] || forecast[0];
      return `Kal ${weather.location} mein high temperature ${tomorrow.high}°C aur low ${tomorrow.low}°C rahega, with ${tomorrow.rainProbability}% rain chance.`;
    }

    return `Abhi ${weather.location} mein temperature ${weather.temperature}°C (${weather.condition.main}) hai aur humidity ${weather.humidity}% hai. Aap weather se related aur kya janna chahte hain?`;
  }

  // --- ENGLISH Fallback ---
  if (q.includes('rain') || q.includes('precipitation') || q.includes('umbrella') || q.includes('shower')) {
    if (rainChance > 50) {
      return `There is a significant chance of rain (${rainChance}%) in ${weather.location} today. We recommend carrying rain protection if you are stepping out.`;
    }
    return `Rain probability for ${weather.location} is currently low at ${rainChance}%. Skies are predominantly ${weather.condition.main.toLowerCase()}.`;
  }

  if (q.includes('temp') || q.includes('hot') || q.includes('heat') || q.includes('warm') || q.includes('cold')) {
    const heatRisk = risks.find((r) => r.level === 'high' || r.level === 'severe');
    let extra = '';
    if (heatRisk && heatRisk.isActive) {
      extra = ` Notice: Active ${heatRisk.title} — ${heatRisk.description}`;
    }
    return `Current temperature in ${weather.location} is ${weather.temperature}°C (feels like ${weather.feelsLike}°C). Humidity is at ${weather.humidity}% with a UV Index of ${weather.uvIndex}.${extra}`;
  }

  if (q.includes('tomorrow')) {
    const tomorrow = forecast[1] || forecast[0];
    if (tomorrow) {
      return `Tomorrow's forecast for ${weather.location} predicts ${tomorrow.condition.main} conditions with a high of ${tomorrow.high}°C and a low of ${tomorrow.low}°C. Precipitation chance is ${tomorrow.rainProbability}%.`;
    }
  }

  return `Currently in ${weather.location}, the temperature is ${weather.temperature}°C (${weather.condition.main}) with ${weather.humidity}% humidity and ${weather.windSpeed} km/h winds. How else can I assist with your meteorological inquiries?`;
}
