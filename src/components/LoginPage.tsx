import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Sparkles,
  Sun,
  Moon,
  Check
} from 'lucide-react';
import { Logo } from './Logo';
import { useAccountStore } from '../stores/useAccountStore';
import { useThemeStore } from '../stores/useThemeStore';
import { LeosAccount } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { addAccount, setActiveAccount, accounts } = useAccountStore();
  const { resolvedTheme, setTheme } = useThemeStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<LeosAccount['type']>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunchWithProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const userEmail = email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@workspace`;

    // Create the account
    const newId = `acc-${Date.now()}`;
    addAccount({
      name: name.trim(),
      email: userEmail,
      type: accountType,
      isActive: true,
      connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'claude-3.5-sonnet', 'chatgpt-4o-free'],
      tokenStatus: 'healthy',
    });

    setActiveAccount(newId);
    localStorage.setItem('leos-logged-in', 'true');

    setTimeout(() => {
      onLoginSuccess();
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    const googleAccountName = name.trim() || 'Google Account';
    const googleEmail = email.trim() || 'user@gmail.com';

    addAccount({
      name: googleAccountName,
      email: googleEmail,
      type: 'personal',
      isActive: true,
      connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
      tokenStatus: 'healthy',
    });

    localStorage.setItem('leos-logged-in', 'true');
    setTimeout(() => {
      onLoginSuccess();
    }, 400);
  };

  const handleQuickOfflineStart = () => {
    setIsSubmitting(true);
    if (accounts.length === 0) {
      addAccount({
        name: 'Local User',
        email: 'local@device',
        type: 'personal',
        isActive: true,
        connectedModels: ['gemini-1.5-pro'],
        tokenStatus: 'healthy',
      });
    }
    localStorage.setItem('leos-logged-in', 'true');
    setTimeout(() => {
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-leos-dark text-leos-text selection:bg-leos-accent selection:text-black select-none p-6 relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar: Brand + Theme Toggle */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-wide text-leos-text">Leos</span>
            <span className="text-[10px] text-leos-muted font-mono tracking-wider">AI COCKPIT</span>
          </div>
        </div>

        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-leos-surface border border-leos-border text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover transition-all shadow-sm flex items-center gap-2 text-xs"
          title="Toggle Appearance"
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="bg-leos-surface/90 backdrop-blur-xl border border-leos-border rounded-3xl p-7 shadow-2xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-2xl bg-leos-card border border-leos-border shadow-inner">
                <Logo className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-leos-text">
              Welcome to Leos
            </h1>
            <p className="text-xs text-leos-muted max-w-xs mx-auto leading-relaxed">
              The Universal AI Cockpit. Multi-account isolation, offline local LLMs, and continuous cross-model chat.
            </p>
          </div>

          {/* Social / Google One-Click Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-leos-card hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight text-xs font-semibold text-leos-text transition-all shadow-sm disabled:opacity-50"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-leos-border"></div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-leos-muted">OR CREATE PROFILE</span>
              <div className="flex-1 h-px bg-leos-border"></div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleLaunchWithProfile} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-medium text-leos-muted block mb-1">
                Your Name / Username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mehar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-leos-card border border-leos-border focus:border-leos-accent text-xs text-leos-text outline-none transition-colors placeholder:text-leos-muted/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-leos-muted block mb-1">
                Email / Partition Identifier
              </label>
              <input
                type="email"
                placeholder="mehar@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-leos-card border border-leos-border focus:border-leos-accent text-xs text-leos-text outline-none transition-colors placeholder:text-leos-muted/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-leos-muted block mb-1">
                Profile Partition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['personal', 'work', 'student'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium capitalize transition-all ${
                      accountType === type
                        ? 'bg-leos-accent/15 border-leos-accent text-leos-accent font-semibold'
                        : 'bg-leos-card border-leos-border text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-leos-accent hover:bg-amber-500 text-black text-xs font-semibold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              <span>Launch Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Start without credentials */}
          <div className="pt-2 border-t border-leos-border text-center">
            <button
              type="button"
              onClick={handleQuickOfflineStart}
              className="text-[11px] text-leos-muted hover:text-leos-text transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Use Offline Mode (Ollama & LM Studio)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Security Badge */}
      <footer className="w-full max-w-md mx-auto text-center z-10 space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-leos-muted font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hardware-isolated local sessions • Zero intermediary servers</span>
        </div>
      </footer>
    </div>
  );
};
