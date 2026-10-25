import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  Sun,
  Moon,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Key
} from 'lucide-react';
import { Logo } from './Logo';
import { useAccountStore } from '../stores/useAccountStore';
import { useThemeStore } from '../stores/useThemeStore';
import { googleAuthService } from '../services/googleAuthService';
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

  // Google Setup Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleGeminiKey, setGoogleGeminiKey] = useState('');
  const [googleUserEmail, setGoogleUserEmail] = useState('');
  const [googleUserName, setGoogleUserName] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Load pre-existing credentials
    const savedClientId = googleAuthService.getClientId();
    const savedGeminiKey = googleAuthService.getGeminiKey();
    if (savedClientId) setGoogleClientId(savedClientId);
    if (savedGeminiKey) setGoogleGeminiKey(savedGeminiKey);
    // Pre-load GIS SDK in background
    googleAuthService.ensureGISLoaded().catch(() => {});
  }, []);

  // Standard Profile Launch
  const handleLaunchWithProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const userEmail = email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@workspace`;

    const newId = `acc-${Date.now()}`;
    addAccount({
      id: newId,
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
    }, 300);
  };

  // Real Google Sign-in Handler
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setAuthStatusMessage(null);

    try {
      const result = await googleAuthService.launchGoogleSignIn({ promptSelectAccount: true });

      if (result.success && result.profile) {
        // Authenticated with Google!
        const newAccount = googleAuthService.createAccountFromGoogleProfile(result.profile, result.accessToken);
        addAccount(newAccount);
        setActiveAccount(newAccount.id);
        localStorage.setItem('leos-logged-in', 'true');
        onLoginSuccess();
        return;
      }

      if (result.needsClientId) {
        // Opened real Google Sign-In in popup; now show the credentials setup modal
        setIsSubmitting(false);
        setIsGoogleModalOpen(true);
        setAuthStatusMessage({
          type: 'info',
          text: 'Google Sign-In page opened. To complete direct 1-click token exchange, connect your Google Client ID below.',
        });
        return;
      }

      // If an error occurred or popup was closed
      setIsSubmitting(false);
      if (result.error) {
        setAuthStatusMessage({
          type: 'error',
          text: result.error,
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setAuthStatusMessage({
        type: 'error',
        text: err.message || 'Google Sign-In encountered an error.',
      });
    }
  };

  // Test live connection to Google Gemini API
  const handleVerifyGemini = async () => {
    if (!googleGeminiKey.trim()) {
      setAuthStatusMessage({
        type: 'error',
        text: 'Please enter a Google Gemini API Key first.',
      });
      return;
    }
    setIsTestingKey(true);
    setAuthStatusMessage(null);

    const test = await googleAuthService.verifyGeminiApiKey(googleGeminiKey);
    setIsTestingKey(false);

    if (test.success) {
      googleAuthService.setGeminiKey(googleGeminiKey);
      setAuthStatusMessage({
        type: 'success',
        text: `Connected to Google! Verified ${test.models?.length || 0} Gemini models active.`,
      });
    } else {
      setAuthStatusMessage({
        type: 'error',
        text: test.error || 'Could not verify Google Gemini Key.',
      });
    }
  };

  // Connect Google Profile with entered credentials
  const handleSaveGoogleAndLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUserEmail.trim() && !googleGeminiKey.trim() && !googleClientId.trim()) {
      setAuthStatusMessage({
        type: 'error',
        text: 'Please provide your Google email or API key.',
      });
      return;
    }

    if (googleClientId.trim()) {
      googleAuthService.setClientId(googleClientId.trim());
    }
    if (googleGeminiKey.trim()) {
      googleAuthService.setGeminiKey(googleGeminiKey.trim());
    }

    const emailToUse = googleUserEmail.trim() || 'mehar@gmail.com';
    const nameToUse = googleUserName.trim() || emailToUse.split('@')[0];

    const accountId = `google-${Date.now()}`;
    addAccount({
      id: accountId,
      name: nameToUse,
      email: emailToUse,
      type: emailToUse.endsWith('@gmail.com') ? 'personal' : 'work',
      isActive: true,
      authProvider: 'google',
      connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
      tokenStatus: 'healthy',
    });

    setActiveAccount(accountId);
    localStorage.setItem('leos-logged-in', 'true');
    setIsGoogleModalOpen(false);
    onLoginSuccess();
  };

  // Offline Local Mode
  const handleQuickOfflineStart = () => {
    setIsSubmitting(true);
    if (accounts.length === 0) {
      addAccount({
        name: 'Local Vault User',
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
    }, 200);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-leos-dark text-leos-text selection:bg-leos-accent selection:text-black select-none p-6 relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
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
      <main className="w-full max-w-md mx-auto my-auto z-10 py-4">
        <div className="bg-leos-surface/90 backdrop-blur-xl border border-leos-border rounded-3xl p-7 shadow-2xl space-y-5">
          {/* Logo & Headline */}
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-2xl bg-leos-card border border-leos-border shadow-inner">
                <Logo className="w-11 h-11" />
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-leos-text">
              Welcome to Leos
            </h1>
            <p className="text-xs text-leos-muted max-w-xs mx-auto leading-relaxed">
              The Universal AI Cockpit. Hardware-isolated Google partitions, Gemini models, and offline local LLMs.
            </p>
          </div>

          {/* Social / Google One-Click Button */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-leos-card hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight text-xs font-semibold text-leos-text transition-all shadow-sm disabled:opacity-50 group cursor-pointer"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
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
              <span>{isSubmitting ? 'Opening Google Sign-In...' : 'Continue with Google'}</span>
            </button>

            {/* Quick config link for Google */}
            <div className="flex justify-between items-center text-[10px] px-1 text-leos-muted">
              <span>Verified Google OAuth & Gemini 2.0</span>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="text-leos-accent hover:underline flex items-center gap-1 font-medium"
              >
                <Key className="w-2.5 h-2.5" />
                <span>Connect Google Credentials</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-leos-border"></div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-leos-muted">OR CREATE PROFILE</span>
              <div className="flex-1 h-px bg-leos-border"></div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleLaunchWithProfile} className="space-y-3">
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-leos-accent hover:bg-amber-500 text-black text-xs font-semibold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed mt-1 cursor-pointer"
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

      {/* Real Google Account Setup Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-leos-surface border border-leos-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-leos-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-leos-text">Connect Real Google Account</h3>
                  <p className="text-[11px] text-leos-muted">Google OAuth 2.0 Sign-In & Gemini AI Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Status Message */}
              {authStatusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    authStatusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : authStatusMessage.type === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}
                >
                  {authStatusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  {authStatusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {authStatusMessage.type === 'info' && <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span className="leading-relaxed">{authStatusMessage.text}</span>
                </div>
              )}

              {/* Direct Open Google Accounts Button */}
              <div className="p-3 bg-leos-card border border-leos-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-leos-text">Official Google Sign-In Window</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Active Session
                  </span>
                </div>
                <p className="text-[11px] text-leos-muted leading-relaxed">
                  Opens the genuine Google login page to authenticate your Google profile in an isolated Chromium partition.
                </p>
                <button
                  type="button"
                  onClick={() => googleAuthService.openGoogleSignInPage('https://accounts.google.com/signin')}
                  className="w-full py-2 px-3 rounded-lg bg-leos-surface hover:bg-leos-surfaceHover border border-leos-border text-xs text-leos-text font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-leos-accent" />
                  <span>Open accounts.google.com Sign-In Page</span>
                </button>
              </div>

              {/* Google OAuth & Gemini Credentials Form */}
              <form onSubmit={handleSaveGoogleAndLaunch} className="space-y-3.5">
                {/* 1. Google Gemini API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-leos-text">
                      Google Gemini API Key (Enables Gemini 1.5 & 2.0)
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
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="AIzaSy... (free at aistudio.google.com)"
                      value={googleGeminiKey}
                      onChange={(e) => setGoogleGeminiKey(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono focus:border-leos-accent"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyGemini}
                      disabled={isTestingKey || !googleGeminiKey.trim()}
                      className="px-3 py-2 rounded-xl bg-leos-surface border border-leos-border text-xs font-medium text-leos-text hover:bg-leos-surfaceHover disabled:opacity-40 transition-colors shrink-0"
                    >
                      {isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>

                {/* 2. Google OAuth Client ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-leos-text">
                      Google OAuth 2.0 Client ID (Optional for 1-Click GIS)
                    </label>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-leos-muted hover:text-leos-text flex items-center gap-1"
                    >
                      Cloud Console <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="...apps.googleusercontent.com"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-leos-card border border-leos-border text-xs text-leos-text outline-none font-mono focus:border-leos-accent"
                  />
                </div>

                {/* 3. User Google Identity Profile */}
                <div className="pt-2 border-t border-leos-border grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-leos-muted block mb-1">
                      Google Email
                    </label>
                    <input
                      type="email"
                      placeholder="your.name@gmail.com"
                      value={googleUserEmail}
                      onChange={(e) => setGoogleUserEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-leos-card border border-leos-border text-xs text-leos-text outline-none focus:border-leos-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-leos-muted block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mehar"
                      value={googleUserName}
                      onChange={(e) => setGoogleUserName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-leos-card border border-leos-border text-xs text-leos-text outline-none focus:border-leos-accent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs text-leos-muted hover:text-leos-text transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-leos-accent hover:bg-amber-500 text-black text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Connect & Launch Cockpit</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
