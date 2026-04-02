'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center justify-center w-8 h-8 text-warm-black/50 dark:text-cream/50 hover:text-warm-black dark:hover:text-cream transition-colors duration-200"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.8" />
      <line x1="7.5" y1="0.8" x2="7.5" y2="2.5" />
      <line x1="7.5" y1="12.5" x2="7.5" y2="14.2" />
      <line x1="0.8" y1="7.5" x2="2.5" y2="7.5" />
      <line x1="12.5" y1="7.5" x2="14.2" y2="7.5" />
      <line x1="2.8" y1="2.8" x2="4" y2="4" />
      <line x1="11" y1="11" x2="12.2" y2="12.2" />
      <line x1="12.2" y1="2.8" x2="11" y2="4" />
      <line x1="4" y1="11" x2="2.8" y2="12.2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 9.5A6 6 0 0 1 4.5 2.5a6 6 0 1 0 7 7z" />
    </svg>
  );
}
