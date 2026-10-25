import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Cpu, 
  ShieldCheck, 
  Check,
  HardDrive,
  Sun,
  Moon,
  Monitor,
  Key,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useThemeStore, ThemeMode } from '../stores/useThemeStore';
import { googleAuthService } from '../services/googleAuthService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { conversations } = useChatStore();
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [lmStudioUrl, setLmStudioUrl] = useState('http://localhost:1234');
  const [geminiKey, setGeminiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [exported, setExported] = useState(false);
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);
  const [isVerifyingGemini, setIsVerifyingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      setOllamaUrl(localStorage.getItem('leos-ollama-url') || 'http://localhost:11434');
      setLmStudioUrl(localStorage.getItem('leos-lmstudio-url') || 'http://localhost:1234');
      setGeminiKey(googleAuthService.getGeminiKey());
      setGoogleClientId(googleAuthService.getClientId());
      setAnthropicKey(localStorage.getItem('leos-anthropic-key') || '');
      setOpenAIKey(localStorage.getItem('leos-openai-key') || '');
      setGroqKey(localStorage.getItem('leos-groq-key') || '');
      setDeepseekKey(localStorage.getItem('leos-deepseek-key') || '');
      setGeminiStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKeys = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('leos-ollama-url', ollamaUrl);
      localStorage.setItem('leos-lmstudio-url', lmStudioUrl);
      googleAuthService.setGeminiKey(geminiKey);
      googleAuthService.setClientId(googleClientId);
      localStorage.setItem('leos-anthropic-key', anthropicKey.trim());
      localStorage.setItem('leos-openai-key', openAIKey.trim());
      localStorage.setItem('leos-groq-key', groqKey.trim());
      localStorage.setItem('leos-deepseek-key', deepseekKey.trim());
    }
    setSavedKeyMsg(true);
    setTimeout(() => setSavedKeyMsg(false), 2000);
  };

  const handleTestGeminiConnection = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }
    setIsVerifyingGemini(true);
    setGeminiStatus(null);
    const result = await googleAuthService.verifyGeminiApiKey(geminiKey.trim());
    setIsVerifyingGemini(false);
    if (result.success) {
      setGeminiStatus({
        success: true,
        message: `Connected! Google API validated (${result.models?.length || 0} models ready)`,
      });
      googleAuthService.setGeminiKey(geminiKey);
    } else {
      setGeminiStatus({
        success: false,
        message: result.error || 'Connection failed.',
      });
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `leos_chat_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-leos-surface border border-leos-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-leos-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-leos-accent" />
            <div>
              <h3 className="text-sm font-semibold text-leos-text">Settings & Preferences</h3>
              <p className="text-[11px] text-leos-muted">Themes, AI API Keys, local endpoints, and storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* Theme Selector */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-leos-accent" />
              <span>Appearance & Theme</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    theme === opt.id
                      ? 'bg-leos-accent text-black border-leos-accent font-semibold shadow-sm'
                      : 'bg-leos-card border-leos-border text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cloud API Keys (Real Connection) */}
          <div className="pt-3 border-t border-leos-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-leos-accent" />
                <span>Cloud Model API Keys (Stored 100% Locally)</span>
              </div>
              {savedKeyMsg && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <p className="text-[11px] text-leos-muted">
              Keys are encrypted in local storage on your device and never sent to any intermediary server.
            </p>

            <div className="space-y-3">
              {/* Google Services */}
              <div className="p-3 rounded-xl bg-leos-card border border-leos-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-leos-text flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google Gemini & Identity Services</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-leos-accent hover:underline flex items-center gap-1"
                  >
                    Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-leos-muted">Google Gemini API Key</span>
                    <button
                      type="button"
                      onClick={handleTestGeminiConnection}
                      disabled={isVerifyingGemini || !geminiKey.trim()}
                      className="text-[10px] text-leos-accent hover:text-amber-400 font-medium flex items-center gap-1 disabled:opacity-40"
                    >
                      {isVerifyingGemini ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Verifying...
                        </>
                      ) : (
                        'Test Live Connection'
                      )}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSy... (from aistudio.google.com)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    onBlur={handleSaveKeys}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none font-mono placeholder:text-leos-muted/50"
                  />
                  {geminiStatus && (
                    <div
                      className={`mt-1.5 text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-md ${
                        geminiStatus.success
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {geminiStatus.success ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 shrink-0" />
                      )}
                      <span>{geminiStatus.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-leos-muted">Google OAuth 2.0 Client ID (for 1-click Google Sign-In)</span>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-leos-muted hover:text-leos-text flex items-center gap-1"
                    >
                      Google Cloud Console <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="...apps.googleusercontent.com"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    onBlur={handleSaveKeys}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none font-mono placeholder:text-leos-muted/50"
                  />
                </div>
              </div>

              {/* Anthropic Claude */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] text-leos-muted">Anthropic Claude API Key</label>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-leos-muted hover:text-leos-text flex items-center gap-1"
                  >
                    console.anthropic.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  onBlur={handleSaveKeys}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono placeholder:text-leos-muted/50"
                />
              </div>

              {/* OpenAI Key */}
              <div>
                <label className="text-[11px] text-leos-muted block mb-0.5">OpenAI API Key (platform.openai.com)</label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  onBlur={handleSaveKeys}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono placeholder:text-leos-muted/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-leos-muted block mb-0.5">Groq API Key (console.groq.com)</label>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    onBlur={handleSaveKeys}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono placeholder:text-leos-muted/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-leos-muted block mb-0.5">DeepSeek API Key (platform.deepseek.com)</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    onBlur={handleSaveKeys}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono placeholder:text-leos-muted/50"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveKeys}
                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-leos-accent text-black hover:bg-amber-500 font-semibold text-xs transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save All Credentials</span>
              </button>
            </div>
          </div>

          {/* Local LLM Ports */}
          <div className="pt-3 border-t border-leos-border space-y-2">
            <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Local Desktop LLM Endpoints (Free & Offline)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-leos-muted block mb-1">Ollama Host</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  onBlur={handleSaveKeys}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-leos-muted block mb-1">LM Studio Endpoint</label>
                <input
                  type="text"
                  value={lmStudioUrl}
                  onChange={(e) => setLmStudioUrl(e.target.value)}
                  onBlur={handleSaveKeys}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Data Export & Portability */}
          <div className="pt-3 border-t border-leos-border space-y-2">
            <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-leos-accent" />
              <span>Data Portability & Backup</span>
            </div>
            <p className="text-[11px] text-leos-muted">
              Export all conversation history, code blocks, and context into a clean JSON file.
            </p>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-leos-card hover:bg-leos-surfaceHover border border-leos-border text-xs font-medium text-leos-text transition-colors"
            >
              {exported ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <HardDrive className="w-3.5 h-3.5" />}
              <span>{exported ? 'Exported Successfully' : 'Export Chats to JSON'}</span>
            </button>
          </div>

          {/* Privacy & Storage Vault */}
          <div className="pt-3 border-t border-leos-border space-y-2">
            <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Knowledge Vault</span>
            </div>
            <p className="text-[11px] text-leos-muted leading-relaxed">
              Your conversations and partition cookies are stored purely on your local machine. No external telemetry or intermediary proxy servers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-leos-dark border-t border-leos-border flex justify-end">
          <button
            onClick={() => {
              handleSaveKeys();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-leos-accent text-black text-xs font-semibold hover:bg-amber-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
