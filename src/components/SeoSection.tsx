const bullets = [
  "Google-indexed product pages for every design",
  "Your domain, your brand — not buried in Etsy search",
  "Blog & journal ready — content that drives organic traffic",
];

export default function SeoSection({ headingOverride }: { headingOverride?: string } = {}) {
  return (
    <section className="border-t border-muted/15 dark:border-cream/10 px-12 lg:px-20 py-24 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">

        {/* Left — prose */}
        <div className="flex-1 min-w-0">
          <p className="font-sans font-light text-[11px] uppercase tracking-[0.3em] text-muted mb-5">
            Own your presence online
          </p>
          <h2 data-preview-id="seo-heading" className="font-serif font-light text-warm-black dark:text-cream text-[40px] leading-[1.1] mb-6 transition-colors duration-300">
            {headingOverride ?? 'Your brand. Your traffic. Your customers.'}
          </h2>
          <p className="font-sans font-light text-muted text-[14px] leading-relaxed mb-8 max-w-md">
            Etsy is a great platform — but every visitor stays on Etsy. A
            dedicated website puts your brand first, builds Google search ranking
            over time, and lets customers find you directly. With 43,000+ sales
            and a 4.9 rating, you already have everything it takes to rank.
          </p>
          <ul className="flex flex-col gap-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                <span className="font-sans font-light text-[14px] text-warm-black/80 dark:text-cream/80 leading-relaxed">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — mock Google result */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="w-full max-w-md border border-muted/20 dark:border-cream/10 rounded-lg bg-white dark:bg-[#1F4B38] p-5 shadow-sm transition-colors duration-300">

            {/* Google header */}
            <p className="font-sans text-[13px] text-muted/60 mb-3 tracking-wide">
              Google
            </p>

            {/* Fake search bar */}
            <div className="flex items-center gap-2 border border-muted/25 dark:border-cream/15 rounded-full px-4 py-2 mb-5">
              <svg className="w-3.5 h-3.5 text-muted/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span className="font-sans font-light text-[13px] text-warm-black/60 dark:text-cream/60">
                wedding invitation templates norway
              </span>
            </div>

            {/* Mock search result */}
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[12px] text-sage">
                foreverprintdesign.com
              </p>
              <p className="font-sans text-[15px] text-[#1a0dab] dark:text-[#8ab4f8] leading-snug">
                Wedding Invitation Templates — Forever Print Design
              </p>
              <p className="font-sans font-light text-[13px] text-muted leading-relaxed mt-0.5">
                Premium editable wedding invitations, menus &amp; stationery.
                Instant digital download. Trusted by 43,000+ happy couples.
              </p>

              {/* Rating badge */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="font-sans text-[12px] text-gold">⭐ 4.9</span>
                <span className="font-sans font-light text-[12px] text-muted/70">
                  · 3,900+ reviews
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
