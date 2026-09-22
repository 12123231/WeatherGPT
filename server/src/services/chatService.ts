import type { ChatMessage, ForecastDay, HourlyForecast, CurrentWeather, WeatherRisk } from '../types/index.js';
import { getCurrentWeather, getForecast, getWeatherRisks, getHourlyForecast, searchLocations } from './weatherService.js';

export type DetectedLanguage = 'hindi' | 'hinglish' | 'english';

export type WeatherIntent =
  | 'comparison_cities'
  | 'comparison_hottest'
  | 'comparison_coolest'
  | 'comparison_rain'
  | 'alerts'
  | 'rain_timing'
  | 'rain_3day'
  | 'forecast_3day'
  | 'day_after_tomorrow'
  | 'tomorrow'
  | 'rain_today'
  | 'temp_today'
  | 'weekend'
  | 'morning'
  | 'afternoon'
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
 * Explicit temporal phrases that can NEVER become location candidates.
 */
const TEMPORAL_PHRASES = new Set([
  'right now',
  'now',
  'today',
  'tomorrow',
  'tonight',
  'this evening',
  'this afternoon',
  'this morning',
  'this weekend',
  'this week',
  'next week',
  'yesterday',
  'day after tomorrow',
  'overmorrow',
  'later today',
  'later tonight',
  'tomorrow morning',
  'tomorrow afternoon',
  'tomorrow evening',
  'tomorrow night',
  'this night',
  'aaj',
  'kal',
  'parson',
  'parso',
  'abhi',
  'aaj raat',
  'aaj shaam',
  'kal subah',
  'kal shaam',
  'kal dopahar',
  'आज',
  'कल',
  'परसों',
  'आज रात',
  'आज शाम',
  'आज सुबह',
  'कल सुबह',
  'कल शाम',
]);

/**
 * Common non-location words and stopwords that must not be treated as city names.
 */
