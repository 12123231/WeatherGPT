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
      className={`flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                WeatherGPT Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ask any question about weather forecasts, safety, and travel
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 w-full max-w-2xl">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot size={18} />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3.5 shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <Loader2 size={14} className="animate-spin text-blue-600" />
              <span>Analyzing meteorological models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles size={12} className="text-amber-500" /> Suggestions:
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
              className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 px-3 py-1 rounded-full transition-all text-left whitespace-nowrap disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rain, temperature, storm alerts, or travel safety..."
              disabled={isLoading}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all disabled:opacity-50"
            />
            <MessageSquare
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-medium transition-colors shrink-0 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
