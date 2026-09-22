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
      className={`flex items-start gap-2.5 sm:gap-3 w-full max-w-full sm:max-w-2xl min-w-0 ${
        isAssistant ? 'self-start' : 'self-end flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
          isAssistant
            ? 'bg-white/[0.04] border border-white/[0.08] text-sky-400'
            : 'bg-sky-600 text-white'
        }`}
      >
        {isAssistant ? <Bot size={15} /> : <User size={15} />}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col ${
          isAssistant ? 'items-start' : 'items-end'
        } max-w-[88%] sm:max-w-[85%] min-w-0`}
      >
        {/* Author Label & Time */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[10px] sm:text-[11px] text-slate-400 font-medium">
          <span className={isAssistant ? 'text-sky-300 font-semibold' : 'text-slate-300'}>
            {isAssistant ? 'WeatherGPT' : 'You'}
          </span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Message Content */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] max-w-full ${
            isAssistant
              ? 'bg-white/[0.035] text-slate-100 border border-white/[0.06]'
              : 'bg-sky-600 text-white'
          }`}
        >
          {message.content ? message.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*\*/g, '') : ''}
        </div>
      </div>
    </div>
  );
}
