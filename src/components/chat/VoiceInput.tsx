import { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript?: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInput({
  onTranscript,
  disabled = false,
  className = '',
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = useCallback(() => {
    if (disabled) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    // Safely check for browser SpeechRecognition API
    const windowObj = window as unknown as Record<string, unknown>;
    const SpeechRecognitionClass = (windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition) as
      | { new (): {
          lang: string;
          interimResults: boolean;
          maxAlternatives: number;
          onstart: (() => void) | null;
          onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null;
          onerror: (() => void) | null;
          onend: (() => void) | null;
          start: () => void;
          stop: () => void;
        } }
      | undefined;

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (onTranscript && transcript) {
            onTranscript(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        // Fallback simulation mode
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
        }, 3000);
      }
    } else {
      // Simulation mode for environments without native Web Speech API
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    }
  }, [disabled, isListening, onTranscript]);

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
      title={isListening ? 'Listening... click to stop' : 'Voice input'}
      className={`relative p-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0 ${
        isListening
          ? 'bg-rose-500 text-white shadow-sm'
          : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {isListening ? (
        <>
          <MicOff size={16} />
          <span className="sr-only">Listening...</span>
        </>
      ) : (
        <Mic size={16} />
      )}
    </button>
  );
}
