import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  PhoneOff,
  Radio
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useModelStore } from '../stores/useModelStore';
import { useAccountStore } from '../stores/useAccountStore';
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

  const { models, activeModelId } = useModelStore();
  const { accounts, activeAccountId } = useAccountStore();

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
    setIsListening(true);
    setStatusMessage(`Connected to ${activeModel.name}`);
    
    speechService.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        setUserTranscript(transcript);
        if (isFinal) {
          handleUserFinishedSpeaking(transcript);
        }
      },
      onError: (err) => {
        setStatusMessage(`Mic error: ${err}`);
      },
      onEnd: () => {
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
        conversationHistory: [],
        onChunk: (chunk) => {
          accumulated += chunk;
          setAiResponse(accumulated);
        },
      });

      setIsSpeaking(true);
      setStatusMessage(`${activeModel.name} is speaking...`);

      speechService.speak(accumulated, () => {
        setIsSpeaking(false);
        // Automatically resume listening for continuous two-way talk
        startVoiceSession();
      });
    } catch (err: any) {
      setStatusMessage(`Error generating response: ${err.message || err}`);
      setTimeout(() => startVoiceSession(), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-leos-surface border border-leos-border rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Model / Status Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-leos-text">{activeModel.name}</span>
            <span className="text-[10px] text-leos-muted font-mono">({activeAccount.email})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimalist Pulsing Voice Orb (No Emojis) */}
        <div className="relative my-8 flex items-center justify-center">
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
          <span className="text-xs font-medium text-leos-text block mb-1">{statusMessage}</span>
          <span className="text-[11px] text-leos-muted font-mono block">
            {isSpeaking ? 'Speaking back to you' : isListening ? 'Speak naturally...' : 'Connecting audio...'}
          </span>
        </div>

        {/* Live Subtitle Transcript */}
        <div className="w-full bg-leos-dark/60 border border-leos-border/60 rounded-xl p-3 min-h-[70px] max-h-32 overflow-y-auto mb-8 text-left">
          {userTranscript ? (
            <div className="text-xs text-leos-text leading-relaxed">
              <span className="text-leos-muted font-mono text-[10px] mr-1.5">You:</span>
              {userTranscript}
            </div>
          ) : aiResponse ? (
            <div className="text-xs text-leos-text leading-relaxed">
              <span className="text-leos-accent font-mono text-[10px] mr-1.5">{activeModel.name}:</span>
              {aiResponse}
            </div>
          ) : (
            <span className="text-xs text-leos-muted/60 italic">Voice transcript will appear here...</span>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isListening) {
                speechService.stopListening();
                setIsListening(false);
              } else {
                startVoiceSession();
              }
            }}
            className="p-3 rounded-full bg-leos-card hover:bg-leos-surfaceHover border border-leos-border text-leos-text transition-all"
            title={isListening ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isListening ? <Mic className="w-5 h-5 text-amber-400" /> : <MicOff className="w-5 h-5 text-leos-muted" />}
          </button>

          <button
            onClick={onClose}
            className="p-3.5 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 transition-all shadow-md"
            title="End Voice Conversation"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
