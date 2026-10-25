// Chromium Native Speech Recognition and Synthesis Controller

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class LeosSpeechController {
  private recognition: any = null;
  private isListening = false;
  private isStarting = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Check for Chromium SpeechRecognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }

      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices(): void {
    if ('speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
  }

  public get isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(handlers: SpeechRecognitionHandlers): void {
    if (!this.recognition || this.isListening || this.isStarting) return;

    this.isStarting = true;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.isStarting = false;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      if (text) {
        handlers.onResult?.(text, !!finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      this.isStarting = false;
      // 'no-speech' is a normal silence timeout event, avoid noisy error display
      if (event.error !== 'no-speech') {
        handlers.onError?.(event.error || 'Speech recognition error');
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.isStarting = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      this.isStarting = false;
      console.warn('Speech recognition start failed or already active:', err);
    }
  }

  public stopListening(): void {
    if (!this.recognition) return;
    this.isListening = false;
    this.isStarting = false;
    try {
      this.recognition.stop();
    } catch (err) {
      console.warn('Speech recognition stop warning:', err);
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech

      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/[#*_`]/g, '')
        .trim();

      if (!cleanText) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Pick a natural voice if available
      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onend = () => {
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis speak exception:', err);
      onEnd?.();
    }
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new LeosSpeechController();
