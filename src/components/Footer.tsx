export default function Footer() {
  return (
    <footer className="bg-cream border-t border-muted/15">
      {/* Top row */}
      <div className="px-12 lg:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        {/* Left — brand */}
        <div>
          <p className="font-serif font-light tracking-[0.22em] text-warm-black text-sm uppercase whitespace-nowrap">
            Forever Print Design
          </p>
        </div>

        {/* Center — nav links */}
        <div className="flex flex-col gap-3 md:items-center">
          {["Shop", "About", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="font-sans font-light text-[11px] uppercase tracking-[0.18em] text-muted hover:text-warm-black transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right — contact info */}
        <div className="flex flex-col gap-2 md:items-end">
          <a
            href="mailto:emilie@foreverprintdesign.com"
            className="font-sans font-light text-[13px] text-muted hover:text-warm-black transition-colors duration-200"
          >
            emilie@foreverprintdesign.com
          </a>
          <p className="font-sans font-light text-[13px] text-muted">
            Oslo, Norway
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-muted/10 px-12 lg:px-20 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="font-sans font-light text-[11px] text-muted/60">
          © 2024 Forever Print Design. All rights reserved.
        </p>
        <a
          href="https://www.etsy.com/no-en/shop/ForeverPrintDesign"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans font-light text-[11px] uppercase tracking-[0.18em] text-gold hover:text-gold/70 transition-colors duration-200"
        >
          View full shop on Etsy →
        </a>
      </div>
    </footer>
  );
}
