'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('fraction-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
    window.localStorage.setItem('fraction-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/70 text-neutral-200 shadow-sm transition-all duration-300 hover:scale-105 hover:border-lime-400/60 hover:text-lime-300 dark:bg-neutral-800/70"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
