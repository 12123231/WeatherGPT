import type { ChatMessage, ForecastDay, HourlyForecast, CurrentWeather, WeatherRisk } from '../types/index.js';
import { getCurrentWeather, getForecast, getWeatherRisks, getHourlyForecast, searchLocations } from './weatherService.js';

export type DetectedLanguage = 'hindi' | 'hinglish' | 'english';

export type WeatherIntent =
  | 'comparison_hottest'
  | 'comparison_coolest'
  | 'comparison_rain'
  | 'rain_3day'
  | 'forecast_3day'
  | 'day_after_tomorrow'
  | 'tomorrow'
  | 'rain_today'
  | 'temp_today'
  | 'weekend'
  | 'evening'
  | 'tonight'
  | 'travel'
  | 'current';

export interface ConversationContext {
  activeLocation: string | null;
  activeIntent: WeatherIntent | null;
  lastUpdated: number;
}

const conversationSessions = new Map<string, ConversationContext>();

export function getOrCreateSession(sessionId: string = 'default-session'): ConversationContext {
  let session = conversationSessions.get(sessionId);
  if (!session) {
    session = {
      activeLocation: null,
      activeIntent: null,
      lastUpdated: Date.now(),
    };
    conversationSessions.set(sessionId, session);
  }
  return session;
}

export function resetConversationState(sessionId?: string): void {
  if (sessionId) {
    conversationSessions.delete(sessionId);
  } else {
    conversationSessions.clear();
  }
}

/**
 * Hindi transliteration mapping for common Indian cities to ensure accurate WeatherAPI resolution.
 */
const HINDI_CITY_MAP: Record<string, string> = {
  'नई दिल्ली': 'New Delhi',
  'दिल्ली': 'Delhi',
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
  'काशी': 'Varanasi',
  'बनारस': 'Varanasi',
  'आगरा': 'Agra',
};

/**
 * Common English and romanized Indian city aliases.
 */
const KNOWN_CITY_ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  bengalooru: 'Bengaluru',
  delhi: 'Delhi',
  'new delhi': 'New Delhi',
  mumbai: 'Mumbai',
  bombay: 'Mumbai',
  bambai: 'Mumbai',
  kolkata: 'Kolkata',
  calcutta: 'Kolkata',
  chennai: 'Chennai',
  madras: 'Chennai',
  jaipur: 'Jaipur',
  pune: 'Pune',
  poona: 'Pune',
  hyderabad: 'Hyderabad',
  lucknow: 'Lucknow',
  ahmedabad: 'Ahmedabad',
  chandigarh: 'Chandigarh',
  shimla: 'Shimla',
  goa: 'Goa',
  patna: 'Patna',
  bhopal: 'Bhopal',
  indore: 'Indore',
  surat: 'Surat',
  kanpur: 'Kanpur',
  nagpur: 'Nagpur',
  varanasi: 'Varanasi',
  kashi: 'Varanasi',
  banaras: 'Varanasi',
  agra: 'Agra',
};

const HINDI_DAY_NAMES: Record<string, string> = {
  Sunday: 'रविवार',
  Monday: 'सोमवार',
  Tuesday: 'मंगलवार',
  Wednesday: 'बुधवार',
  Thursday: 'गुरुवार',
  Friday: 'शुक्रवार',
  Saturday: 'शनिवार',
  Sun: 'रविवार',
  Mon: 'सोमवार',
  Tue: 'मंगलवार',
  Wed: 'बुधवार',
  Thu: 'गुरुवार',
  Fri: 'शुक्रवार',
  Sat: 'शनिवार',
};

/**
 * Common non-location words and stopwords that must not be treated as city names.
 */
const NON_LOCATION_WORDS = new Set([
  'today', 'tomorrow', 'tonight', 'yesterday', 'weather', 'forecast', 'rain',
  'raining', 'rainy', 'rains', 'temperature', 'temp', 'humidity', 'wind', 'sun', 'sunny',
  'hot', 'hotter', 'hottest', 'cold', 'colder', 'coldest', 'heat', 'warm', 'air', 'quality', 'aqi',
  'here', 'there', 'now', 'this', 'that', 'these', 'those',
  'week', 'weekly', 'weekend', 'days', 'day', 'next', 'current', 'live', 'morning',
  'evening', 'afternoon', 'night', 'hourly', 'daily', 'safe', 'safety', 'travel',
  'umbrella', 'report', 'update', 'status', 'condition', 'conditions', 'alerts',
  'warning', 'advisories', 'advice', 'help', 'info', 'information', 'details',
  'please', 'tell', 'give', 'show', 'check', 'know', 'can', 'will', 'what', 'how',
  'whats', "what's", 'hows', "how's", 'is', 'are', 'was', 'were', 'the', 'a', 'an',
  'in', 'of', 'for', 'at', 'near', 'to', 'from', 'with', 'about', 'like', 'and', 'or', 'but', 'yet', 'nor',
  'it', 'its', "it's", 'me', 'my', 'us', 'our', 'you', 'your', 'going',
  'does', 'do', 'did', 'would', 'should', 'could', 'be', 'been', 'having', 'have', 'has',
  'any', 'some', 'much', 'many', 'very', 'too', 'also', 'just', 'so', 'as',
  'city', 'place', 'location', 'area', 'region', 'zone', 'state', 'country', 'world',
  'sky', 'skies', 'cloud', 'clouds', 'cloudy', 'clear', 'overcast', 'thunder', 'storm',
  'visibility', 'pressure', 'chance', 'chances', 'probability', 'probabilities', 'breeze',
  'instead', 'rather', 'which', 'highest', 'lowest', 'most', 'least', 'after', 'before',
  'overmorrow', 'compare', 'comparison', 'versus', 'vs', 'difference', 'better', 'worse',
  'aaj', 'kal', 'parson', 'parso', 'kya', 'hai', 'hain', 'hein', 'hoga', 'hogi', 'honge',
  'batao', 'bataiye', 'bataye', 'bata', 'bolo', 'mausam', 'mosam', 'baarish', 'barish', 'barsaat',
  'garmi', 'thand', 'sardi', 'hawa', 'badal', 'dhoop', 'chahiye', 'chhatri', 'chhata',
  'safari', 'safar', 'mein', 'mai', 'me', 'pe', 'par', 'ka', 'ki', 'ke', 'ko', 'se',
  'rahega', 'rahegi', 'rahenge', 'kaisa', 'kaisi', 'kaise', 'kitna', 'kitni', 'kitne',
  'yahan', 'yaha', 'wahan', 'waha', 'abhi', 'idhar', 'udhar', 'kripya', 'shahar', 'jagah',
  'din', 'dino', 'dina', 'agle', 'agla', 'agli', 'aane', 'wale', 'bhi', 'toh', 'then',
  'teen', 'kaun', 'kaunsa', 'kaunsi', 'kis', 'sabse', 'zyada', 'jyada', 'adhik', 'kam',
  'आज', 'कल', 'परसों', 'क्या', 'है', 'हैं', 'होगा', 'होगी', 'होंगे', 'बताओ', 'बताइए',
  'बताएं', 'मौसम', 'बारिश', 'वर्षा', 'बरसात', 'पानी', 'गर्मी', 'ठंड', 'सर्दी', 'हवा',
  'बादल', 'धूप', 'चाहिए', 'छाता', 'छतरी', 'सफर', 'में', 'पे', 'पर', 'का', 'की', 'के',
  'को', 'से', 'रहेगा', 'रहेगी', 'रहेंगे', 'कैसा', 'कैसी', 'कैसे', 'कितना', 'कितनी',
  'कितने', 'यहाँ', 'वहाँ', 'अभी', 'इधर', 'उधर', 'कृपया', 'शहर', 'जगह',
  'दिनों', 'दिन', 'तीन', 'अगले', 'अगला', 'आने', 'वाले', 'कौन', 'कौनसा', 'किस',
  'सबसे', 'ज्यादा', 'अधिक', 'कम', 'हफ्ते', 'सप्ताह', 'हाल'
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
    'aaj', 'kal', 'parson', 'parso', 'kya', 'hogi', 'hoga', 'honge', 'baarish', 'barish',
    'barsaat', 'mausam', 'mosam', 'kaisa', 'kaisi', 'kaise', 'hai', 'hain', 'hein',
    'batao', 'bataiye', 'bataye', 'garmi', 'thand', 'hawa', 'badal', 'dhoop',
    'kripya', 'aap', 'tum', 'mein', 'mai', 'pe', 'rahega', 'rahegi', 'chahiye',
    'chhatri', 'safari', 'jaana', 'ja sakte', 'safar', 'safe hai', 'kitna', 'kitni',
    'agle', 'agla', 'dino', 'sabse', 'kaun'
  ];

  const words = text.replace(/[^\w\s]/g, '').split(/\s+/);
  const matchCount = words.filter((w) => hinglishTokens.includes(w)).length;

  if (matchCount >= 2 || (words.length <= 4 && matchCount >= 1)) {
    return 'hinglish';
  }

  return 'english';
}

