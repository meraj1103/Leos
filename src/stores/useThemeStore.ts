import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light';
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyThemeToDOM(theme: ThemeMode): 'dark' | 'light' {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  return isDark ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (typeof localStorage !== 'undefined' 
    ? (localStorage.getItem('leos-theme') as ThemeMode) 
    : 'dark') || 'dark';

  const resolved = applyThemeToDOM(savedTheme);

  // Listen to system theme changes if set to system
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      set((state) => {
        if (state.theme === 'system') {
          const newResolved = applyThemeToDOM('system');
          return { resolvedTheme: newResolved };
        }
        return state;
      });
    });
  }

  return {
    theme: savedTheme,
    resolvedTheme: resolved,
    setTheme: (theme: ThemeMode) => {
      localStorage.setItem('leos-theme', theme);
      const newResolved = applyThemeToDOM(theme);
      set({ theme, resolvedTheme: newResolved });
    },
  };
});
