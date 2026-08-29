import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import { Send, Sparkles, Loader2, MessageSquare, Bot } from 'lucide-react';

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
    "Show me this week's forecast",
  ];

  return (
    <div
      className={`flex flex-col h-full glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/25 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white leading-tight">
                WeatherGPT Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Model
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Natural language meteorological reasoning & travel advisory engine
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/20">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 w-full max-w-2xl animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-blue-500/25 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
              <Bot size={16} />
            </div>
            <div className="glass-pill p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-2.5 text-xs text-slate-300 shadow-md">
              <Loader2 size={15} className="animate-spin text-blue-400" />
              <span>Synthesizing atmospheric models & telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-5 py-3 border-t border-white/[0.08] bg-white/[0.02] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 uppercase tracking-wider">
            <Sparkles size={12} className="text-blue-400" /> Quick Prompts:
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
              className="text-xs glass-pill hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 text-slate-300 px-3.5 py-1.5 rounded-full transition-all text-left whitespace-nowrap disabled:opacity-50 cursor-pointer active:scale-95 shadow-xs"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-white/10 bg-slate-950/40">
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about precipitation, temperature, storm alerts, or transit safety..."
              disabled={isLoading}
              className="w-full pl-4 pr-10 py-3 glass-input rounded-2xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all duration-200"
            />
            <MessageSquare
              size={17}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send question"
            className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.08] text-white disabled:text-slate-500 rounded-2xl font-semibold transition-all duration-200 shrink-0 shadow-lg shadow-blue-600/20 cursor-pointer disabled:cursor-not-allowed active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
