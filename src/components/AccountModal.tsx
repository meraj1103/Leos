import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  Key
} from 'lucide-react';
import { useAccountStore } from '../stores/useAccountStore';
import { googleAuthService } from '../services/googleAuthService';
import { LeosAccount } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { accounts, activeAccountId, setActiveAccount, addAccount, removeAccount } = useAccountStore();
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<LeosAccount['type']>('personal');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  // Real Google Sign-in to link another Google account
  const handleConnectGoogle = async () => {
    setIsSigningInGoogle(true);
    setStatusMessage(null);

    try {
      const result = await googleAuthService.launchGoogleSignIn({ promptSelectAccount: true });

      if (result.success && result.profile) {
        const newAccount = googleAuthService.createAccountFromGoogleProfile(result.profile, result.accessToken);
        addAccount(newAccount);
        setActiveAccount(newAccount.id);
        setStatusMessage({
          type: 'success',
          text: `Connected ${result.profile.email} as active Google account.`,
        });
        setIsSigningInGoogle(false);
        return;
      }

      if (result.needsClientId) {
        setIsSigningInGoogle(false);
        setStatusMessage({
          type: 'info',
          text: 'Google Sign-In page opened. If you have a Google OAuth Client ID, set it in Settings (⚙️) to link tokens automatically.',
        });
        return;
      }

      setIsSigningInGoogle(false);
      if (result.error) {
        setStatusMessage({
          type: 'error',
          text: result.error,
        });
      }
    } catch (err: any) {
      setIsSigningInGoogle(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Google account linking failed.',
      });
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    addAccount({
      name: newName.trim() || 'Custom Account',
      email: newEmail.trim(),
      type: newType,
      isActive: true,
      connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
      tokenStatus: 'healthy',
    });

    setNewEmail('');
    setNewName('');
    setShowManualForm(false);
    setStatusMessage({
      type: 'success',
      text: 'New partition created successfully.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-leos-surface border border-leos-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-leos-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-leos-accent" />
            <div>
              <h3 className="text-sm font-semibold text-leos-text">Account Partition Manager</h3>
              <p className="text-[11px] text-leos-muted">Isolated Chromium storage partitions for each Google and custom identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 border-b text-xs flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : statusMessage.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'info' && <ExternalLink className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-leos-muted hover:text-leos-text p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Account List */}
        <div className="p-4 overflow-y-auto max-h-72 space-y-2">
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
            const isGoogle = acc.authProvider === 'google' || acc.email.endsWith('@gmail.com');

            return (
              <div
                key={acc.id}
                onClick={() => setActiveAccount(acc.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-leos-card border-leos-accent shadow-sm'
                    : 'bg-leos-surface border-leos-border hover:border-leos-borderLight'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar: Google profile image or initials */}
                  {acc.avatarUrl ? (
                    <img
                      src={acc.avatarUrl}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full object-cover border border-leos-border shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-leos-accent to-amber-600 flex items-center justify-center text-xs font-semibold text-black shrink-0">
                      {acc.name ? acc.name.charAt(0) : 'U'}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-leos-text truncate">{acc.name}</span>
                      
                      {isGoogle && (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          Google
                        </span>
                      )}

                      <span className="text-[10px] font-mono uppercase bg-leos-border px-1.5 py-0.2 rounded text-leos-muted">
                        {acc.type}
                      </span>
                    </div>

                    <span className="text-xs text-leos-muted font-mono truncate">{acc.email}</span>
                    <span className="text-[10px] text-leos-muted/70 font-mono mt-0.5 truncate">
                      Partition: {acc.partition}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAccount(acc.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-500/10 text-leos-muted hover:text-red-400 transition-colors"
                      title="Remove Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons to Add / Link Google or Custom Account */}
        <div className="p-4 border-t border-leos-border bg-leos-dark/30 space-y-3">
          {/* Primary Action: Link Another Google Account */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={isSigningInGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-leos-card hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight text-xs font-semibold text-leos-text transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isSigningInGoogle ? 'Connecting Google Account...' : 'Sign In With Another Google Account'}</span>
            </button>

            {/* Toggle custom partition form */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-[11px] text-leos-muted hover:text-leos-text transition-colors"
              >
                {showManualForm ? 'Hide manual partition form' : '+ Create custom local partition without Google'}
              </button>
            </div>
          </div>

          {/* Manual Partition Form */}
          {showManualForm && (
            <form onSubmit={handleCreateManual} className="pt-2 border-t border-leos-border/60 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Partition Name (e.g. Work, Research)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none placeholder:text-leos-muted focus:border-leos-borderLight"
                />
                <input
                  type="email"
                  placeholder="Email or Identifier"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none placeholder:text-leos-muted focus:border-leos-borderLight"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                  {(['personal', 'work', 'student'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                        newType === t
                          ? 'bg-leos-accent text-black font-semibold'
                          : 'bg-leos-card text-leos-muted hover:text-leos-text'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-leos-accent hover:bg-amber-500 text-black text-xs font-semibold transition-all shadow-sm"
                >
                  Create Partition
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Privacy Notice */}
        <div className="p-3 bg-leos-dark border-t border-leos-border flex items-center gap-2 text-[10px] text-leos-muted font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Each account operates in a discrete Chromium sandbox. Cookies and tokens never mix.</span>
        </div>
      </div>
    </div>
  );
};
