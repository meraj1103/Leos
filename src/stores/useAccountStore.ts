import { create } from 'zustand';
import { LeosAccount } from '../types';

interface AccountState {
  accounts: LeosAccount[];
  activeAccountId: string;
  setActiveAccount: (id: string) => void;
  addAccount: (account: Omit<LeosAccount, 'id' | 'partition'>) => void;
  removeAccount: (id: string) => void;
  updateAccountStatus: (id: string, status: LeosAccount['tokenStatus']) => void;
}

const SAVED_ACCOUNTS_KEY = 'leos-accounts';

function loadInitialAccounts(): LeosAccount[] {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  return [
    {
      id: 'acc-default',
      name: 'Default Profile',
      email: 'local-vault',
      type: 'personal',
      partition: 'persist:default',
      isActive: true,
      connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
      tokenStatus: 'healthy',
    },
  ];
}

const DEFAULT_ACCOUNTS: LeosAccount[] = loadInitialAccounts();

export const useAccountStore = create<AccountState>((set) => ({
  accounts: DEFAULT_ACCOUNTS,
  activeAccountId: DEFAULT_ACCOUNTS[0]?.id || 'acc-default',
  setActiveAccount: (id) =>
    set((state) => ({
      activeAccountId: id,
      accounts: state.accounts.map((acc) => ({
        ...acc,
        isActive: acc.id === id,
      })),
    })),
  addAccount: (accountData) => {
    const id = `acc-${Date.now()}`;
    const newAccount: LeosAccount = {
      ...accountData,
      id,
      partition: `persist:account_${id}`,
      isActive: false,
    };
    set((state) => {
      const updated = [...state.accounts, newAccount];
      if (typeof localStorage !== 'undefined') localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      return { accounts: updated };
    });
  },
  removeAccount: (id) =>
    set((state) => {
      const remaining = state.accounts.filter((acc) => acc.id !== id);
      const newActive = state.activeAccountId === id && remaining.length > 0 ? remaining[0].id : state.activeAccountId;
      if (typeof localStorage !== 'undefined') localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(remaining));
      return {
        accounts: remaining,
        activeAccountId: newActive,
      };
    }),
  updateAccountStatus: (id, status) =>
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.id === id ? { ...acc, tokenStatus: status } : acc
      ),
    })),
}));