const NON_LOCATION_WORDS = new Set([
  'today', 'tomorrow', 'tonight', 'yesterday', 'weather', 'forecast', 'rain',
  'raining', 'rainy', 'rains', 'temperature', 'temp', 'humidity', 'wind', 'sun', 'sunny',
  'hot', 'hotter', 'hottest', 'cold', 'colder', 'coldest', 'heat', 'warm', 'warmer', 'warmest', 'cool', 'cooler', 'coolest', 'air', 'quality', 'aqi',
  'here', 'there', 'now', 'right', 'this', 'that', 'these', 'those',
  'week', 'weekly', 'weekend', 'days', 'day', 'next', 'current', 'currently', 'live', 'morning',
  'evening', 'afternoon', 'night', 'hourly', 'daily', 'safe', 'safety', 'safely', 'travel', 'traveling', 'travelling', 'travels', 'trip', 'trips',
  'umbrella', 'umbrellas', 'coat', 'jacket', 'raincoat', 'report', 'update', 'status', 'condition', 'conditions', 'alerts', 'alert',
  'warning', 'warnings', 'advisories', 'advisory', 'advice', 'help', 'info', 'information', 'details',
  'please', 'tell', 'give', 'show', 'check', 'know', 'can', 'will', 'what', 'how',
  'whats', "what's", 'hows', "how's", 'is', 'are', 'was', 'were', 'the', 'a', 'an',
  'in', 'of', 'for', 'at', 'near', 'to', 'from', 'with', 'about', 'like', 'and', 'or', 'but', 'yet', 'nor',
  'it', 'its', "it's", 'me', 'my', 'us', 'our', 'you', 'your', 'going', 'go',
  'does', 'do', 'did', 'would', 'should', 'could', 'be', 'been', 'having', 'have', 'has',
  'need', 'needs', 'needed', 'needing', 'carry', 'carrying', 'carries', 'take', 'taking', 'bring', 'bringing',
  'based', 'basing', 'basis', 'according', 'expect', 'expected', 'expecting', 'expects', 'timing',
  'any', 'some', 'much', 'many', 'very', 'too', 'also', 'just', 'so', 'as', 'than', 'between',
  'city', 'place', 'location', 'area', 'region', 'zone', 'state', 'country', 'world',
  'sky', 'skies', 'cloud', 'clouds', 'cloudy', 'clear', 'overcast', 'thunder', 'storm',
  'visibility', 'pressure', 'chance', 'chances', 'probability', 'probabilities', 'breeze',
  'instead', 'rather', 'which', 'highest', 'lowest', 'most', 'least', 'after', 'before',
  'overmorrow', 'compare', 'comparing', 'comparison', 'versus', 'vs', 'difference', 'better', 'worse',
  'aaj', 'kal', 'parson', 'parso', 'kya', 'hai', 'hain', 'hein', 'hoga', 'hogi', 'honge',
  'batao', 'bataiye', 'bataye', 'bata', 'bolo', 'mausam', 'mosam', 'baarish', 'barish', 'barsaat',
  'garmi', 'thand', 'sardi', 'hawa', 'badal', 'dhoop', 'chahiye', 'chhatri', 'chhata',
  'safari', 'safar', 'mein', 'mai', 'me', 'pe', 'par', 'ka', 'ki', 'ke', 'ko', 'se',
  'rahega', 'rahegi', 'rahenge', 'kaisa', 'kaisi', 'kaise', 'kitna', 'kitni', 'kitne',
  'yahan', 'yaha', 'wahan', 'waha', 'abhi', 'idhar', 'udhar', 'kripya', 'shahar', 'jagah',
  'din', 'dino', 'dina', 'agle', 'agla', 'agli', 'aane', 'wale', 'bhi', 'toh', 'then',
  'teen', 'kaun', 'kaunsa', 'kaunsi', 'kis', 'sabse', 'zyada', 'jyada', 'adhik', 'kam',
  'chetavani', 'chetawani', 'khatra',
  'आज', 'कल', 'परसों', 'क्या', 'है', 'हैं', 'होगा', 'होगी', 'होंगे', 'बताओ', 'बताइए',
  'बताएं', 'मौसम', 'बारिश', 'वर्षा', 'बरसात', 'पानी', 'गर्मी', 'ठंड', 'सर्दी', 'हवा',
  'बादल', 'धूप', 'चाहिए', 'छाता', 'छतरी', 'सफर', 'यात्रा', 'में', 'पे', 'पर', 'का', 'की', 'के',
  'को', 'से', 'रहेगा', 'रहेगी', 'रहेंगे', 'कैसा', 'कैसी', 'कैसे', 'कितना', 'कितनी',
  'कितने', 'यहाँ', 'वहाँ', 'अभी', 'इधर', 'उधर', 'कृपया', 'शहर', 'जगह',
  'दिनों', 'दिन', 'तीन', 'अगले', 'अगला', 'आने', 'वाले', 'कौन', 'कौनसा', 'किस',
  'सबसे', 'ज्यादा', 'अधिक', 'कम', 'हफ्ते', 'सप्ताह', 'हाल', 'चेतावनी', 'अलर्ट', 'तुलना'
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
 * Follows strict priority order:
 * 1. Two-location comparison
 * 2. Weather alerts
 * 3. Rain timing / precipitation forecast
 * 4. Multi-day rain / hottest / coolest comparisons within same location
 * 5. Weekend forecast
 * 6. Travel safety advisory
 * 7. 3-day general forecast
 * 8. Day after tomorrow
 * 9. Tomorrow
 * 10. Tonight / Evening / Morning / Afternoon
 * 11. Rain / Umbrella today
 * 12. Temperature / Heat / Cold today
 * 13. Current weather
 */
export function detectWeatherIntent(message: string, locationsCount: number = 0): WeatherIntent | null {
  const text = message.trim().toLowerCase();

  // 1. Two-location Comparison (MUST have comparison phrasing AND >= 2 locations)
  const hasComparisonPhrasing =
    text.includes('hotter') ||
    text.includes('colder') ||
    text.includes('cooler') ||
    text.includes('warmer') ||
    text.includes('compare') ||
    text.includes('comparison') ||
    text.includes('versus') ||
    text.includes(' vs ') ||
    text.includes('higher chance of rain') ||
    text.includes('more rain') ||
    text.includes('which has a higher') ||
    text.includes('which is hotter') ||
    text.includes('which is colder') ||
    text.includes('which is cooler') ||
    text.includes('which is warmer') ||
    text.includes('zyada garam') ||
    text.includes('jyada garam') ||
    text.includes('zyada thand') ||
    text.includes('zyada barish') ||
    text.includes('zyada baarish') ||
    text.includes('तुलना') ||
    text.includes('ज्यादा गर्म') ||
    text.includes('अधिक गर्म') ||
    text.includes('ज्यादा बारिश');

  if (hasComparisonPhrasing && locationsCount >= 2) {
    return 'comparison_cities';
  }

  // 2. Weather Alerts Intent
  const isAlertQuery =
    text.includes('alert') ||
    text.includes('alerts') ||
    text.includes('warning') ||
    text.includes('warnings') ||
    text.includes('advisory') ||
    text.includes('advisories') ||
    text.includes('severe weather') ||
    text.includes('khatra') ||
    text.includes('chetavani') ||
    text.includes('chetawani') ||
    text.includes('चेतावनी') ||
    text.includes('अलर्ट');

  if (isAlertQuery) {
    return 'alerts';
  }

  // 3. Rain Timing / Expected Rain Intent (Future timing of precipitation)
  const isRainTiming =
    text.includes('when is rain expected') ||
    text.includes('when is the rain expected') ||
    text.includes('when will it rain') ||
    text.includes('when to expect rain') ||
    text.includes('rain expected tomorrow') ||
    text.includes('rain expected today') ||
    text.includes('rain expected later') ||
    text.includes('expected rain') ||
    text.includes('rain expected') ||
    text.includes('rain timing') ||
    text.includes('timing of rain') ||
    text.includes('what time will it rain') ||
    text.includes('will it rain later') ||
    text.includes('will it rain in') ||
    text.includes('will it rain today') ||
    text.includes('will it rain tomorrow') ||
    text.includes('will it rain tonight') ||
    text.includes('baarish kab') ||
    text.includes('barish kab') ||
    text.includes('kab hogi baarish') ||
    text.includes('kab hogi barish') ||
    text.includes('kab aayegi baarish') ||
    text.includes('बारिश कब') ||
    text.includes('कब बारिश') ||
    text.includes('वर्षा कब') ||
    text.includes('कब होगी बारिश') ||
    ((text.includes('when') || text.includes('kab') || text.includes('कब')) &&
      (text.includes('rain') || text.includes('baarish') || text.includes('barish') || text.includes('बारिश') || text.includes('वर्षा')));

  if (isRainTiming) {
    return 'rain_timing';
  }

  // 4. Comparison: Hottest Day (within same location)
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

  // 5. Comparison: Coolest / Coldest Day (within same location)
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

  // 6. Comparison: Highest Chance of Rain (within same location)
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

  // 7. Multi-day Rain Intent
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
    text.includes('पानी') ||
    text.includes('umbrella') ||
    text.includes('chhatri') ||
    text.includes('chhata') ||
    text.includes('छाता') ||
    text.includes('छतरी');

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

  // 8. Weekend — must be before forecast_3day
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

  // 9. Travel safety
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
    text.includes('यात्रा') ||
    (text.includes('travel') && (text.includes('safe') || text.includes('conditions') || text.includes('weather') || text.includes('based') || text.includes('morning') || text.includes('evening') || text.includes('today') || text.includes('tomorrow')));

  if (isTravel) {
    return 'travel';
  }

  // 10. 3-Day / Multi-Day General Forecast
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

  // 11. Day After Tomorrow - MUST BE CHECKED BEFORE "tomorrow"
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

  // 12. Tomorrow
  if (
    text.includes('tomorrow') ||
    text.includes('kal') ||
    text.includes('कल')
  ) {
    return 'tomorrow';
  }

  // 13. Specific Time Periods Today
  if (
    text.includes('tonight') ||
    text.includes('aaj raat') ||
    text.includes('आज रात')
  ) {
    return 'tonight';
  }

  if (
    text.includes('this evening') ||
    text.includes('evening') ||
    text.includes('shaam') ||
    text.includes('शाम') ||
    text.includes('शाम को')
  ) {
    return 'evening';
  }

  if (
    text.includes('this afternoon') ||
    text.includes('afternoon') ||
    text.includes('dopahar') ||
    text.includes('दोपहर')
  ) {
    return 'afternoon';
  }

  if (
    text.includes('this morning') ||
    text.includes('morning') ||
    text.includes('subah') ||
    text.includes('सुबह')
  ) {
    return 'morning';
  }

  // 14. Rain / Umbrella Today
  if (hasRainWord) {
    return 'rain_today';
  }

  // 15. Temperature / Heat / Cold Today
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

  // 16. General current weather
  if (
    text.includes('weather') ||
    text.includes('climate') ||
    text.includes('mausam') ||
    text.includes('mosam') ||
    text.includes('मौसम') ||
    text.includes('kaisa') ||
    text.includes('kaisi') ||
    text.includes('kaise') ||
    text.includes('हाल') ||
    text.includes('right now') ||
    text.includes('now') ||
    text.includes('today') ||
    text.includes('abhi') ||
    text.includes('aaj') ||
    text.includes('आज')
  ) {
    return 'current';
  }

  return 'current';
}

/**
 * Extracts travel time period from query string.
 */
export function extractTravelTimePeriod(
  text: string
): 'tomorrow_morning' | 'tomorrow_afternoon' | 'tomorrow_evening' | 'tomorrow_night' | 'tomorrow' | 'morning' | 'afternoon' | 'evening' | 'tonight' | 'today' {
  const t = text.toLowerCase();
  if (t.includes('tomorrow morning') || t.includes('kal subah') || t.includes('कल सुबह')) return 'tomorrow_morning';
  if (t.includes('tomorrow afternoon') || t.includes('kal dopahar') || t.includes('कल दोपहर')) return 'tomorrow_afternoon';
  if (t.includes('tomorrow evening') || t.includes('kal shaam') || t.includes('कल शाम')) return 'tomorrow_evening';
  if (t.includes('tomorrow night') || t.includes('kal raat') || t.includes('कल रात')) return 'tomorrow_night';
  if (t.includes('this evening') || (t.includes('evening') && !t.includes('tomorrow')) || t.includes('shaam') || t.includes('शाम')) return 'evening';
  if (t.includes('this afternoon') || (t.includes('afternoon') && !t.includes('tomorrow')) || t.includes('dopahar') || t.includes('दोपहर')) return 'afternoon';
  if (t.includes('this morning') || (t.includes('morning') && !t.includes('tomorrow')) || t.includes('subah') || t.includes('सुबह')) return 'morning';
  if (t.includes('tonight') || t.includes('aaj raat') || t.includes('आज रात')) return 'tonight';
  if (t.includes('tomorrow') || t.includes('kal') || t.includes('कल')) return 'tomorrow';
  return 'today';
}

/**
 * Helper to clean and validate potential candidate location strings.
 */
function cleanAndValidateCandidate(rawCandidate: string): string | null {
  if (!rawCandidate) return null;

  const normalized = rawCandidate.trim().toLowerCase();
  if (TEMPORAL_PHRASES.has(normalized)) return null;

  const words = rawCandidate
    .replace(/[^\w\s\u0900-\u097F-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // Strip leading stopwords and temporal words
  while (words.length > 0 && (NON_LOCATION_WORDS.has(words[0].toLowerCase()) || TEMPORAL_PHRASES.has(words[0].toLowerCase()))) {
    words.shift();
  }
  // Strip trailing stopwords and temporal words
  while (words.length > 0 && (NON_LOCATION_WORDS.has(words[words.length - 1].toLowerCase()) || TEMPORAL_PHRASES.has(words[words.length - 1].toLowerCase()))) {
    words.pop();
  }

  if (words.length === 0) return null;

  const cleaned = words.join(' ').trim();
  if (cleaned.length < 2) return null;

  const cleanedLower = cleaned.toLowerCase();
  if (TEMPORAL_PHRASES.has(cleanedLower)) return null;

  if (words.every((w) => NON_LOCATION_WORDS.has(w.toLowerCase()) || TEMPORAL_PHRASES.has(w.toLowerCase()))) {
    return null;
  }

  return cleaned;
}

/**
 * Resolves a candidate string against known maps or live search API.
 * Rejects temporal expressions and stopwords strictly.
 */
async function resolveLocationCandidate(candidate: string): Promise<string | null> {
  const lower = candidate.toLowerCase();

  // 1. Reject if candidate is a known temporal phrase or non-location word or too short
  if (TEMPORAL_PHRASES.has(lower) || NON_LOCATION_WORDS.has(lower) || candidate.length < 2) {
    return null;
  }

  // 2. Check Hindi transliteration mapping
  if (HINDI_CITY_MAP[candidate]) {
    return HINDI_CITY_MAP[candidate];
  }

  // 3. Check known aliases
  if (KNOWN_CITY_ALIASES[lower]) {
    return KNOWN_CITY_ALIASES[lower];
  }

  // 4. Verify candidate with searchLocations() — exact location name or region match only
  try {
    const searchResults = await searchLocations(candidate);
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      const match = searchResults.find(
        (loc) =>
          loc.name.toLowerCase() === lower ||
          loc.name.toLowerCase().split(',')[0].trim() === lower ||
          (loc.region && loc.region.toLowerCase() === lower)
      );
      if (match) {
        return match.name;
      }
    }
  } catch {
    // on error, do NOT blindly accept random words
  }

  return null;
}

/**
 * Extracts all explicit locations mentioned in the message (preserving order).
 */
export async function extractMultipleLocations(message: string): Promise<string[]> {
  if (!message || !message.trim()) return [];
  const raw = message.trim();

  const foundLocations: Array<{ name: string; index: number }> = [];

  // 1. Direct Devanagari Hindi City Match
  const devanagariKeys = Object.keys(HINDI_CITY_MAP).sort((a, b) => b.length - a.length);
  for (const hindiCity of devanagariKeys) {
    let idx = raw.indexOf(hindiCity);
    while (idx !== -1) {
      const resolved = HINDI_CITY_MAP[hindiCity];
      if (!foundLocations.some((f) => f.name.toLowerCase() === resolved.toLowerCase())) {
        foundLocations.push({ name: resolved, index: idx });
      }
      idx = raw.indexOf(hindiCity, idx + hindiCity.length);
    }
  }

  // 2. Direct English Known City Aliases (whole word match)
  const aliasKeys = Object.keys(KNOWN_CITY_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of aliasKeys) {
    const regex = new RegExp(`(?:^|\\b)${alias}(?:\\b|$)`, 'i');
    const m = regex.exec(raw);
    if (m) {
      const resolved = KNOWN_CITY_ALIASES[alias];
      if (!foundLocations.some((f) => f.name.toLowerCase() === resolved.toLowerCase())) {
        foundLocations.push({ name: resolved, index: m.index });
      }
    }
  }

  // 3. Preposition / context patterns
  const candidatePatterns = [
    /(?:^|\s+)(?:in|of|for|at|around|near|to|about|than|between|and)\s+([a-zA-Z\u0900-\u097F\s-]{2,30}?)(?=[?,.!;:]|\s+(?:today|tomorrow|tonight|now|this|please|right|next|weather|forecast|kaisa|kaisi|mein|mai|me|ka|ki|ke|pe|par|instead)|$)/gi,
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s-]{2,30}?)\s+(?:weather|forecast|temperature|temp|climate|alerts?|mausam|mosam|baarish|barish|garmi|thand)(?:\s+|$|[?,.!;:])/gi,
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s-]{2,30}?)\s+(?:mein|mai|me|ka|ki|ke|pe|par|se|में|का|की|के|पर|से)(?:\s+|$|[?,.!;:])/gi,
    /(?:^|\s+)([a-zA-Z\u0900-\u097F\s-]{2,30}?)\s+(?:instead|rather)(?:\s+|$|[?,.!;:])/gi,
  ];

  for (const pattern of candidatePatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(raw)) !== null) {
      if (match[1]) {
        const candidate = cleanAndValidateCandidate(match[1]);
        if (candidate) {
          const resolved = await resolveLocationCandidate(candidate);
          if (resolved && !foundLocations.some((f) => f.name.toLowerCase() === resolved.toLowerCase())) {
            foundLocations.push({ name: resolved, index: match.index });
          }
        }
      }
    }
  }

  // Sort by order of appearance in the original message
  foundLocations.sort((a, b) => a.index - b.index);
  return foundLocations.map((f) => f.name);
}

