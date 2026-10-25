import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck
} from 'lucide-react';
import { useAccountStore } from '../stores/useAccountStore';
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

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    addAccount({
      name: newName.trim() || 'New Account',
      email: newEmail.trim(),
      type: newType,
      isActive: false,
      connectedModels: ['gemini-1.5-pro', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
      tokenStatus: 'healthy',
    });

    setNewEmail('');
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-leos-surface border border-leos-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-leos-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-leos-accent" />
            <div>
              <h3 className="text-sm font-semibold text-leos-text">Account Partition Manager</h3>
              <p className="text-[11px] text-leos-muted">Isolated Chromium storage partitions for each identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account List */}
        <div className="p-4 overflow-y-auto max-h-72 space-y-2">
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
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
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-leos-accent to-amber-600 flex items-center justify-center text-xs font-semibold text-black shrink-0">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-leos-text">{acc.name}</span>
                      <span className="text-[10px] font-mono uppercase bg-leos-border px-1.5 py-0.2 rounded text-leos-muted">
                        {acc.type}
                      </span>
                    </div>
                    <span className="text-xs text-leos-muted font-mono">{acc.email}</span>
                    <span className="text-[10px] text-leos-muted/70 font-mono mt-0.5">
                      Partition: {acc.partition}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

        {/* Add Account Section */}
        <form onSubmit={handleCreate} className="p-4 border-t border-leos-border bg-leos-dark/30 space-y-3">
          <div className="text-xs font-semibold text-leos-text flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-leos-accent" />
            <span>Link Another Google / Work Account</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Display Name (e.g. Work, College)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none placeholder:text-leos-muted focus:border-leos-borderLight"
            />
            <input
              type="email"
              placeholder="Google Email (e.g. name@gmail.com)"
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
              Add Partition
            </button>
          </div>
        </form>

        {/* Footer Privacy Notice */}
        <div className="p-3 bg-leos-dark border-t border-leos-border flex items-center gap-2 text-[10px] text-leos-muted font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Each account operates in a discrete Chromium sandbox. Tokens never mix.</span>
        </div>
      </div>
    </div>
  );
};
