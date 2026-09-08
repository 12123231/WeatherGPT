import type { ChatMessage } from '../types/chat';
import { API_BASE_URL } from '../config';

/**
 * Chat service layer connected to WeatherGPT Backend.
 */
export async function sendChatMessage(
  userMessage: string,
  locationId: string = 'new-delhi',
  conversationId?: string
): Promise<ChatMessage> {
  const url = `${API_BASE_URL}/chat`;
  console.log(`[WeatherGPT Chat] Sending POST request to ${url} with payload:`, {
    message: userMessage,
    location: locationId,
    conversationId,
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        location: locationId,
        conversationId,
      }),
    });

    if (!res.ok) {
      let errorMsg = `Server returned status ${res.status} (${res.statusText})`;
      try {
        const errJson = await res.json();
        if (errJson?.error) {
          errorMsg = `${errJson.error} (Status: ${res.status})`;
        }
      } catch {
        // ignore json parse error
      }
      throw new Error(`API Error [${url}]: ${errorMsg}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }

    throw new Error(json.error || `Invalid response format from ${url}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[WeatherGPT Chat] Request failed for ${url}:`, err);
    throw new Error(`Chat error [${url}]: ${msg}`);
  }
}
