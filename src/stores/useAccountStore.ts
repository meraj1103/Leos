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

const DEFAULT_ACCOUNTS: LeosAccount[] = [
  {
    id: 'acc-personal',
    name: 'Personal Account',
    email: 'user.personal@gmail.com',
    type: 'personal',
    partition: 'persist:account_personal',
    isActive: true,
    connectedModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'chatgpt-4o-free', 'claude-3.5-sonnet'],
    tokenStatus: 'healthy',
  },
  {
    id: 'acc-work',
    name: 'Work Account',
    email: 'dev@company.io',
    type: 'work',
    partition: 'persist:account_work',
    isActive: false,
    connectedModels: ['claude-3.5-sonnet', 'gpt-4o', 'gemini-1.5-pro'],
    tokenStatus: 'healthy',
  },
  {
    id: 'acc-student',
    name: 'Research Account',
    email: 'research@university.edu',
    type: 'student',
    partition: 'persist:account_student',
    isActive: false,
    connectedModels: ['gemini-1.5-pro', 'deepseek-r1'],
    tokenStatus: 'healthy',
  },
];

export const useAccountStore = create<AccountState>((set) => ({
  accounts: DEFAULT_ACCOUNTS,
  activeAccountId: 'acc-personal',
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
    set((state) => ({
      accounts: [...state.accounts, newAccount],
    }));
  },
  removeAccount: (id) =>
    set((state) => {
      const remaining = state.accounts.filter((acc) => acc.id !== id);
      const newActive = state.activeAccountId === id && remaining.length > 0 ? remaining[0].id : state.activeAccountId;
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
