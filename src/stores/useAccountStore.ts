import { create } from 'zustand';
import { LeosAccount } from '../types';

interface AccountState {
  accounts: LeosAccount[];
  activeAccountId: string;
  setActiveAccount: (id: string) => void;
  addAccount: (account: Omit<LeosAccount, 'id' | 'partition'> & { id?: string; partition?: string }) => void;
  removeAccount: (id: string) => void;
  updateAccountStatus: (id: string, status: LeosAccount['tokenStatus']) => void;
}

const SAVED_ACCOUNTS_KEY = 'leos-accounts';
const ACTIVE_ACCOUNT_KEY = 'leos-active-account-id';

const DEFAULT_PROFILE: LeosAccount = {
  id: 'acc-default',
  name: 'Default Profile',
  email: 'local-vault',
  type: 'personal',
  partition: 'persist:default',
  isActive: true,
  connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
  tokenStatus: 'healthy',
};

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
  return [DEFAULT_PROFILE];
}

const DEFAULT_ACCOUNTS: LeosAccount[] = loadInitialAccounts();

function getInitialActiveId(accounts: LeosAccount[]): string {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
    if (saved && accounts.some((a) => a.id === saved)) {
      return saved;
    }
  }
  const active = accounts.find((a) => a.isActive);
  return active?.id || accounts[0]?.id || DEFAULT_PROFILE.id;
}

const INITIAL_ACTIVE_ID = getInitialActiveId(DEFAULT_ACCOUNTS);

export const useAccountStore = create<AccountState>((set) => ({
  accounts: DEFAULT_ACCOUNTS,
  activeAccountId: INITIAL_ACTIVE_ID,

  setActiveAccount: (id) =>
    set((state) => {
      const updated = state.accounts.map((acc) => ({
        ...acc,
        isActive: acc.id === id,
      }));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
        localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
      }
      return {
        activeAccountId: id,
        accounts: updated,
      };
    }),

  addAccount: (accountData) => {
    const id = (accountData as any).id || `acc-${Date.now()}`;
    const makeActive = accountData.isActive ?? true;
    
    set((state) => {
      // Check if account with same ID or email already exists
      const existingIndex = state.accounts.findIndex(
        (a) => a.id === id || (accountData.email && a.email.toLowerCase() === accountData.email.toLowerCase())
      );

      let updated: LeosAccount[];
      if (existingIndex >= 0) {
        updated = state.accounts.map((acc, idx) => {
          if (idx === existingIndex) {
            return {
              ...acc,
              ...accountData,
              id: acc.id,
              isActive: makeActive,
            };
          }
          return makeActive ? { ...acc, isActive: false } : acc;
        });
      } else {
        const newAccount: LeosAccount = {
          ...accountData,
          id,
          partition: `persist:account_${id}`,
          isActive: makeActive,
        };
        const previous = makeActive
          ? state.accounts.map((a) => ({ ...a, isActive: false }))
          : state.accounts;
        updated = [...previous, newAccount];
      }

      const activeId = makeActive ? (existingIndex >= 0 ? state.accounts[existingIndex].id : id) : state.activeAccountId;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
        localStorage.setItem(ACTIVE_ACCOUNT_KEY, activeId);
      }

      return {
        accounts: updated,
        activeAccountId: activeId,
      };
    });
  },

  removeAccount: (id) =>
    set((state) => {
      let remaining = state.accounts.filter((acc) => acc.id !== id);
      // Guarantee at least one valid profile always remains to prevent runtime crashes
      if (remaining.length === 0) {
        remaining = [{ ...DEFAULT_PROFILE, isActive: true }];
      }

      const newActiveId = state.activeAccountId === id ? remaining[0].id : state.activeAccountId;
      const updated = remaining.map((acc) => ({
        ...acc,
        isActive: acc.id === newActiveId,
      }));

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
        localStorage.setItem(ACTIVE_ACCOUNT_KEY, newActiveId);
      }

      return {
        accounts: updated,
        activeAccountId: newActiveId,
      };
    }),

  updateAccountStatus: (id, status) =>
    set((state) => {
      const updated = state.accounts.map((acc) =>
        acc.id === id ? { ...acc, tokenStatus: status } : acc
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      }
      return { accounts: updated };
    }),
}));
