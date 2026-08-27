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
      } catch {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
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