/**
 * Structured intent classification across English, Hindi, and Hinglish.
 */
export function detectWeatherIntent(message: string): WeatherIntent | null {
  const text = message.trim().toLowerCase();

  // 1. Comparison: Hottest Day
  const isHottestComparison =
    text.includes('hottest') ||
    text.includes('most hot') ||
    text.includes('highest temp') ||
    text.includes('maximum temp') ||
    text.includes('highest temperature') ||
    text.includes('max temp') ||
    text.includes('sabse garam') ||
    text.includes('sabse garmi') ||
    text.includes('sabse jyada temp') ||
    text.includes('sabse zyada temp') ||
    text.includes('sabse jyada garmi') ||
    text.includes('sabse zyada garmi') ||
    text.includes('सबसे गर्म') ||
    text.includes('सबसे ज्यादा गर्मी') ||
    text.includes('सबसे ज्यादा तापमान') ||
    text.includes('अधिकतम तापमान वाला दिन') ||
    (text.includes('garam') && (text.includes('kaun') || text.includes('kon') || text.includes('which')));

  if (isHottestComparison) {
    return 'comparison_hottest';
  }

  // 2. Comparison: Coolest / Coldest Day
  const isCoolestComparison =
    text.includes('coolest') ||
    text.includes('coldest') ||
    text.includes('lowest temp') ||
    text.includes('minimum temp') ||
    text.includes('lowest temperature') ||
    text.includes('min temp') ||
    text.includes('sabse thand') ||
    text.includes('sabse thanda') ||
    text.includes('sabse sardi') ||
    text.includes('sabse kam temp') ||
    text.includes('सबसे ठंडा') ||
    text.includes('सबसे ठंडी') ||
    text.includes('सबसे कम तापमान') ||
    (text.includes('thand') && (text.includes('kaun') || text.includes('kon') || text.includes('which')));

  if (isCoolestComparison) {
    return 'comparison_coolest';
  }

  // 3. Comparison: Highest Chance of Rain
  const isRainComparison =
    ((text.includes('highest') || text.includes('most') || text.includes('maximum') || text.includes('greatest') || text.includes('peak')) &&
      (text.includes('rain') || text.includes('precipitation') || text.includes('baarish') || text.includes('barish') || text.includes('barsaat'))) ||
    text.includes('sabse zyada baarish') ||
    text.includes('sabse jyada baarish') ||
    text.includes('sabse zyada barish') ||
    text.includes('sabse jyada barish') ||
    text.includes('sabse adhik barish') ||
    text.includes('sabse adhik baarish') ||
    text.includes('सबसे ज्यादा बारिश') ||
    text.includes('सबसे ज्यादा वर्षा') ||
    text.includes('सबसे अधिक बारिश') ||
    text.includes('सबसे अधिक वर्षा') ||
    text.includes('किस दिन सबसे ज्यादा बारिश') ||
    ((text.includes('which day') || text.includes('what day') || text.includes('kis din') || text.includes('kon sa din') || text.includes('kaun sa din')) &&
      (text.includes('rain') || text.includes('baarish') || text.includes('barish')));

  if (isRainComparison) {
    return 'comparison_rain';
  }

  // 4. Multi-day Rain Intent (Bug 3)
  const hasRainWord =
    text.includes('rain') ||
    text.includes('raining') ||
    text.includes('rainy') ||
    text.includes('precipitation') ||
    text.includes('shower') ||
    text.includes('baarish') ||
    text.includes('barish') ||
    text.includes('barsaat') ||
    text.includes('बारिश') ||
    text.includes('वर्षा') ||
    text.includes('बरसात') ||
    text.includes('पानी');

  const hasMultiDayWord =
    text.includes('3 day') ||
    text.includes('3-day') ||
    text.includes('3 days') ||
    text.includes('three day') ||
    text.includes('three days') ||
    text.includes('next 3') ||
    text.includes('next 3 days') ||
    text.includes('agle 3') ||
    text.includes('agla 3') ||
    text.includes('agle teen') ||
    text.includes('3 din') ||
    text.includes('3 dino') ||
    text.includes('teen din') ||
    text.includes('teen dino') ||
    text.includes('3 दिन') ||
    text.includes('3 दिनों') ||
    text.includes('तीन दिन') ||
    text.includes('तीन दिनों') ||
    text.includes('अगले 3') ||
    text.includes('अगले तीन');

  if (hasRainWord && hasMultiDayWord) {
    return 'rain_3day';
  }

  // 5a. Weekend — must be before forecast_3day because "forecast for this weekend" contains "forecast"
  const isWeekend =
    text.includes('this weekend') ||
    text.includes('the weekend') ||
    text.includes('weekend forecast') ||
    text.includes('weekend weather') ||
    text.includes('on the weekend') ||
    text.includes('for the weekend') ||
    text.includes('इस सप्ताहांत') ||
    text.includes('weekend mein') ||
    text.includes('shaniwar') ||
    text.includes('raviwar') ||
    (text.includes('weekend') && (text.includes('will') || text.includes('forecast') || text.includes('rain') || text.includes('hot') || text.includes('weather')));

  if (isWeekend) {
    return 'weekend';
  }

  // 5b. Evening — this evening / tonight
  const isEvening =
    text.includes('this evening') ||
    text.includes('this afternoon') ||
    text.includes('shaam') ||
    text.includes('शाम') ||
    text.includes('शाम को') ||
    (text.includes('evening') && (text.includes('weather') || text.includes('forecast') || text.includes('rain') || text.includes('travel') || text.includes('safe') || text.includes('it be') || text.includes('will')));

  if (isEvening) {
    return 'evening';
  }

  const isTonight =
    text.includes('tonight') ||
    text.includes('aaj raat') ||
    text.includes('आज रात') ||
    (text.includes('night') && (text.includes('weather') || text.includes('forecast') || text.includes('rain') || text.includes('travel') || text.includes('safe') || text.includes('will')));

  if (isTonight) {
    return 'tonight';
  }

  // 5c. Travel safety — "is it safe to travel", "safe to go out", etc.
  const isTravel =
    text.includes('safe to travel') ||
    text.includes('travel safe') ||
    text.includes('safe to drive') ||
    text.includes('safe to go') ||
    text.includes('safe to fly') ||
    text.includes('should i travel') ||
    text.includes('can i travel') ||
    text.includes('go outside') ||
    text.includes('go out') ||
    text.includes('safar karna') ||
    text.includes('safar safe') ||
    (text.includes('travel') && (text.includes('safe') || text.includes('conditions') || text.includes('weather')));

  if (isTravel) {
    return 'travel';
  }

  // 5. 3-Day / Multi-Day General Forecast
  if (
    hasMultiDayWord ||
    text.includes('forecast') ||
    text.includes('weekly') ||
    text.includes('week forecast') ||
    text.includes('next 7 days') ||
    text.includes('extended forecast') ||
    text.includes('complete forecast') ||
    text.includes('हफ्ते') ||
    text.includes('सप्ताह') ||
    text.includes('hafta') ||
    text.includes('hafte')
  ) {
    return 'forecast_3day';
  }

  // 6. Day After Tomorrow - MUST BE CHECKED BEFORE "tomorrow"
  if (
    text.includes('day after tomorrow') ||
    text.includes('day after') ||
    text.includes('overmorrow') ||
    text.includes('parson') ||
    text.includes('parso') ||
    text.includes('परसों')
  ) {
    return 'day_after_tomorrow';
  }

  // 7. Tomorrow
  if (
    text.includes('tomorrow') ||
    text.includes('kal') ||
    text.includes('कल')
  ) {
    return 'tomorrow';
  }

  // 8. Rain Today
  if (hasRainWord) {
    return 'rain_today';
  }

  // 9. Temperature / Heat / Cold Today
  if (
    text.includes('temp') ||
    text.includes('temperature') ||
    text.includes('hot') ||
    text.includes('cold') ||
    text.includes('heat') ||
    text.includes('warm') ||
    text.includes('garmi') ||
    text.includes('thand') ||
    text.includes('sardi') ||
    text.includes('तापमान') ||
    text.includes('गर्मी') ||
    text.includes('ठंड') ||
    text.includes('सर्दी')
  ) {
    return 'temp_today';
  }

  // 10. General current weather
  if (
    text.includes('weather') ||
    text.includes('climate') ||
    text.includes('mausam') ||
    text.includes('mosam') ||
    text.includes('मौसम') ||
    text.includes('kaisa') ||
    text.includes('kaisi') ||
    text.includes('kaise') ||
    text.includes('हाल')
  ) {
    return 'current';
  }

  return null;
}

