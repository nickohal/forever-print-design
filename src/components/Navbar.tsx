export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-cream border-b border-muted/20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <a
          href="/"
          className="font-serif font-light tracking-[0.22em] text-warm-black text-sm md:text-base uppercase whitespace-nowrap"
        >
          Forever Print Design
        </a>

        <ul className="hidden md:flex items-center gap-10">
          {["Shop", "About", "Contact"].map((link) => (
            <li key={link}>
              <a
                href="#"
                className="font-sans text-[11px] uppercase tracking-[0.18em] text-warm-black/70 hover:text-warm-black transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
