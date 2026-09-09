import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import { Send, Loader2, MessageSquare, Bot } from 'lucide-react';

interface ChatUIProps {
  locationId?: string;
  className?: string;
}

export default function ChatUI({
  locationId = 'new-delhi',
  className = '',
}: ChatUIProps) {
  const { messages, isLoading, sendMessage, suggestedQuestions } = useChat(locationId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim() && !isLoading) {
      sendMessage(transcript.trim());
    }
  };

  const handleSuggestedClick = (text: string) => {
    if (isLoading) return;
    sendMessage(text);
  };

  const defaultPrompts = [
    'Will it rain today?',
    'What should I wear today?',
    'Is it safe to travel this evening?',
    'Show me the 3-day forecast',
  ];

  return (
    <div
      className={`flex flex-col h-full glass-panel rounded-2xl border border-white/[0.07] overflow-hidden relative w-full max-w-full ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-white/[0.07] bg-white/[0.01] shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center shrink-0">
            <Bot size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white leading-none truncate">
                WeatherGPT Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              Conversational weather reasoning & travel advisories
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto overflow-x-hidden space-y-3.5 bg-black/10 min-w-0 w-full">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5 sm:gap-3 w-full max-w-2xl min-w-0">
            <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-xs text-slate-300 min-w-0">
              <Loader2 size={14} className="animate-spin text-sky-400 shrink-0" />
              <span className="truncate">Analyzing atmospheric telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 sm:px-4 py-2 border-t border-white/[0.05] bg-white/[0.01] overflow-x-auto max-w-full scrollbar-none shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mr-0.5">
            Suggestions:
          </span>
          {(suggestedQuestions.length > 0
            ? suggestedQuestions.map((q) => q.text)
            : defaultPrompts
          ).map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestedClick(promptText)}
              disabled={isLoading}
              className="text-[11px] sm:text-xs bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-2.5 sm:p-3.5 border-t border-white/[0.07] bg-[#0d1322]/60 shrink-0 w-full max-w-full">
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2 w-full max-w-full">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather, rain risk, route safety..."
              disabled={isLoading}
              className="w-full pl-3 pr-8 sm:pr-9 py-2 sm:py-2.5 glass-input rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none transition-colors truncate"
            />
            <MessageSquare
              size={14}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
            className="shrink-0"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send question"
            className="p-2 sm:p-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-white/[0.05] text-white disabled:text-slate-500 rounded-xl font-medium transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
