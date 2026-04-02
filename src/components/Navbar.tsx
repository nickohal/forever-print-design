import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-cream dark:bg-dark-green border-b border-muted/20 dark:border-cream/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <a
          href="/"
          className="font-serif font-light tracking-[0.15em] uppercase text-warm-black dark:text-cream text-sm md:text-base whitespace-nowrap transition-colors duration-300"
        >
          Forever Print Design
        </a>

        <div className="flex items-center gap-8 md:gap-10">
          <ul className="hidden md:flex items-center gap-10">
            {["Shop", "About", "Contact"].map((link) => (
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
        </div>
      </div>
    </nav>
  );
}
