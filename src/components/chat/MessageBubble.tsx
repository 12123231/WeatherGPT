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
        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
          isAssistant
            ? 'bg-blue-500/25 border border-blue-400/30 text-blue-300 shadow-blue-500/20'
            : 'bg-indigo-600 text-white shadow-indigo-600/30'
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
          <span className={isAssistant ? 'text-blue-300 font-semibold' : 'text-slate-300'}>
            {isAssistant ? 'WeatherGPT AI' : 'You'}
          </span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Message Content */}
        <div
          className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-line shadow-md ${
            isAssistant
              ? 'glass-panel text-slate-100 rounded-tl-xs border border-white/10'
              : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-blue-500/20 border border-blue-400/30'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
