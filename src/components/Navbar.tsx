'use client';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-muted/20 dark:border-cream/10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-nav-bg)', height: 'var(--spacing-nav-h)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-full">
        <a
          href="/"
          className="font-serif font-light tracking-[0.15em] uppercase whitespace-nowrap transition-colors duration-300"
          style={{ color: 'var(--color-nav-text)', fontSize: 'var(--size-nav-logo)' }}
        >
          Forever Print Design
        </a>

        <div className="flex items-center gap-8 md:gap-10">
          <ul className="hidden md:flex items-center gap-10">
            {['Shop', 'About', 'Contact'].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="font-sans text-[11px] uppercase tracking-[0.18em] text-warm-black/70 dark:text-cream/60 hover:text-warm-black dark:hover:text-cream transition-colors duration-200"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col gap-1.5 items-center justify-center w-7 h-7"
            aria-label="Open menu"
          >
            <span className="block w-5 h-px bg-warm-black dark:bg-cream transition-colors" />
            <span className="block w-5 h-px bg-warm-black dark:bg-cream transition-colors" />
            <span className="block w-3.5 h-px bg-warm-black dark:bg-cream transition-colors" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-cream dark:bg-dark-green flex flex-col md:hidden transition-colors duration-300">
          {/* Menu header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-muted/10 dark:border-cream/10">
            <a
              href="/"
              className="font-serif font-light tracking-[0.15em] uppercase text-warm-black dark:text-cream text-sm"
            >
              Forever Print Design
            </a>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-warm-black dark:text-cream text-2xl leading-none w-8 h-8 flex items-center justify-center"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          {/* Menu links */}
          <div className="flex-1 flex flex-col items-center justify-center gap-10">
            {['Shop', 'About', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                onClick={() => setMenuOpen(false)}
                className="font-serif font-light text-warm-black dark:text-cream text-3xl tracking-[0.08em] transition-colors duration-200"
              >
                {link}
              </a>
            ))}
            <a
              href="/admin"
              className="font-sans font-light text-[12px] uppercase tracking-[0.18em] text-sage mt-6"
            >
              Edit site →
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
