import React, { useState } from 'react';
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
  Monitor
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useThemeStore, ThemeMode } from '../stores/useThemeStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { conversations } = useChatStore();
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [lmStudioUrl, setLmStudioUrl] = useState('http://localhost:1234');
  const [exported, setExported] = useState(false);

  const { theme, setTheme } = useThemeStore();

  if (!isOpen) return null;

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
      <div className="w-full max-w-lg bg-leos-surface border border-leos-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-leos-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-leos-accent" />
            <div>
              <h3 className="text-sm font-semibold text-leos-text">Settings & Preferences</h3>
              <p className="text-[11px] text-leos-muted">Themes, local endpoints, and zero-knowledge storage</p>
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
        <div className="p-4 overflow-y-auto max-h-80 space-y-4">
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
          {/* Local LLM Ports */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Local Desktop LLM Endpoints</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-leos-muted block mb-1">Ollama Host</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-leos-muted block mb-1">LM Studio Endpoint</label>
                <input
                  type="text"
                  value={lmStudioUrl}
                  onChange={(e) => setLmStudioUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Data Export & Portability */}
          <div className="pt-2 border-t border-leos-border space-y-2">
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
          <div className="pt-2 border-t border-leos-border space-y-2">
            <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Knowledge Vault</span>
            </div>
            <p className="text-[11px] text-leos-muted leading-relaxed">
              Your conversations and partition cookies are stored purely on your local machine. No external servers ever read or log your prompts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-leos-dark border-t border-leos-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-leos-accent text-black text-xs font-semibold hover:bg-amber-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
