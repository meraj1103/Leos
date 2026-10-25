import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  Volume2, 
  Radio
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useModelStore } from '../stores/useModelStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useChatStore } from '../stores/useChatStore';
import { dispatchRealAI } from '../services/aiDispatcher';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [statusMessage, setStatusMessage] = useState('Listening to your voice...');
  const [voiceHistory, setVoiceHistory] = useState<{ role: 'user' | 'assistant' | 'system'; content: string }[]>([]);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const { models, activeModelId } = useModelStore();
  const { accounts, activeAccountId } = useAccountStore();
  const { addVoiceExchange } = useChatStore();

  const activeModel = models.find((m) => m.id === activeModelId) || models[0];
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      stopVoiceSession();
    }
    return () => stopVoiceSession();
  }, [isOpen]);

  const startVoiceSession = () => {
    if (!isOpenRef.current) return;
    setIsListening(true);
    setStatusMessage(`Listening for ${activeModel.name}...`);
    
    speechService.startListening({
      onStart: () => {
        if (!isOpenRef.current) return;
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        if (!isOpenRef.current) return;
        setUserTranscript(transcript);
        if (isFinal) {
          handleUserFinishedSpeaking(transcript);
        }
      },
      onError: (err) => {
        if (!isOpenRef.current) return;
        setStatusMessage(`Mic: ${err}`);
      },
      onEnd: () => {
        if (!isOpenRef.current) return;
        setIsListening(false);
      },
    });
  };

  const stopVoiceSession = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsListening(false);
    setIsSpeaking(false);
  };

  const handleUserFinishedSpeaking = async (finalText: string) => {
    if (!isOpenRef.current || !finalText.trim()) return;

    speechService.stopListening();
    setIsListening(false);
    setStatusMessage(`${activeModel.name} is thinking...`);
    setAiResponse('');

    let accumulated = '';
    try {
      await dispatchRealAI({
        modelId: activeModel.id,
        modelName: activeModel.name,
        provider: activeModel.provider,
        prompt: finalText,
        conversationHistory: voiceHistory,
        onChunk: (chunk) => {
          if (!isOpenRef.current) return;
          accumulated += chunk;
          setAiResponse(accumulated);
        },
      });

      if (!isOpenRef.current) return;

      // Update local memory so AI remembers previous turns in this conversation
      const updatedHistory = [
        ...voiceHistory,
        { role: 'user' as const, content: finalText },
        { role: 'assistant' as const, content: accumulated },
      ];
      setVoiceHistory(updatedHistory);

      // Save transcript into active thread in useChatStore
      addVoiceExchange(
        finalText,
        accumulated,
        activeModel.name,
        activeModel.provider,
        activeAccount?.email
      );

      setIsSpeaking(true);
      setStatusMessage(`${activeModel.name} is speaking...`);

      speechService.speak(accumulated, () => {
        if (!isOpenRef.current) return;
        setIsSpeaking(false);
        // Automatically resume listening for continuous two-way talk
        startVoiceSession();
      });
    } catch (err: any) {
      if (!isOpenRef.current) return;
      setStatusMessage(`Error: ${err.message || err}`);
      setTimeout(() => {
        if (isOpenRef.current) startVoiceSession();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-leos-surface border border-leos-border rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Model / Status Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-leos-text">{activeModel.name}</span>
            <span className="text-[10px] text-leos-muted font-mono">({activeAccount?.email || 'Connected'})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimalist Pulsing Voice Orb */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Animated concentric pulse rings */}
          <div
            className={`absolute w-36 h-36 rounded-full border border-leos-accent/30 transition-all duration-700 ${
              isListening || isSpeaking ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-20'
            }`}
          />
          <div
            className={`absolute w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500/20 to-purple-600/20 blur-md transition-all duration-500 ${
              isSpeaking ? 'scale-110 opacity-90' : 'scale-95 opacity-40'
            }`}
          />
          
          {/* Center Orb */}
          <div className="w-20 h-20 rounded-full bg-leos-card border border-leos-border flex items-center justify-center shadow-inner relative z-10">
            {isSpeaking ? (
              <Volume2 className="w-8 h-8 text-leos-accent animate-pulse" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-amber-400" />
            ) : (
              <Radio className="w-8 h-8 text-leos-muted" />
            )}
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="mb-4">
          <div className="text-xs font-medium text-leos-text font-mono mb-1">
            {statusMessage}
          </div>
          <p className="text-[11px] text-leos-muted">
            {isListening ? 'Speak naturally into your microphone.' : isSpeaking ? 'Listening will resume when speech finishes.' : 'Processing...'}
          </p>
        </div>

        {/* Live Transcript Bubble */}
        {(userTranscript || aiResponse) && (
          <div className="w-full bg-leos-card border border-leos-border rounded-xl p-3 text-left space-y-2 max-h-40 overflow-y-auto mb-4 text-xs">
            {userTranscript && (
              <div>
                <span className="text-[10px] font-semibold text-leos-accent uppercase font-mono block">You said:</span>
                <p className="text-leos-text">{userTranscript}</p>
              </div>
            )}
            {aiResponse && (
              <div className="pt-1 border-t border-leos-border/50">
                <span className="text-[10px] font-semibold text-blue-400 uppercase font-mono block">{activeModel.name}:</span>
                <p className="text-leos-text leading-relaxed">{aiResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isListening) {
                speechService.stopListening();
                setIsListening(false);
                setStatusMessage('Paused. Tap Mic to resume.');
              } else {
                startVoiceSession();
              }
            }}
            className="px-4 py-2 rounded-xl bg-leos-card hover:bg-leos-surfaceHover border border-leos-border text-xs font-medium text-leos-text flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>{isListening ? 'Pause Mic' : 'Resume Mic'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 cursor-pointer shadow-sm"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};