/**
 * Extracts explicit location mentioned directly in the user message.
 * Returns null if no explicit location is found.
 */
export async function extractExplicitLocationFromMessage(message: string): Promise<string | null> {
  const locs = await extractMultipleLocations(message);
  return locs.length > 0 ? locs[0] : null;
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

/**
 * Sanitizes chatbot text to remove raw markdown syntax (such as **bold** or *italic*)
 * so it renders cleanly in the plain text UI without raw asterisks.
 */
export function sanitizeChatbotResponse(text: string): string {
  if (!text) return text;
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

/**
 * BUG 4: Generates deterministic direct comparison between two distinct cities.
 */
function generateTwoCityComparisonResponse(
  city1Name: string,
  city1Weather: CurrentWeather,
  city1Forecast: ForecastDay[],
  city2Name: string,
  city2Weather: CurrentWeather,
  city2Forecast: ForecastDay[],
  language: DetectedLanguage,
  query: string
): string {
  const q = query.toLowerCase();
  const isRain =
    q.includes('rain') ||
    q.includes('precipitation') ||
    q.includes('baarish') ||
    q.includes('barish') ||
    q.includes('वर्षा') ||
    q.includes('बारिश');

  const city1Rain = city1Forecast[0]?.rainProbability ?? 0;
  const city2Rain = city2Forecast[0]?.rainProbability ?? 0;
  const city1Temp = city1Weather.temperature;
  const city2Temp = city2Weather.temperature;

  if (isRain) {
    if (city1Rain === city2Rain) {
      if (language === 'hindi') {
        return `आज ${city1Name} और ${city2Name} दोनों में बारिश की संभावना समान (${city1Rain}%) है।`;
      }
      if (language === 'hinglish') {
        return `Aaj ${city1Name} aur ${city2Name} dono mein baarish ka chance barabar (${city1Rain}%) hai.`;
      }
      return `Both ${city1Name} and ${city2Name} have the same chance of rain today (${city1Rain}%).`;
    }

    const rainierCity = city1Rain > city2Rain ? city1Name : city2Name;
    const rainierProb = Math.max(city1Rain, city2Rain);
    const drierCity = city1Rain > city2Rain ? city2Name : city1Name;
    const drierProb = Math.min(city1Rain, city2Rain);

    if (language === 'hindi') {
      return `${rainierCity} में आज बारिश की संभावना अधिक (${rainierProb}%) है, जबकि ${drierCity} में यह ${drierProb}% है।`;
    }
    if (language === 'hinglish') {
      return `${rainierCity} mein aaj baarish ka chance zyada (${rainierProb}%) hai, compared to ${drierCity} (${drierProb}%).`;
    }
    return `${city1Name} has a ${city1Rain}% chance of rain today, while ${city2Name} has a ${city2Rain}% chance. So ${rainierCity} has a higher chance of rain.`;
  }

  // Temperature Comparison (hotter / colder / general temperature)
  const diff = Math.abs(city1Temp - city2Temp);

  if (city1Temp === city2Temp) {
    if (language === 'hindi') {
      return `${city1Name} और ${city2Name} दोनों में वर्तमान तापमान समान ${city1Temp}°C है।`;
    }
    if (language === 'hinglish') {
      return `Dono ${city1Name} aur ${city2Name} mein abhi barabar temperature ${city1Temp}°C hai.`;
    }
    return `Both ${city1Name} and ${city2Name} currently have the same temperature of ${city1Temp}°C.`;
  }

  const hotterCity = city1Temp > city2Temp ? city1Name : city2Name;

  if (language === 'hindi') {
    return `${city1Name} में वर्तमान तापमान ${city1Temp}°C है, जबकि ${city2Name} में ${city2Temp}°C है। अतः ${hotterCity} ${diff}°C अधिक गर्म है।`;
  }
  if (language === 'hinglish') {
    return `${city1Name} mein abhi temperature ${city1Temp}°C hai, jabki ${city2Name} mein ${city2Temp}°C hai. Toh ${hotterCity} ${diff}°C zyada garam hai.`;
  }
  return `${city1Name} is currently ${city1Temp}°C, while ${city2Name} is ${city2Temp}°C. So ${hotterCity} is hotter by ${diff}°C.`;
}

/**
 * BUG 2: Generates weather alert response using actual provider risks.
 * Never falls back to current weather when alerts are requested.
 */
function generateAlertsResponse(
  location: string,
  risks: WeatherRisk[],
  language: DetectedLanguage
): string {
  if (risks && risks.length > 0) {
    const alertLines = risks.map(
      (r) => `• [${r.level.toUpperCase()}] ${r.title}: ${r.description} (${r.timePeriod})`
    );
    if (language === 'hindi') {
      return `${location} के लिए सक्रिय मौसम चेतावनियाँ:\n\n${alertLines.join('\n')}`;
    }
    if (language === 'hinglish') {
      return `${location} ke liye active weather alerts:\n\n${alertLines.join('\n')}`;
    }
    return `Active weather alerts for ${location}:\n\n${alertLines.join('\n')}`;
  }

  if (language === 'hindi') {
    return `${location} के लिए वर्तमान में कोई सक्रिय मौसम चेतावनी उपलब्ध नहीं है।`;
  }
  if (language === 'hinglish') {
    return `${location} ke liye abhi koi active weather alert ya warning nahi hai.`;
  }
  return `No active weather alerts are currently available for ${location}.`;
}

/**
 * BUG 3: Generates practical, concise umbrella advice based on actual forecast data.
 */
function generateUmbrellaResponse(
  location: string,
  forecast: ForecastDay[],
  weather: CurrentWeather,
  language: DetectedLanguage,
  isTomorrow: boolean
): string {
  const targetForecast = isTomorrow ? (forecast[1] || forecast[0]) : forecast[0];
  const rainChance = targetForecast ? targetForecast.rainProbability : 0;
  const dayLabel = isTomorrow
    ? (language === 'hindi' ? 'कल' : language === 'hinglish' ? 'kal' : 'tomorrow')
    : (language === 'hindi' ? 'आज' : language === 'hinglish' ? 'aaj' : 'today');

  if (rainChance >= 50) {
    if (language === 'hindi') {
      return `हाँ, ${dayLabel} ${location} में छाता साथ रखना उचित रहेगा। बारिश की संभावना ${rainChance}% है।`;
    }
    if (language === 'hinglish') {
      return `Haan, ${dayLabel} ${location} mein umbrella carry karna behtar rahega. Baarish ke ${rainChance}% chances hain.`;
    }
    return `Yes, carrying an umbrella is recommended. Rain chance is ${rainChance}% ${dayLabel} in ${location}.`;
  }

  if (rainChance >= 20) {
    if (language === 'hindi') {
      return `${dayLabel} ${location} में बारिश की संभावना मध्यम (${rainChance}%) है। एहतियात के तौर पर छाता साथ रख सकते हैं।`;
    }
    if (language === 'hinglish') {
      return `${dayLabel} ${location} mein baarish ke moderate chances (${rainChance}%) hain. Safe side ke liye umbrella saath rakhna theek rahega.`;
    }
    return `Rain chance is moderate at ${rainChance}% ${dayLabel} in ${location}. You may want to carry an umbrella just in case.`;
  }

  if (language === 'hindi') {
    return `संभवतः नहीं। ${dayLabel} ${location} में बारिश की संभावना केवल ${rainChance}% है, इसलिए छाता ले जाने की आवश्यकता नहीं है।`;
  }
  if (language === 'hinglish') {
    return `Probably nahi. ${dayLabel} ${location} mein rain chance sirf ${rainChance}% hai, toh umbrella ki zaroorat nahi padegi.`;
  }
  return `Probably not. Rain chance is ${rainChance}% ${dayLabel} in ${location}, so an umbrella is unlikely to be necessary.`;
}

/**
 * BUG 5: Generates expected precipitation timing inspecting hourly telemetry.
 * Does NOT merely return current rain probability.
 */
function generateRainTimingResponse(
  location: string,
  hourly: HourlyForecast[],
  forecast: ForecastDay[],
  language: DetectedLanguage,
  isTomorrow: boolean
): string {
  const targetDate = isTomorrow ? forecast[1]?.date : forecast[0]?.date;
  const targetDayLabel = isTomorrow
    ? (language === 'hindi' ? 'कल' : language === 'hinglish' ? 'kal' : 'tomorrow')
    : (language === 'hindi' ? 'आज' : language === 'hinglish' ? 'aaj' : 'today');

  // Filter hourly entries
  const relevantHours = hourly.filter((h) => {
    if (isTomorrow) {
      return targetDate ? h.date === targetDate : true;
    }
    return h.time !== 'Now';
  });

  const rainHours = relevantHours.filter(
    (h) =>
      h.rainProbability >= 30 ||
      (h.precipitation ?? 0) > 0.1 ||
      /rain|shower|drizzle|thunder/i.test(h.condition.main)
  );

  if (rainHours.length > 0) {
    const first = rainHours[0];
    const peak = rainHours.reduce(
      (max, h) => (h.rainProbability > max.rainProbability ? h : max),
      rainHours[0]
    );

    if (language === 'hindi') {
      if (rainHours.length === 1) {
        return `${location} में ${targetDayLabel} लगभग ${first.time} बारिश होने की संभावना (${first.rainProbability}%, ${first.condition.main}) है।`;
      }
      return `${location} में ${targetDayLabel} बारिश लगभग ${first.time} से शुरू होकर ${rainHours[rainHours.length - 1].time} तक होने का अनुमान है, जो ${peak.time} पर सर्वाधिक (${peak.rainProbability}%) रहेगी।`;
    }

    if (language === 'hinglish') {
      if (rainHours.length === 1) {
        return `${location} mein ${targetDayLabel} lagbhag ${first.time} baarish expect ki ja rahi hai (${first.rainProbability}% chance, ${first.condition.main}).`;
      }
      return `${location} mein ${targetDayLabel} baarish lagbhag ${first.time} se start hokar ${rainHours[rainHours.length - 1].time} tak expected hai, peaking at ${peak.time} with ${peak.rainProbability}% probability.`;
    }

    if (rainHours.length === 1) {
      return `Rain is expected around ${first.time} ${targetDayLabel} in ${location} (${first.rainProbability}% chance, ${first.condition.main}).`;
    }
    return `Rain is expected in ${location} ${targetDayLabel} starting around ${first.time} and continuing through ${rainHours[rainHours.length - 1].time}, peaking at ${peak.time} with a ${peak.rainProbability}% chance (${peak.condition.main}).`;
  }

  // If asking about today and no rain today, check tomorrow's forecast
  if (!isTomorrow && forecast[1] && forecast[1].rainProbability >= 30) {
    if (language === 'hindi') {
      return `आज ${location} में बारिश की संभावना नहीं है। हालांकि कल (${forecast[1].day}) ${forecast[1].rainProbability}% संभावना के साथ बारिश हो सकती है।`;
    }
    if (language === 'hinglish') {
      return `Aaj ${location} mein baarish expected nahi hai. Lekin kal (${forecast[1].day}) ${forecast[1].rainProbability}% chance ke saath baarish ho sakti hai.`;
    }
    return `No rain is expected today in ${location}. However, rain is possible tomorrow (${forecast[1].day}) with a ${forecast[1].rainProbability}% chance.`;
  }

  if (language === 'hindi') {
    return `उपलब्ध पूर्वानुमान अवधि के दौरान ${location} में बारिश की कोई संभावना नहीं है।`;
  }
  if (language === 'hinglish') {
    return `Available forecast period mein ${location} mein baarish expect nahi ki ja rahi hai.`;
  }
  return `No rain is currently expected in ${location} within the available forecast period.`;
}

/**
 * BUG 6: Generates travel safety advisory honoring the requested time period.
 * Tomorrow morning uses tomorrow morning data, NOT evening data.
 */
function generateTravelResponse(
  location: string,
  timePeriod:
    | 'tomorrow_morning'
    | 'tomorrow_afternoon'
    | 'tomorrow_evening'
    | 'tomorrow_night'
    | 'tomorrow'
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'tonight'
    | 'today',
  hourly: HourlyForecast[],
  forecast: ForecastDay[],
  weather: CurrentWeather,
  risks: WeatherRisk[],
  language: DetectedLanguage
): string {
  if (timePeriod === 'tomorrow_morning') {
    const tomorrowDate = forecast[1]?.date;
    const morningHours = hourly.filter((h) => {
      if (tomorrowDate && h.date && h.date !== tomorrowDate) return false;
      return typeof h.hour === 'number' && h.hour >= 6 && h.hour <= 12;
    });

    const tomorrowDay = forecast[1] || forecast[0];
    const avgTemp =
      morningHours.length > 0
        ? Math.round(morningHours.reduce((s, h) => s + h.temperature, 0) / morningHours.length)
        : Math.round((tomorrowDay.high + tomorrowDay.low) / 2);
    const maxRain =
      morningHours.length > 0
        ? Math.max(...morningHours.map((h) => h.rainProbability))
        : tomorrowDay.rainProbability;
    const cond = morningHours[0]?.condition.main || tomorrowDay.condition.main;

    const isSafe = maxRain < 40;
    const advisoryEn = isSafe
      ? 'Travel Advisory: Conditions look generally favourable for travel tomorrow morning.'
      : `Travel Advisory: Exercise caution — elevated rain probability (${maxRain}%) tomorrow morning may affect visibility and road conditions.`;

    if (language === 'hindi') {
      const advHi = isSafe
        ? 'यात्रा सलाह: कल सुबह के सफर के लिए मौसम आमतौर पर अनुकूल रहेगा।'
        : `यात्रा सलाह: सावधानी बरतें — कल सुबह बारिश की ${maxRain}% संभावना है जिससे सफर प्रभावित हो सकता है।`;
      return `${location} में कल सुबह का मौसम (6 AM – 12 PM):\n\n• अनुमानित तापमान: लगभग ${avgTemp}°C\n• मौसम: ${cond}\n• बारिश की संभावना: ${maxRain}%\n\n${advHi}`;
    }

    if (language === 'hinglish') {
      const advHing = isSafe
        ? 'Travel Advisory: Kal subah travel ke liye conditions generally achhi hain.'
        : `Travel Advisory: Savdhani rakhein — kal subah ${maxRain}% rain chance hai.`;
      return `${location} mein kal subah ka mausam (6 AM – 12 PM):\n\n• Expected temperature: around ${avgTemp}°C\n• Condition: ${cond}\n• Rain chance: ${maxRain}%\n\n${advHing}`;
    }

    return `Tomorrow morning weather for ${location} (6 AM – 12 PM):\n\n• Expected temperature: around ${avgTemp}°C\n• Condition: ${cond}\n• Rain chance: ${maxRain}%\n\n${advisoryEn}`;
  }

  if (
    timePeriod === 'tomorrow_afternoon' ||
    timePeriod === 'tomorrow_evening' ||
    timePeriod === 'tomorrow_night' ||
    timePeriod === 'tomorrow'
  ) {
    const tomorrowDay = forecast[1] || forecast[0];
    const isSafe = tomorrowDay.rainProbability < 40;
    const advisoryEn = isSafe
      ? `Travel Advisory: Conditions look generally favourable for travel tomorrow.`
      : `Travel Advisory: Exercise caution — rain probability is ${tomorrowDay.rainProbability}% tomorrow.`;

    if (language === 'hindi') {
      return `${location} में कल का मौसम: अधिकतम ${tomorrowDay.high}°C / न्यूनतम ${tomorrowDay.low}°C, ${tomorrowDay.condition.main}, बारिश: ${tomorrowDay.rainProbability}%\n\nयात्रा सलाह: ${isSafe ? 'कल सफर के लिए स्थितियां अनुकूल हैं।' : 'सावधानी बरतें।'}`;
    }
    return `Tomorrow's weather for ${location}: High ${tomorrowDay.high}°C, Low ${tomorrowDay.low}°C, ${tomorrowDay.condition.main}, ${tomorrowDay.rainProbability}% rain chance.\n\n${advisoryEn}`;
  }

  if (timePeriod === 'evening') {
    return generateEveningResponse(location, hourly, language, true, forecast[0]?.date);
  }

  if (timePeriod === 'tonight') {
    return generateTonightResponse(location, hourly, language, forecast[0]?.date);
  }

  // Today / current travel advisory
  const todayForecast = forecast[0];
  const rainChance = todayForecast ? todayForecast.rainProbability : 0;
  const isSafe =
    rainChance < 40 && weather.windSpeed < 45 && weather.condition.main !== 'Thunderstorm';
  const advisoryEn = isSafe
    ? 'Travel Advisory: Conditions look generally favourable for travel today.'
    : `Travel Advisory: Exercise caution — current weather (${weather.condition.main}, ${weather.windSpeed} km/h wind, ${rainChance}% rain) may impact travel.`;

  if (language === 'hindi') {
    const advHi = isSafe
      ? 'यात्रा सलाह: आज सफर के लिए मौसम सामान्यतः अनुकूल है।'
      : `यात्रा सलाह: सावधानी बरतें — मौसम (${weather.condition.main}) यात्रा को प्रभावित कर सकता है।`;
    return `${location} में वर्तमान स्थिति: तापमान ${weather.temperature}°C (${weather.condition.main}), हवा ${weather.windSpeed} किमी/घंटा, बारिश की संभावना ${rainChance}%\n\n${advHi}`;
  }

  if (language === 'hinglish') {
    const advHing = isSafe
      ? 'Travel Advisory: Aaj travel ke liye conditions generally safe hain.'
      : `Travel Advisory: Savdhani bartein — weather conditions safar ko affect kar sakti hain.`;
    return `${location} mein current weather: ${weather.temperature}°C (${weather.condition.main}), Wind ${weather.windSpeed} km/h, Rain chance ${rainChance}%\n\n${advHing}`;
  }

  return `Current conditions in ${location}: ${weather.temperature}°C (${weather.condition.main}), wind at ${weather.windSpeed} km/h, rain chance ${rainChance}%.\n\n${advisoryEn}`;
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
  const isTomorrow = q.includes('tomorrow') || q.includes('kal') || q.includes('कल');

  // 1. Alerts Intent (BUG 2)
  if (intent === 'alerts') {
    return generateAlertsResponse(weather.location, risks, language);
  }

  // 2. Rain Timing Intent (BUG 5)
  if (intent === 'rain_timing') {
    return generateRainTimingResponse(weather.location, hourly, forecast, language, isTomorrow);
  }

  // 3. Travel Advisory (BUG 6)
  if (intent === 'travel') {
    const timePeriod = extractTravelTimePeriod(query);
    return generateTravelResponse(weather.location, timePeriod, hourly, forecast, weather, risks, language);
  }

  // 4. Umbrella / Rain Queries (BUG 3)
  if (intent === 'rain_today' || q.includes('umbrella') || q.includes('chhatri') || q.includes('chhata') || q.includes('छाता')) {
    return generateUmbrellaResponse(weather.location, forecast, weather, language, isTomorrow);
  }

  // 5. Multi-Day Rain Evaluation
  if (intent === 'rain_3day') {
    return generateMultiDayRainResponse(weather.location, forecast, language);
  }

  // 6. Day Comparisons within location
  if (intent === 'comparison_hottest') {
    return generateForecastComparisonResponse(weather.location, forecast, 'hottest', language);
  }
  if (intent === 'comparison_coolest') {
    return generateForecastComparisonResponse(weather.location, forecast, 'coolest', language);
  }
  if (intent === 'comparison_rain') {
    return generateForecastComparisonResponse(weather.location, forecast, 'rain', language);
  }

  // 7. 3-Day Forecast
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

  // 8. Day After Tomorrow
  if (intent === 'day_after_tomorrow') {
    return generateDayAfterTomorrowResponse(weather.location, forecast, language);
  }

  // 9. Tomorrow
  if (intent === 'tomorrow') {
    return generateTomorrowResponse(weather.location, forecast, language);
  }

  // 10. Weekend
  if (intent === 'weekend') {
    return generateWeekendResponse(weather.location, forecast, language);
  }

  // 11. Evening
  if (intent === 'evening') {
    return generateEveningResponse(weather.location, hourly, language, false, todayForecast?.date);
  }

  // 12. Tonight
  if (intent === 'tonight') {
    return generateTonightResponse(weather.location, hourly, language, todayForecast?.date);
  }

  // 13. Temperature / Heat / Cold Today
  if (intent === 'temp_today') {
    if (language === 'hindi') {
      return `${weather.location} में वर्तमान तापमान ${weather.temperature}°C है (महसूस ${weather.feelsLike}°C हो रहा है)। नमी ${weather.humidity}% है और हवा ${weather.windSpeed} किमी/घंटा की गति से चल रही है।`;
    }
    if (language === 'hinglish') {
      return `${weather.location} mein abhi temperature ${weather.temperature}°C hai (feels like ${weather.feelsLike}°C). Humidity ${weather.humidity}% hai aur hawa ${weather.windSpeed} km/h ki speed se chal rahi hai.`;
    }
    const heatRisk = risks.find((r) => r.level === 'high' || r.level === 'severe');
    let extra = '';
    if (heatRisk && heatRisk.isActive) {
      extra = ` Notice: Active ${heatRisk.title} — ${heatRisk.description}`;
    }
    return `Current temperature in ${weather.location} is ${weather.temperature}°C (feels like ${weather.feelsLike}°C). Humidity is at ${weather.humidity}% with a UV Index of ${weather.uvIndex}.${extra}`;
  }

  // 14. Current weather fallback
  if (language === 'hindi') {
    return `वर्तमान में ${weather.location} में तापमान ${weather.temperature}°C है और मौसम ${weather.condition.main} बना हुआ है। नमी ${weather.humidity}% और हवा की गति ${weather.windSpeed} किमी/घंटा है।`;
  }
  if (language === 'hinglish') {
    return `Abhi ${weather.location} mein temperature ${weather.temperature}°C (${weather.condition.main}) hai aur humidity ${weather.humidity}% hai. Aap weather se related aur kya janna chahte hain?`;
  }
  return `Currently in ${weather.location}, the temperature is ${weather.temperature}°C (${weather.condition.main}) with ${weather.humidity}% humidity and ${weather.windSpeed} km/h winds.`;
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
- Use natural, accurate Hindi for weather terms.`;
  } else if (language === 'hinglish') {
    languageDirective = `CRITICAL MANDATORY LANGUAGE REQUIREMENT:
- Respond naturally in HINGLISH using the Latin/English alphabet.
- Match conversational Hinglish. Do not respond in pure English or pure Devanagari.`;
  } else {
    languageDirective = `CRITICAL MANDATORY LANGUAGE REQUIREMENT:
- Respond in clear, concise ENGLISH.`;
  }

  let intentDirective = '';
  if (intent === 'alerts') {
    intentDirective = `CRITICAL MANDATORY ALERTS REQUIREMENT:
- The user is asking about weather alerts for ${weather.location}.
- If active alerts are listed below, report them accurately.
- If NO active alerts are listed, explicitly say: "No active weather alerts are currently available for ${weather.location}."
- NEVER replace an alert request with a generic current-weather report.`;
  } else if (intent === 'rain_timing') {
    intentDirective = `CRITICAL MANDATORY RAIN TIMING REQUIREMENT:
- The user is asking WHEN rain is expected in ${weather.location}.
- Inspect upcoming forecast days. If rain is expected, state the day/time and probability.
- If no precipitation is expected, state: "No rain is currently expected in ${weather.location} within the available forecast period."
- Do NOT invent a rain time.`;
  } else if (intent === 'travel') {
    intentDirective = `CRITICAL MANDATORY TRAVEL ADVISORY REQUIREMENT:
- The user is asking about travel conditions for ${weather.location}.
- Match the exact time period the user requested (e.g., tomorrow morning, this evening, or today).
- Provide a weather-based travel advisory based on forecast data.`;
  }

  const systemPrompt = `You are WeatherGPT, an AI-powered conversational weather intelligence platform for the Smart India Hackathon (SIH 2026).
Your goal is to provide clear, actionable, accurate, and concise weather answers based on the live meteorological telemetry provided below.

Target Weather Location: ${weather.location}, ${weather.region || ''} ${weather.country || ''}

${languageDirective}

${intentDirective}

CRITICAL FORMATTING REQUIREMENT:
- Do NOT use markdown bold syntax (like **bold** or *italic*). Output clean plain text without asterisks.
- The chat UI renders plain text directly. Do not include raw markdown asterisks anywhere in your response.
- Bullet points (•) and line breaks are allowed for structuring lists.

Live Meteorological Telemetry for ${weather.location}:
- Current Temp: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Condition: ${weather.condition.main} (${weather.condition.description})
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} km/h from ${weather.windDirection}

Forecast (Upcoming Days for ${weather.location}):
${forecast.map((f) => `- ${f.day} (${f.date}): High ${f.high}°C, Low ${f.low}°C, ${f.condition.main}, ${f.rainProbability}% rain chance`).join('\n')}

Active Risks / Alerts for ${weather.location}:
${risks.length > 0 ? risks.map((r) => `- [${r.level.toUpperCase()}] ${r.title}: ${r.description} (${r.timePeriod})`).join('\n') : 'No severe alerts currently active.'}`;

  const models = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.7-flash'];

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
        if (reply && reply.trim()) return sanitizeChatbotResponse(reply.trim());
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

  // 1. Detect all explicit locations in current user message
  const explicitLocations = await extractMultipleLocations(message);
  const explicitLocation = explicitLocations.length > 0 ? explicitLocations[0] : null;

  // 2. Detect weather intent for this turn
  const detectedIntent = detectWeatherIntent(message, explicitLocations.length);

  // 3. Handle Two-Location Comparison Intent (BUG 4)
  if (detectedIntent === 'comparison_cities' && explicitLocations.length >= 2) {
    const city1Name = explicitLocations[0];
    const city2Name = explicitLocations[1];

    const [city1Current, city1Forecast, city2Current, city2Forecast] = await Promise.all([
      getCurrentWeather(city1Name),
      getForecast(city1Name),
      getCurrentWeather(city2Name),
      getForecast(city2Name),
    ]);

    const replyText = generateTwoCityComparisonResponse(
      city1Current.data.location || city1Name,
      city1Current.data,
      city1Forecast.data,
      city2Current.data.location || city2Name,
      city2Current.data,
      city2Forecast.data,
      language,
      message
    );

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: sanitizeChatbotResponse(replyText),
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Resolve single target location following priority rules:
  // (1) Explicit location in message, (2) Active session location, (3) Dashboard/fallback location
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

  // 5. Resolve active weather intent
  let activeIntent: WeatherIntent;
  if (detectedIntent) {
    activeIntent = detectedIntent;
    session.activeIntent = detectedIntent;
  } else if (explicitLocation && session.activeIntent) {
    activeIntent = session.activeIntent;
  } else if (session.activeIntent) {
    activeIntent = session.activeIntent;
  } else {
    activeIntent = 'current';
    session.activeIntent = 'current';
  }

  session.lastUpdated = Date.now();

  // 6. Retrieve live weather telemetry for the target location
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

  // 7. Attempt Gemini generation if available
  if (apiKey) {
    try {
      const geminiResponse = await callGeminiApi(apiKey, message, language, activeIntent, weather, forecast, risks);
      if (geminiResponse && geminiResponse.trim()) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: sanitizeChatbotResponse(geminiResponse),
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to deterministic meteorological engine
    }
  }

  // 8. Deterministic meteorological reasoning engine
  const responseText = generateContextualWeatherResponse(message, language, activeIntent, weather, forecast, risks, hourly);

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: sanitizeChatbotResponse(responseText),
    timestamp: new Date().toISOString(),
  };
}