/**
 * Helper to clean and validate potential candidate location strings.
 */
function cleanAndValidateCandidate(rawCandidate: string): string | null {
  if (!rawCandidate) return null;

  const words = rawCandidate
    .replace(/[^\w\s\u0900-\u097F-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // Strip leading stopwords
  while (words.length > 0 && NON_LOCATION_WORDS.has(words[0].toLowerCase())) {
    words.shift();
  }
  // Strip trailing stopwords
  while (words.length > 0 && NON_LOCATION_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  if (words.length === 0) return null;

  const cleaned = words.join(' ').trim();
  if (cleaned.length < 2) return null;

  if (words.every((w) => NON_LOCATION_WORDS.has(w.toLowerCase()))) {
    return null;
  }

  return cleaned;
}

/**
 * Resolves a candidate string against known maps or live search API.
 */
async function resolveLocationCandidate(candidate: string): Promise<string | null> {
  const lower = candidate.toLowerCase();

  // 1. Check Hindi transliteration mapping
  if (HINDI_CITY_MAP[candidate]) {
    return HINDI_CITY_MAP[candidate];
  }

  // 2. Check known aliases
  if (KNOWN_CITY_ALIASES[lower]) {
    return KNOWN_CITY_ALIASES[lower];
  }

  // 3. Reject if candidate is a known non-location word or too short
  if (NON_LOCATION_WORDS.has(lower) || candidate.length < 2) {
    return null;
  }

  // 4. Verify candidate with searchLocations()
  try {
    const searchResults = await searchLocations(candidate);
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      const match = searchResults.find(
        (loc) =>
          loc.name.toLowerCase() === lower ||
          (lower.length >= 4 && loc.name.toLowerCase().startsWith(lower)) ||
          (lower.length >= 5 && loc.name.toLowerCase().includes(lower))
      );
      if (match) {
        return match.name;
      }
    }
  } catch {
    if (candidate.length >= 4 && !NON_LOCATION_WORDS.has(lower)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Extracts explicit location mentioned directly in the user message.
 * Returns null if no explicit location is found.
 */
export async function extractExplicitLocationFromMessage(message: string): Promise<string | null> {
  if (!message || !message.trim()) return null;

  const raw = message.trim();

  // 1. Direct Devanagari Hindi City Match
  const devanagariKeys = Object.keys(HINDI_CITY_MAP).sort((a, b) => b.length - a.length);
  for (const hindiCity of devanagariKeys) {
    if (raw.includes(hindiCity)) {
      return HINDI_CITY_MAP[hindiCity];
    }
  }

  // 2. Structured pattern candidate extraction
  const candidatePatterns = [
    // Preposition patterns: "weather in Delhi", "forecast for Mumbai", "temperature of Kolkata", "about Goa"
    /(?:^|\s+)(?:in|of|for|at|around|near|to|about)\s+([a-zA-Z\u0900-\u097F\s-]{2,30}?)(?=[?,.!;:]|\s+(?:today|tomorrow|tonight|now|this|please|right|next|weather|forecast|kaisa|kaisi|mein|mai|me|ka|ki|ke|pe|par|instead)|$)/gi,
    // Leading location patterns: "Delhi weather", "Mumbai 7 day forecast", "Jaipur temperature", "Bangalore tomorrow"
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s-]{2,30}?)\s+(?:weather|forecast|temperature|temp|climate|alerts?|mausam|mosam|baarish|barish|garmi|thand|today|tomorrow|tonight)(?:\s+|$|[?,.!;:])/gi,
    // Hindi/Hinglish postposition patterns: "Delhi mein", "Mumbai ka mausam", "दिल्ली में", "जयपुर का"
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s-]{2,30}?)\s+(?:mein|mai|me|ka|ki|ke|pe|par|se|में|का|की|के|पर|से)(?:\s+|$|[?,.!;:])/gi,
    // Pivot / substitution patterns: "Chandigarh instead", "Pune instead"
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s-]{2,30}?)\s+(?:instead|rather)(?:\s+|$|[?,.!;:])/gi,
    // Question / query patterns: "how hot is Mumbai?", "what about Chandigarh instead?"
    /(?:^|\s+)(?:how(?:'s|\s+is|\s+hot\s+is|\s+cold\s+is|\s+warm\s+is|\s+about)?|what\s+about|how\s+about|check|show)\s+([a-zA-Z\u0900-\u097F\s-]{2,30}?)(?=[?,.!;:]|\s+(?:today|tomorrow|tonight|now|this|please|right|next|weather|forecast|instead)|$)/gi,
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

  for (const rawCandidate of extractedCandidates) {
    const candidate = cleanAndValidateCandidate(rawCandidate);
    if (!candidate) continue;

    const resolved = await resolveLocationCandidate(candidate);
    if (resolved) {
      return resolved;
    }
  }

  // 3. Sliding token window extraction (2-word phrases first, then 1-word tokens)
  const words = raw
    .replace(/[^\w\s\u0900-\u097F-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`.trim();
    const candidate = cleanAndValidateCandidate(twoWord);
    if (!candidate) continue;

    const resolved = await resolveLocationCandidate(candidate);
    if (resolved) {
      return resolved;
    }
  }

  for (const word of words) {
    const candidate = cleanAndValidateCandidate(word);
    if (!candidate) continue;

    const resolved = await resolveLocationCandidate(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

/**
 * Extracts and resolves a location from message, falling back to fallbackLocation.
 */
export async function extractLocationFromMessage(message: string, fallbackLocation: string): Promise<string> {
  const explicit = await extractExplicitLocationFromMessage(message);
  return explicit || fallbackLocation;
}

/**
 * Returns a displayable day name formatted for the user language.
 */
function getDisplayDayName(forecastDay: { day: string; date: string }, index: number, language: DetectedLanguage): string {
  if (index === 0) {
    return language === 'hindi' ? 'आज' : 'Today';
  }
  if (index === 1) {
    return language === 'hindi' ? 'कल' : 'Tomorrow';
  }

  const dateObj = new Date(forecastDay.date + 'T00:00:00');
  const fullWeekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  if (language === 'hindi') {
    return HINDI_DAY_NAMES[fullWeekday] || HINDI_DAY_NAMES[forecastDay.day] || fullWeekday;
  }
  return fullWeekday;
}

/**
 * BUG 3: Generates full 3-day precipitation analysis evaluating all three forecast days.
 */
function generateMultiDayRainResponse(
  location: string,
  forecast: ForecastDay[],
  language: DetectedLanguage
): string {
  if (!forecast || forecast.length === 0) {
    return `Forecast data is temporarily unavailable for ${location}.`;
  }

  const days = forecast.slice(0, 3);
  const dayLines = days.map((f, idx) => {
    const label = getDisplayDayName(f, idx, language);
    return `${label}: ${f.rainProbability}%`;
  });

  const maxDay = days.reduce((max, d) => (d.rainProbability > max.rainProbability ? d : max), days[0]);
  const maxDayIdx = days.indexOf(maxDay);
  const maxDayLabel = getDisplayDayName(maxDay, maxDayIdx, language);
  const rainDaysCount = days.filter((d) => d.rainProbability >= 40).length;

  if (language === 'hindi') {
    let summary = '';
    if (rainDaysCount === 3) {
      summary = `तीनों दिन बारिश की संभावना है, जिसमें ${maxDayLabel} को सबसे अधिक (${maxDay.rainProbability}%) संभावना है।`;
    } else if (rainDaysCount > 0) {
      summary = `अगले 3 दिनों में बारिश की संभावना बनी हुई है, जिसमें ${maxDayLabel} को सबसे अधिक (${maxDay.rainProbability}%) संभावना है।`;
    } else {
      summary = `अगले 3 दिनों में बारिश की संभावना कम है, जिसमें ${maxDayLabel} को अधिकतम ${maxDay.rainProbability}% संभावना है।`;
    }
    return `${location} में अगले 3 दिनों में बारिश का पूर्वानुमान:\n\n${dayLines.join('\n')}\n\n${summary}`;
  }

  if (language === 'hinglish') {
    let summary = '';
    if (rainDaysCount === 3) {
      summary = `Teeno din baarish ki sambhavna hai, jisme sabse zyada chance ${maxDayLabel} (${maxDay.rainProbability}%) ko hai.`;
    } else if (rainDaysCount > 0) {
      summary = `Agle 3 dino mein baarish ke chances hain, jisme highest probability ${maxDayLabel} (${maxDay.rainProbability}%) ko hai.`;
    } else {
      summary = `Agle 3 dino mein baarish ke chances kam hain, highest chance ${maxDayLabel} ko ${maxDay.rainProbability}% hai.`;
    }
    return `${location} mein agle 3 dino ke liye baarish ka forecast:\n\n${dayLines.join('\n')}\n\n${summary}`;
  }

  // English
  let summary = '';
  if (rainDaysCount === 3) {
    summary = `Rain is possible on all three days, with the highest chance on ${maxDayLabel} (${maxDay.rainProbability}%).`;
  } else if (rainDaysCount > 0) {
    summary = `Rain is possible over the next 3 days, with the highest chance on ${maxDayLabel} (${maxDay.rainProbability}%).`;
  } else {
    summary = `Rain chances remain low across all three days, peaking at ${maxDay.rainProbability}% on ${maxDayLabel}.`;
  }
  return `Rain forecast for ${location} over the next 3 days:\n\n${dayLines.join('\n')}\n\n${summary}`;
}

/**
 * BUG 4: Generates forecast comparison answers across all 3 days.
 */
function generateForecastComparisonResponse(
  location: string,
  forecast: ForecastDay[],
  comparisonType: 'hottest' | 'coolest' | 'rain',
  language: DetectedLanguage
): string {
  if (!forecast || forecast.length === 0) {
    return `Forecast data is temporarily unavailable for ${location}.`;
  }

  const days = forecast.slice(0, 3);

  if (comparisonType === 'hottest') {
    const dayLines = days.map((f, idx) => {
      const label = getDisplayDayName(f, idx, language);
      return `${label}: ${f.high}°C`;
    });
    const hottest = days.reduce((max, d) => (d.high > max.high ? d : max), days[0]);
    const hottestIdx = days.indexOf(hottest);
    const hottestLabel = getDisplayDayName(hottest, hottestIdx, language);

    if (language === 'hindi') {
      return `${dayLines.join('\n')}\n\n${hottestLabel} सबसे गर्म दिन रहेगा, जिसमें अधिकतम तापमान ${hottest.high}°C रहने का अनुमान है।`;
    }
    if (language === 'hinglish') {
      return `${dayLines.join('\n')}\n\n${hottestLabel} sabse garam din rahega, with a high of ${hottest.high}°C.`;
    }
    return `${dayLines.join('\n')}\n\n${hottestLabel} will be the hottest, with a high of ${hottest.high}°C.`;
  }

  if (comparisonType === 'coolest') {
    const dayLines = days.map((f, idx) => {
      const label = getDisplayDayName(f, idx, language);
      return `${label}: ${f.high}°C (Low: ${f.low}°C)`;
    });
    const coolest = days.reduce((min, d) => (d.high < min.high ? d : min), days[0]);
    const coolestIdx = days.indexOf(coolest);
    const coolestLabel = getDisplayDayName(coolest, coolestIdx, language);

    if (language === 'hindi') {
      return `${dayLines.join('\n')}\n\n${coolestLabel} सबसे ठंडा दिन रहेगा, जिसमें अधिकतम तापमान ${coolest.high}°C (न्यूनतम ${coolest.low}°C) रहेगा।`;
    }
    if (language === 'hinglish') {
      return `${dayLines.join('\n')}\n\n${coolestLabel} sabse thanda din rahega, with a high of ${coolest.high}°C (low of ${coolest.low}°C).`;
    }
    return `${dayLines.join('\n')}\n\n${coolestLabel} will be the coolest, with a high of ${coolest.high}°C (low of ${coolest.low}°C).`;
  }

  // Rain comparison
  const dayLines = days.map((f, idx) => {
    const label = getDisplayDayName(f, idx, language);
    return `${label}: ${f.rainProbability}%`;
  });
  const maxRain = days.reduce((max, d) => (d.rainProbability > max.rainProbability ? d : max), days[0]);
  const maxRainIdx = days.indexOf(maxRain);
  const maxRainLabel = getDisplayDayName(maxRain, maxRainIdx, language);

  if (language === 'hindi') {
    return `${dayLines.join('\n')}\n\n${location} में ${maxRainLabel} को बारिश की सबसे अधिक संभावना (${maxRain.rainProbability}%) है।`;
  }
  if (language === 'hinglish') {
    return `${dayLines.join('\n')}\n\n${maxRainLabel} will have the highest chance of rain in ${location}, with a ${maxRain.rainProbability}% probability.`;
  }
  return `${dayLines.join('\n')}\n\n${maxRainLabel} will have the highest chance of rain in ${location}, with a ${maxRain.rainProbability}% probability.`;
}

function generateDayAfterTomorrowResponse(
  location: string,
  forecast: ForecastDay[],
  language: DetectedLanguage
): string {
  const dayAfter = forecast[2] || forecast[1] || forecast[0];
  const dayLabel = getDisplayDayName(dayAfter, 2, language);

  if (language === 'hindi') {
    return `परसों (${dayLabel}) ${location} में अधिकतम तापमान ${dayAfter.high}°C और न्यूनतम तापमान ${dayAfter.low}°C रहने का अनुमान है। मौसम ${dayAfter.condition.main} रहेगा और बारिश की संभावना ${dayAfter.rainProbability}% है।`;
  }
  if (language === 'hinglish') {
    return `Parson (${dayLabel}) ${location} mein high temperature ${dayAfter.high}°C aur low ${dayAfter.low}°C rahega, with ${dayAfter.condition.main} conditions aur ${dayAfter.rainProbability}% rain chance.`;
  }
  return `The day after tomorrow (${dayLabel}) in ${location}, expect ${dayAfter.condition.main} conditions with a high of ${dayAfter.high}°C and a low of ${dayAfter.low}°C. Precipitation chance is ${dayAfter.rainProbability}%.`;
}

function generateTomorrowResponse(
  location: string,
  forecast: ForecastDay[],
  language: DetectedLanguage
): string {
  const tomorrow = forecast[1] || forecast[0];

  if (language === 'hindi') {
    return `कल ${location} में अधिकतम तापमान ${tomorrow.high}°C और न्यूनतम तापमान ${tomorrow.low}°C रहने का अनुमान है। मौसम ${tomorrow.condition.main} रहेगा और बारिश की संभावना ${tomorrow.rainProbability}% है।`;
  }
  if (language === 'hinglish') {
    return `Kal ${location} mein high temperature ${tomorrow.high}°C aur low ${tomorrow.low}°C rahega, with ${tomorrow.condition.main} conditions aur ${tomorrow.rainProbability}% rain chance.`;
  }
  return `Tomorrow's forecast for ${location} predicts ${tomorrow.condition.main} conditions with a high of ${tomorrow.high}°C and a low of ${tomorrow.low}°C. Precipitation chance is ${tomorrow.rainProbability}%.`;
}

/**
 * Generates a weekend forecast response. Checks available forecast data for upcoming
 * Saturday/Sunday dates. If the weekend is outside the 3-day window, informs the user.
 */
function generateWeekendResponse(
  location: string,
  forecast: ForecastDay[],
  language: DetectedLanguage
): string {
  // Identify upcoming Sat (6) and Sun (0) from the forecast dates
  const weekendDays = forecast.filter((f) => {
    const d = new Date(f.date + 'T00:00:00');
    const dow = d.getDay(); // 0 = Sunday, 6 = Saturday
    return dow === 0 || dow === 6;
  });

  if (weekendDays.length === 0) {
    // Determine actual upcoming weekend dates to tell the user using location local date
    const baseDate = forecast[0]?.date ? new Date(forecast[0].date + 'T00:00:00') : new Date();
    const todayDow = baseDate.getDay();
    const daysUntilSat = todayDow === 6 ? 7 : (6 - todayDow + 7) % 7 || 7;
    const nextSat = new Date(baseDate);
    nextSat.setDate(baseDate.getDate() + daysUntilSat);
    const nextSun = new Date(nextSat);
    nextSun.setDate(nextSat.getDate() + 1);
    const satStr = nextSat.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const sunStr = nextSun.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    // Show what we do have
    const available = forecast.map((f, idx) => {
      const label = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : f.day;
      return `• ${label} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`;
    });

    if (language === 'hindi') {
      return `${location} के लिए इस सप्ताहांत (${satStr}–${sunStr}) का पूर्वानुमान वर्तमान 3-दिन की फोरकास्ट विंडो में उपलब्ध नहीं है।\n\nउपलब्ध पूर्वानुमान:\n${available.join('\n')}`;
    }
    if (language === 'hinglish') {
      return `${location} ke liye is weekend (${satStr}–${sunStr}) ka forecast abhi available nahi hai — yeh 3-day forecast window se bahar hai.\n\nAvailable forecast:\n${available.join('\n')}`;
    }
    return `The weekend forecast for ${location} (${satStr}–${sunStr}) is not currently available — it falls outside the 3-day forecast window.\n\nHere is the available forecast:\n${available.join('\n')}`;
  }

  const lines = weekendDays.map((f) => {
    const d = new Date(f.date + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const hindiName = dayName === 'Saturday' ? 'शनिवार' : 'रविवार';
    if (language === 'hindi') {
      return `• ${hindiName} (${f.date}): अधिकतम ${f.high}°C / न्यूनतम ${f.low}°C, ${f.condition.main}, बारिश: ${f.rainProbability}%`;
    }
    return `• ${dayName} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`;
  });

  if (language === 'hindi') {
    return `${location} के लिए इस सप्ताहांत का पूर्वानुमान:\n\n${lines.join('\n')}`;
  }
  if (language === 'hinglish') {
    const hinglishLines = weekendDays.map((f) => {
      const d = new Date(f.date + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      return `• ${dayName} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`;
    });
    return `${location} ke liye is weekend ka forecast:\n\n${hinglishLines.join('\n')}`;
  }
  return `Weekend forecast for ${location}:\n\n${lines.join('\n')}`;
}

/**
 * Generates an evening weather advisory using today's hourly forecast for the 17:00–21:00 window.
 * Falls back to a note if hourly data is unavailable.
 */
function generateEveningResponse(
  location: string,
  hourly: HourlyForecast[],
  language: DetectedLanguage,
  isTravel: boolean,
  localTodayDate?: string
): string {
  // Filter to evening hours: 17 (5 PM) through 21 (9 PM) for today
  const eveningHours = hourly.filter((h) => {
    if (typeof h.hour !== 'number' || h.hour < 17 || h.hour > 21) return false;
    if (localTodayDate && h.date) {
      return h.date === localTodayDate;
    }
    return true;
  });

  if (eveningHours.length === 0) {
    if (language === 'hindi') {
      return `${location} के लिए आज शाम (5 PM – 9 PM) के विस्तृत घंटों का पूर्वानुमान उपलब्ध नहीं है।`;
    }
    if (language === 'hinglish') {
      return `${location} ke liye aaj shaam (5 PM – 9 PM) ka hourly forecast data abhi available nahi hai.`;
    }
    return `Detailed evening hourly forecast (5 PM – 9 PM) for ${location} is not currently available.`;
  }

  const maxRain = Math.max(...eveningHours.map((h) => h.rainProbability));
  const maxPrecip = Math.max(...eveningHours.map((h) => h.precipitation ?? 0));
  const hourLines = eveningHours.map((h) => {
    const precLine = (h.precipitation ?? 0) > 0 ? `, ${h.precipitation?.toFixed(1)}mm` : '';
    const timeLabel = typeof h.hour === 'number'
      ? (h.hour === 12 ? '12 PM' : h.hour > 12 ? `${h.hour - 12} PM` : h.hour === 0 ? '12 AM' : `${h.hour} AM`)
      : h.time;
    return `• ${timeLabel}: ${h.temperature}°C, ${h.condition.main}, ${h.rainProbability}% rain${precLine}`;
  });

  const isSafe = maxRain < 40 && maxPrecip < 2;
  const safetyNote = isTravel
    ? isSafe
      ? `Travel Advisory: Conditions look generally favourable for travel this evening.`
      : `Travel Advisory: Exercise caution — elevated rain probability (${maxRain}%) this evening may affect road visibility and conditions.`
    : '';

  if (language === 'hindi') {
    const safetyHindi = isTravel
      ? isSafe
        ? `यात्रा सलाह: शाम के सफर के लिए मौसम आमतौर पर अनुकूल रहेगा।`
        : `यात्रा सलाह: सावधानी बरतें — इस शाम बारिश की ${maxRain}% संभावना है जिससे यात्रा प्रभावित हो सकती है।`
      : '';
    return `${location} में आज शाम का मौसम (5 PM – 9 PM):\n\n${hourLines.join('\n')}${safetyHindi ? `\n\n${safetyHindi}` : ''}`.trim();
  }
  if (language === 'hinglish') {
    const safetyHinglish = isTravel
      ? isSafe
        ? `Travel Advisory: Shaam ko travel ke liye conditions theek lagti hain.`
        : `Travel Advisory: Savdhani rakhein — aaj shaam ${maxRain}% rain chance hai.`
      : '';
    return `${location} mein aaj shaam ka mausam (5 PM – 9 PM):\n\n${hourLines.join('\n')}${safetyHinglish ? `\n\n${safetyHinglish}` : ''}`.trim();
  }

  return `Evening weather for ${location} (5 PM – 9 PM):\n\n${hourLines.join('\n')}${safetyNote ? `\n\n${safetyNote}` : ''}`.trim();
}

/**
 * Generates a tonight weather advisory using today's hourly forecast for the 21:00–23:59 window.
 */
function generateTonightResponse(
  location: string,
  hourly: HourlyForecast[],
  language: DetectedLanguage,
  localTodayDate?: string
): string {
  const tonightHours = hourly.filter((h) => {
    if (typeof h.hour !== 'number' || h.hour < 21) return false;
    if (localTodayDate && h.date) {
      return h.date === localTodayDate;
    }
    return true;
  });

  if (tonightHours.length === 0) {
    if (language === 'hindi') {
      return `${location} के लिए आज रात के घंटों का विस्तृत पूर्वानुमान अभी उपलब्ध नहीं है।`;
    }
    if (language === 'hinglish') {
      return `${location} ke liye aaj raat ke hourly forecast data available nahi hai.`;
    }
    return `Detailed tonight hourly forecast for ${location} is not currently available.`;
  }

  const maxRain = Math.max(...tonightHours.map((h) => h.rainProbability));
  const hourLines = tonightHours.map((h) => {
    const precLine = (h.precipitation ?? 0) > 0 ? `, ${h.precipitation?.toFixed(1)}mm` : '';
    const timeLabel = typeof h.hour === 'number'
      ? (h.hour === 12 ? '12 PM' : h.hour > 12 ? `${h.hour - 12} PM` : h.hour === 0 ? '12 AM' : `${h.hour} AM`)
      : h.time;
    return `• ${timeLabel}: ${h.temperature}°C, ${h.condition.main}, ${h.rainProbability}% rain${precLine}`;
  });

  if (language === 'hindi') {
    const rainNote = maxRain >= 50 ? `आज रात ${location} में बारिश की संभावना अधिक (${maxRain}%) है।` : `आज रात ${location} में बारिश की संभावना कम (${maxRain}%) है।`;
    return `${location} में आज रात का मौसम:\n\n${hourLines.join('\n')}\n\n${rainNote}`;
  }
  if (language === 'hinglish') {
    const rainNote = maxRain >= 50 ? `Aaj raat ${location} mein baarish ki zyada sambhavna (${maxRain}%) hai.` : `Aaj raat ${location} mein baarish ki kam sambhavna (${maxRain}%) hai.`;
    return `${location} mein aaj raat ka mausam:\n\n${hourLines.join('\n')}\n\n${rainNote}`;
  }

  const rainNote = maxRain >= 50
    ? `Rain is likely tonight in ${location} (${maxRain}% chance). Consider carrying an umbrella.`
    : `Rain is unlikely tonight in ${location} (${maxRain}% chance).`;
  return `Tonight's weather for ${location}:\n\n${hourLines.join('\n')}\n\n${rainNote}`;
}

function generateContextualWeatherResponse(
  query: string,
  language: DetectedLanguage,
  intent: WeatherIntent,
  weather: CurrentWeather,
  forecast: ForecastDay[],
  risks: WeatherRisk[],
  hourly: HourlyForecast[] = []
): string {
  const q = query.toLowerCase();
  const todayForecast = forecast[0];
  const rainChance = todayForecast ? todayForecast.rainProbability : 20;

  // 1. Multi-Day Rain Evaluation
  if (intent === 'rain_3day') {
    return generateMultiDayRainResponse(weather.location, forecast, language);
  }

  // 2. Comparisons
  if (intent === 'comparison_hottest') {
    return generateForecastComparisonResponse(weather.location, forecast, 'hottest', language);
  }
  if (intent === 'comparison_coolest') {
    return generateForecastComparisonResponse(weather.location, forecast, 'coolest', language);
  }
  if (intent === 'comparison_rain') {
    return generateForecastComparisonResponse(weather.location, forecast, 'rain', language);
  }

  // 3. 3-Day Forecast
  if (intent === 'forecast_3day' && forecast.length > 0) {
    if (language === 'hindi') {
      const lines = forecast.map((f, idx) => {
        const label = getDisplayDayName(f, idx, 'hindi');
        return `• ${label} (${f.date}): अधिकतम ${f.high}°C / न्यूनतम ${f.low}°C, ${f.condition.main}, बारिश: ${f.rainProbability}%`;
      });
      return `${weather.location} के लिए 3 दिनों का मौसम पूर्वानुमान:\n\n${lines.join('\n')}`;
    }
    if (language === 'hinglish') {
      const lines = forecast.map((f, idx) => {
        const label = getDisplayDayName(f, idx, 'hinglish');
        return `• ${label} (${f.date}): High ${f.high}°C / Low ${f.low}°C, ${f.condition.main}, Rain chance: ${f.rainProbability}%`;
      });
      return `Yeh raha ${weather.location} ka 3-day forecast:\n\n${lines.join('\n')}`;
    }
    const lines = forecast.map((f, idx) => {
      const label = getDisplayDayName(f, idx, 'english');
      return `• ${label} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`;
    });
    return `Here is the 3-day forecast for ${weather.location}:\n\n${lines.join('\n')}`;
  }

  // 4. Day After Tomorrow
  if (intent === 'day_after_tomorrow') {
    return generateDayAfterTomorrowResponse(weather.location, forecast, language);
  }

  // 5. Tomorrow
  if (intent === 'tomorrow') {
    return generateTomorrowResponse(weather.location, forecast, language);
  }

  // 6. Weekend
  if (intent === 'weekend') {
    return generateWeekendResponse(weather.location, forecast, language);
  }

  // 7. Evening / Travel
  if (intent === 'evening' || intent === 'travel') {
    const isTravelQuery = intent === 'travel' || q.includes('travel') || q.includes('safe') || q.includes('drive') || q.includes('trip') || q.includes('safar');
    return generateEveningResponse(weather.location, hourly, language, isTravelQuery, todayForecast?.date);
  }

  // 8. Tonight
  if (intent === 'tonight') {
    return generateTonightResponse(weather.location, hourly, language, todayForecast?.date);
  }

  // 6. Language-specific Fallbacks for Today / Current
  if (language === 'hindi') {
    if (intent === 'rain_today' || q.includes('बारिश') || q.includes('वर्षा') || q.includes('पानी')) {
      if (rainChance > 50) {
        return `आज ${weather.location} में बारिश होने की ${rainChance}% संभावना है। यदि आप बाहर जा रहे हैं, तो छाता साथ रखना सुरक्षित रहेगा।`;
      }
      return `आज ${weather.location} में बारिश की संभावना केवल ${rainChance}% है। आसमान में ज्यादातर ${weather.condition.main === 'Overcast' ? 'बादल छाए रहेंगे' : weather.condition.main}।`;
    }

    if (intent === 'temp_today' || q.includes('तापमान') || q.includes('गर्मी') || q.includes('मौसम')) {
      return `${weather.location} में वर्तमान तापमान ${weather.temperature}°C है (महसूस ${weather.feelsLike}°C हो रहा है)। नमी ${weather.humidity}% है और हवा ${weather.windSpeed} किमी/घंटा की गति से चल रही है।`;
    }

    return `वर्तमान में ${weather.location} में तापमान ${weather.temperature}°C है और मौसम ${weather.condition.main} बना हुआ है। नमी ${weather.humidity}% और हवा की गति ${weather.windSpeed} किमी/घंटा है।`;
  }

  if (language === 'hinglish') {
    if (intent === 'rain_today' || q.includes('baarish') || q.includes('barish')) {
      if (rainChance > 50) {
        return `Aaj ${weather.location} mein baarish hone ke ${rainChance}% chances hain. Agar aap bahar ja rahe hain toh umbrella zaroor carry karein.`;
      }
      return `Aaj ${weather.location} mein baarish ki sambhavna kafi kam (${rainChance}%) hai. Aasman mein mostly ${weather.condition.main.toLowerCase()} rahega.`;
    }

    if (intent === 'temp_today' || q.includes('mausam') || q.includes('mosam') || q.includes('garmi')) {
      return `${weather.location} mein abhi temperature ${weather.temperature}°C hai (feels like ${weather.feelsLike}°C). Humidity ${weather.humidity}% hai aur hawa ${weather.windSpeed} km/h ki speed se chal rahi hai.`;
    }

    return `Abhi ${weather.location} mein temperature ${weather.temperature}°C (${weather.condition.main}) hai aur humidity ${weather.humidity}% hai. Aap weather se related aur kya janna chahte hain?`;
  }

  // English
  if (intent === 'rain_today' || q.includes('rain') || q.includes('precipitation') || q.includes('umbrella')) {
    if (rainChance > 50) {
      return `There is a significant chance of rain (${rainChance}%) in ${weather.location} today. We recommend carrying rain protection if you are stepping out.`;
    }
    return `Rain probability for ${weather.location} is currently low at ${rainChance}%. Skies are predominantly ${weather.condition.main.toLowerCase()}.`;
  }

  if (intent === 'temp_today' || q.includes('temp') || q.includes('hot') || q.includes('heat') || q.includes('warm') || q.includes('cold')) {
    const heatRisk = risks.find((r) => r.level === 'high' || r.level === 'severe');
    let extra = '';
    if (heatRisk && heatRisk.isActive) {
      extra = ` Notice: Active ${heatRisk.title} — ${heatRisk.description}`;
    }
    return `Current temperature in ${weather.location} is ${weather.temperature}°C (feels like ${weather.feelsLike}°C). Humidity is at ${weather.humidity}% with a UV Index of ${weather.uvIndex}.${extra}`;
  }

  return `Currently in ${weather.location}, the temperature is ${weather.temperature}°C (${weather.condition.main}) with ${weather.humidity}% humidity and ${weather.windSpeed} km/h winds. How else can I assist with your meteorological inquiries?`;
}

async function callGeminiApi(
  apiKey: string,
  userMessage: string,
  language: DetectedLanguage,
  intent: WeatherIntent,
  weather: CurrentWeather,
  forecast: ForecastDay[],
  risks: WeatherRisk[]
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

  let intentDirective = '';
  if (intent === 'rain_3day') {
    intentDirective = `CRITICAL MANDATORY 3-DAY RAIN REQUIREMENT:
- The user is asking whether it will rain over the next 3 days in ${weather.location}.
- You MUST evaluate and explicitly state ALL 3 forecast days and their precipitation probabilities (e.g., Today: X%, Tomorrow: Y%, <Day>: Z%).
- Then provide a clear synthesizing conclusion on whether rain is possible across the days and which day has the highest chance.`;
  } else if (intent === 'comparison_hottest') {
    intentDirective = `CRITICAL MANDATORY COMPARISON REQUIREMENT:
- The user is asking which day will be the hottest in ${weather.location}.
- Compare all 3 forecast days' high temperatures, list all 3 days, and clearly state which day is the hottest and its high temperature.`;
  } else if (intent === 'comparison_coolest') {
    intentDirective = `CRITICAL MANDATORY COMPARISON REQUIREMENT:
- The user is asking which day will be the coolest in ${weather.location}.
- Compare all 3 forecast days, list all 3 days, and clearly state which day is the coolest.`;
  } else if (intent === 'comparison_rain') {
    intentDirective = `CRITICAL MANDATORY COMPARISON REQUIREMENT:
- The user is asking which day will have the highest chance of rain in ${weather.location}.
- Compare all 3 forecast days' rain probabilities, list all 3 days, and clearly state which day has the highest probability.`;
  } else if (intent === 'forecast_3day') {
    intentDirective = `CRITICAL MANDATORY 3-DAY FORECAST REQUIREMENT:
- The user is asking for the 3-day forecast for ${weather.location}.
- You MUST list ALL ${forecast.length} supplied forecast days in exact chronological order with Day, High temp, Low temp, Condition, and Rain probability%.`;
  } else if (intent === 'day_after_tomorrow') {
    intentDirective = `CRITICAL MANDATORY DAY AFTER TOMORROW REQUIREMENT:
- The user is asking about the day after tomorrow (${forecast[2]?.day || 'Day 3'}). Answer specifically for that day's forecast.`;
  } else if (intent === 'tomorrow') {
    intentDirective = `CRITICAL MANDATORY TOMORROW REQUIREMENT:
- The user is asking about tomorrow (${forecast[1]?.day || 'Tomorrow'}). Answer specifically for tomorrow's forecast.`;
  } else if (intent === 'weekend') {
    intentDirective = `CRITICAL MANDATORY WEEKEND FORECAST REQUIREMENT:
- The user is asking for the upcoming weekend forecast for ${weather.location}.
- The available forecast window is strictly 3 days: ${forecast.map(f => `${f.day} (${f.date})`).join(', ')}.
- If the upcoming weekend dates are outside this 3-day window, state clearly that the weekend falls outside the available 3-day forecast window and provide the available forecast days. Do NOT fabricate or estimate weather for unavailable dates.`;
  } else if (intent === 'evening') {
    intentDirective = `CRITICAL MANDATORY EVENING WEATHER REQUIREMENT:
- The user is asking about weather for this evening in ${weather.location}.
- Provide a weather advisory specifically for this evening (5 PM - 9 PM) using the relevant hourly telemetry. Do NOT cite official government alerts unless severe.`;
  } else if (intent === 'travel') {
    intentDirective = `CRITICAL MANDATORY TRAVEL ADVISORY REQUIREMENT:
- The user is asking whether it is safe to travel in/from ${weather.location}.
- Provide a practical, weather-based travel advisory based on precipitation, wind, visibility, and conditions.`;
  } else if (intent === 'tonight') {
    intentDirective = `CRITICAL MANDATORY TONIGHT FORECAST REQUIREMENT:
- The user is asking about tonight's weather in ${weather.location}.
- Answer specifically for tonight (9 PM onward) using available telemetry.`;
  }

  const systemPrompt = `You are WeatherGPT, an AI-powered conversational weather intelligence platform for the Smart India Hackathon (SIH 2026).
Your goal is to provide clear, actionable, accurate, and concise weather answers based on the live meteorological telemetry provided below.

Target Weather Location: ${weather.location}, ${weather.region || ''} ${weather.country || ''}
(Note: All data provided below is strictly for ${weather.location}. Explicitly refer to ${weather.location} in your response.)

${languageDirective}

${intentDirective}

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
- Mention specific temperatures, rain probabilities, or precautions when relevant.`;

  const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];

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
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
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
      // Continue to next model or fallback
    }
  }

  return null;
}

/**
 * Main conversational entrypoint. Resolves session context, active location, and intent.
 */
export async function processChatQuery(
  message: string,
  locationQuery: string = 'new-delhi',
  sessionId: string = 'default-session'
): Promise<ChatMessage> {
  const apiKey = process.env.AI_API_KEY;
  const language = detectLanguage(message);
  const session = getOrCreateSession(sessionId);

  // 1. Detect explicit location in current user message
  const explicitLocation = await extractExplicitLocationFromMessage(message);

  // 2. Resolve target location
  // BUG 1: Persist conversational location across turns unless explicitly changed
  let targetLocation: string;
  if (explicitLocation) {
    targetLocation = explicitLocation;
    session.activeLocation = explicitLocation;
  } else if (session.activeLocation) {
    targetLocation = session.activeLocation;
  } else {
    targetLocation = locationQuery || 'new-delhi';
    session.activeLocation = targetLocation;
  }

  // 3. Detect weather intent for this turn
  const detectedIntent = detectWeatherIntent(message);

  // 4. Resolve active weather intent
  // BUG 2: If user only changes location, inherit previous intent
  let activeIntent: WeatherIntent;
  if (detectedIntent) {
    activeIntent = detectedIntent;
    session.activeIntent = detectedIntent;
  } else if (explicitLocation && session.activeIntent) {
    // Location changed with no new intent specified (e.g. "What about Chandigarh instead?", "Pune instead")
    activeIntent = session.activeIntent;
  } else if (session.activeIntent) {
    activeIntent = session.activeIntent;
  } else {
    activeIntent = 'current';
    session.activeIntent = 'current';
  }

  session.lastUpdated = Date.now();

  // 5. Retrieve live weather telemetry for the target location
  const [currentResult, forecastResult, risksResult, hourlyResult] = await Promise.all([
    getCurrentWeather(targetLocation),
    getForecast(targetLocation),
    getWeatherRisks(targetLocation),
    getHourlyForecast(targetLocation),
  ]);

  const weather = currentResult.data;
  const forecast = forecastResult.data;
  const risks = risksResult.data;
  const hourly = hourlyResult.data;

  // 6. Attempt Gemini generation if available
  if (apiKey) {
    try {
      const geminiResponse = await callGeminiApi(apiKey, message, language, activeIntent, weather, forecast, risks);
      if (geminiResponse && geminiResponse.trim()) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: geminiResponse.trim(),
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to deterministic meteorological engine
    }
  }

  // 7. Deterministic meteorological reasoning engine
  const responseText = generateContextualWeatherResponse(message, language, activeIntent, weather, forecast, risks, hourly);

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
  };
}
