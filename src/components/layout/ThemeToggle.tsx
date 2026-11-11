'use client';

import { Moon, Sun } from 'lucide-react';
import { useLayoutEffect } from 'react';

type Theme = 'dark' | 'light';

const THEME_COLORS: Record<Theme, string> = { dark: '#050507', light: '#ffffff' };

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
};

const defaultTheme = (): Theme => (document.documentElement.dataset.defaultTheme === 'light' ? 'light' : 'dark');

const readSavedTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : defaultTheme();
  } catch {
    return defaultTheme();
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
      className="grid size-9 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover sm:size-10"
    >
      <Sun aria-hidden className="hidden size-4 dark:block" />
      <Moon aria-hidden className="size-4 dark:hidden" />
    </button>
  );
};
