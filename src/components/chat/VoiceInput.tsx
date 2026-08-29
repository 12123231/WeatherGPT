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
      className={`relative p-3 rounded-2xl transition-all duration-200 flex items-center justify-center shrink-0 ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
          : 'glass-pill text-slate-300 hover:text-white hover:bg-white/[0.12]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'} ${className}`}
    >
      {isListening ? (
        <>
          <MicOff size={18} />
          <span className="sr-only">Listening...</span>
        </>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}
