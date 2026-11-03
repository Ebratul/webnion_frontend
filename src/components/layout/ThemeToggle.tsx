'use client';

import { Moon, Sun } from 'lucide-react';
import { useLayoutEffect } from 'react';

type Theme = 'dark' | 'light';

const THEME_COLORS: Record<Theme, string> = { dark: '#050507', light: '#ffffff' };

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
};

const readSavedTheme = (): Theme => {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const toggleTheme = () => {
  const next: Theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Storage can be blocked; the theme still applies for this page view.
  }
};

export const ThemeToggle = ({ label }: { label: string }) => {
  // Switching language remounts <html> without re-running the inline theme script, so the theme is restored here before paint.
  useLayoutEffect(() => {
    applyTheme(readSavedTheme());
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-accent hover:text-accent sm:size-10"
    >
      <Sun aria-hidden className="hidden size-4 dark:block" />
      <Moon aria-hidden className="size-4 dark:hidden" />
    </button>
  );
};
