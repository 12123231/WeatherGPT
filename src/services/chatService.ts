import type { ChatMessage } from '../types/chat';
import { mockChatResponses, defaultMockResponse } from '../data/mockChat';
import { API_BASE_URL } from '../config';

/**
 * Chat service layer connected to WeatherGPT Backend.
 * Uses contextual backend reasoning engine and gracefully falls back to local patterns.
 */

export async function sendChatMessage(userMessage: string, locationId: string = 'new-delhi'): Promise<ChatMessage> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        location: locationId,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Graceful fallback to client simulated intelligence
  }

  // Fallback keyword-matching response
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lower = userMessage.toLowerCase();
  let responseText = defaultMockResponse;

  for (const [keyword, response] of Object.entries(mockChatResponses)) {
    if (lower.includes(keyword)) {
      responseText = response;
      break;
    }
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
  };
}
