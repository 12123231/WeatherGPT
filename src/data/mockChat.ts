import type { ChatMessage, SuggestedQuestion } from '../types/chat';

/**
 * Pre-populated chat messages for demonstration.
 * Will be replaced by real AI responses when backend is connected.
 */
export const initialChatMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Hello! I\'m WeatherGPT, your AI weather assistant. Ask me anything about the weather — current conditions, forecasts, travel safety, or weather risks. How can I help you today?',
    timestamp: new Date().toISOString(),
  },
];

/**
 * Mock responses keyed by keyword patterns.
 * The chatService will match user input against these.
 */
export const mockChatResponses: Record<string, string> = {
  'rain': 'Based on the current forecast for New Delhi, there is a 20% chance of rain today. However, the probability increases to 65% tomorrow evening. I would recommend carrying an umbrella if you\'re heading out after 4 PM tomorrow.',
  'temperature': 'The current temperature in New Delhi is 34°C, with a feels-like temperature of 38°C due to humidity. The high today is expected to reach 35°C, with the low tonight around 27°C.',
  'tomorrow': 'Tomorrow\'s forecast for New Delhi shows partly cloudy skies with a high of 34°C and a low of 26°C. There\'s a 65% chance of rain in the evening, so plan outdoor activities for the morning.',
  'weekend': 'This weekend looks moderate for New Delhi. Saturday will be cloudy with highs around 33°C and a 40% rain chance. Sunday should be partly cloudy with highs of 35°C and only a 15% rain probability. Good conditions for outdoor activities on Sunday.',
  'travel': 'Current weather conditions are generally safe for travel in the New Delhi region. Visibility is at 6 km which is adequate. However, do note the moderate rain alert for this evening — roads may be slippery. Drive carefully and keep headlights on.',
  'safe': 'Overall, weather conditions are moderate today. The main concern is heat — the UV index is at 8, which is very high. If you\'re going outdoors, wear sun protection and stay hydrated. Evening rain is possible but not severe.',
  'hot': 'Yes, it\'s quite hot today! The temperature is 34°C but feels like 38°C due to humidity. The UV index is 8 (Very High). Please stay hydrated, avoid direct sun between 11 AM and 3 PM, and use sunscreen if going outdoors.',
  'wind': 'Current wind speed in New Delhi is 14 km/h from the southwest. This is a gentle breeze — comfortable for most outdoor activities. No strong wind advisories are active for today.',
  'humidity': 'Current humidity in New Delhi is 62%, which is moderately high. Combined with 34°C temperature, the feels-like temperature is 38°C. Stay hydrated and prefer air-conditioned spaces when possible.',
  'forecast': 'Here\'s the 7-day outlook for New Delhi:\n\n• Today: 35°/27°, Partly Cloudy, 20% rain\n• Thu: 34°/26°, Rain likely, 65% rain\n• Fri: 32°/25°, Moderate rain, 80% rain\n• Sat: 33°/26°, Cloudy, 40% rain\n• Sun: 35°/27°, Partly Cloudy, 15% rain\n• Mon: 36°/28°, Sunny, 5% rain\n• Tue: 34°/27°, Partly Cloudy, 25% rain',
};

export const defaultMockResponse = 'Based on current data, weather conditions in your area are within normal range. The temperature is moderate with partly cloudy skies. Would you like more specific information about temperature, rain probability, wind conditions, or weather risks?';

export const suggestedQuestions: SuggestedQuestion[] = [
  { id: 'q1', text: 'Will it rain today?', icon: 'cloud-rain' },
  { id: 'q2', text: 'What\'s the forecast for this weekend?', icon: 'calendar' },
  { id: 'q3', text: 'Is it safe to travel this evening?', icon: 'car' },
  { id: 'q4', text: 'How hot will it be tomorrow?', icon: 'thermometer' },
];
