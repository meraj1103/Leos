import React, { useState, useRef, useEffect } from 'react';
import { 
  PanelLeft, 
  ChevronDown, 
  Headphones, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { useModelStore } from '../stores/useModelStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useThemeStore } from '../stores/useThemeStore';
import { LeosModel } from '../types';
import { InstallButton } from './InstallButton';

interface TopBarProps {
  onToggleSidebar: () => void;
  onOpenVoiceModal: () => void;
  onOpenAccounts: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onOpenVoiceModal,
  onOpenAccounts,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { models, activeModelId, setActiveModel } = useModelStore();
  const { accounts, activeAccountId } = useAccountStore();
  const { resolvedTheme, setTheme } = useThemeStore();

  const activeModel = models.find((m) => m.id === activeModelId) || models[0];
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (model: LeosModel) => {
    setActiveModel(model.id);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-12 border-b border-leos-border bg-leos-surface/80 backdrop-blur-md px-3 flex items-center justify-between select-none z-20">
      {/* Left: Sidebar Toggle + Model Selector Pill */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text transition-colors"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Active Model Selector Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-leos-card hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight transition-all text-xs font-medium text-leos-text shadow-sm"
          >
            {activeModel.isLocal ? (
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-leos-accent" />
            )}
            <span>{activeModel.name}</span>
            {activeModel.tag && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-leos-border text-leos-muted">
                {activeModel.tag}
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-leos-muted ml-0.5" />
          </button>

          {/* Model Selection Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 max-h-96 overflow-y-auto bg-leos-surface border border-leos-border rounded-xl shadow-xl z-50 p-1.5 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-leos-muted">
                Select Model Engine
              </div>

              {/* Cloud Models */}
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[11px] font-medium text-leos-muted flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-leos-accent" />
                  <span>Cloud & Multi-Account</span>
                </div>
                {models
                  .filter((m) => !m.isLocal)
                  .map((m) => {
                    const isSelected = m.id === activeModelId;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectModel(m)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-leos-surfaceHover text-leos-text font-medium'
                            : 'text-leos-muted hover:bg-leos-card hover:text-leos-text'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-leos-text font-medium">{m.name}</span>
                          <span className="text-[10px] text-leos-muted truncate">{m.description}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-leos-accent shrink-0 ml-2" />}
                      </div>
                    );
                  })}
              </div>

              {/* Local Desktop Models */}
              <div className="pt-1.5 border-t border-leos-border space-y-0.5">
                <div className="px-2 py-1 text-[11px] font-medium text-leos-muted flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  <span>Local Desktop (Offline GPU)</span>
                </div>
                {models
                  .filter((m) => m.isLocal)
                  .map((m) => {
                    const isSelected = m.id === activeModelId;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectModel(m)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-leos-surfaceHover text-leos-text font-medium'
                            : 'text-leos-muted hover:bg-leos-card hover:text-leos-text'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-leos-text font-medium">{m.name}</span>
                          <span className="text-[10px] text-leos-muted truncate">{m.description}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Current Active Account Indicator */}
        <button
          onClick={onOpenAccounts}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover transition-colors border border-transparent hover:border-leos-border"
          title="Active Google Account Session"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-mono text-[10px] truncate max-w-[140px]">{activeAccount?.email}</span>
        </button>
      </div>

      {/* Right: Actions (Voice Talk Mode, Split View, Privacy Badge) */}
      <div className="flex items-center gap-1.5">
        {/* 1-Tap PWA Install Button (shows when installable on Android / Laptop browser) */}
        <InstallButton />

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg bg-leos-card hover:bg-leos-surfaceHover border border-leos-border text-leos-muted hover:text-leos-text transition-colors shadow-sm"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-purple-400" />
          )}
        </button>

        {/* Two-Way Voice Talk Mode Button */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-leos-card hover:bg-leos-surfaceHover border border-leos-border text-xs font-medium text-leos-text transition-all hover:border-leos-borderLight shadow-sm"
          title="Two-Way Voice Conversation"
        >
          <Headphones className="w-3.5 h-3.5 text-leos-accent" />
          <span className="hidden sm:inline">Voice Talk</span>
        </button>

        {/* Zero-Knowledge Privacy Badge */}
        <div 
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-leos-dark/60 text-[10px] text-leos-muted font-mono border border-leos-border/50"
          title="Local-First Zero-Knowledge Architecture"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Local Vault</span>
        </div>
      </div>
    </header>
  );
};
