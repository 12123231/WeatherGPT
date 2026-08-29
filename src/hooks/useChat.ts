import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types/chat';
import { initialChatMessages, suggestedQuestions } from '../data/mockChat';
import * as chatService from '../services/chatService';

export function useChat(locationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await chatService.sendChatMessage(text, locationId);
        setMessages((prev) => [...prev, response]);
      } catch (err: unknown) {
        const errorText = err instanceof Error ? err.message : 'Unknown network/API error';
        console.error('[useChat Error]:', err);
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Connection error: ${errorText}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [locationId]
  );

  return { messages, isLoading, sendMessage, suggestedQuestions };
}
