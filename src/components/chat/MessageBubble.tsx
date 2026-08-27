import type { ChatMessage } from '../../types/chat';
import { formatTime } from '../../utils/formatters';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-2xl ${
        isAssistant ? 'self-start' : 'self-end flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
          isAssistant
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-white'
        }`}
      >
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col ${
          isAssistant ? 'items-start' : 'items-end'
        } max-w-[85%]`}
      >
        {/* Author Label & Time */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 font-medium">
          <span>{isAssistant ? 'WeatherGPT' : 'You'}</span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Message Content */}
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs ${
            isAssistant
              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              : 'bg-blue-600 text-white rounded-tr-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
