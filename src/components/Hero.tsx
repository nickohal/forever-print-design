export interface HeroOverrides {
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  ctaPrimary?: string;
}

const placeholders = [
  { label: "Wedding Invitations" },
  { label: "Dinner Menus" },
  { label: "Christmas Cards" },
  { label: "Bar Signs" },
];

export default function Hero({ overrides }: { overrides?: HeroOverrides } = {}) {
  return (
    <section
      className="w-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row items-center overflow-hidden px-12 lg:px-20 gap-8 lg:gap-12"
      style={{ backgroundColor: 'var(--color-hero-bg)' }}
    >
      {/* Left — copy */}
      <div className="flex-[3] min-w-0 flex flex-col justify-center py-20 lg:py-0">
        {/* Eyebrow label */}
        <p data-preview-id="hero-eyebrow" className="font-sans font-light uppercase tracking-[0.3em] text-muted mb-7" style={{ fontSize: 'var(--size-hero-eyebrow)' }}>
          {overrides?.eyebrow ?? 'Bespoke Digital Stationery'}
        </p>

        {/* Headline */}
        <h1 data-preview-id="hero-headline" className="font-serif font-light italic text-warm-black dark:text-cream leading-[1.08] mb-8 max-w-lg transition-colors duration-300" style={{ fontSize: 'var(--size-hero-headline)' }}>
          {overrides?.headline ?? 'Designed for your most cherished moments'}
        </h1>

        {/* Sage rule */}
        <div className="w-12 h-px bg-sage mb-8" />

        {/* Body copy */}
        <p data-preview-id="hero-subtext" className="font-sans font-light text-muted leading-[1.8] mb-10 max-w-sm" style={{ fontSize: 'var(--size-hero-subtext)' }}>
          {overrides?.subtext ?? 'Premium printable templates for weddings, celebrations & every occasion in between.'}
        </p>

        {/* CTAs */}
        <div className="flex flex-row gap-3">
          <a
            href="#"
            className="btn-primary font-sans font-light text-[11px] uppercase tracking-[0.18em] px-5 py-3 md:px-8 md:py-3.5 hover:opacity-85 transition-colors duration-200 whitespace-nowrap"
          >
            <span data-preview-id="hero-cta-primary">{overrides?.ctaPrimary ?? 'Shop Collection'}</span>
          </a>
          <a
            href="#"
            className="btn-secondary font-sans font-light text-[11px] uppercase tracking-[0.18em] px-5 py-3 md:px-8 md:py-3.5 hover:opacity-80 transition-colors duration-200 whitespace-nowrap"
          >
            View on Etsy
          </a>
        </div>

        {/* Social proof whisper */}
        <p className="font-sans font-light text-[11px] tracking-wide text-muted/70 mt-7">
          43,000+ orders &nbsp;·&nbsp; 5-star rated
        </p>
      </div>

      {/* Right — product grid placeholder */}
      <div className="flex-[2] min-w-0 flex items-center justify-center bg-cream/60 dark:bg-[#1E4232] py-16 lg:py-0 transition-colors duration-300">
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs md:max-w-sm lg:max-w-[340px]">
          {placeholders.map(({ label }) => (
            <div
              key={label}
              className="card-placeholder group relative aspect-[3/4] flex flex-col items-center justify-between p-4 hover:border-gold/30 transition-colors duration-300"
            >
              {/* Inner frame */}
              <div className="absolute inset-3 border border-muted/20 dark:border-cream/10 pointer-events-none" />

              {/* decorative top accent */}
              <div className="w-6 h-px bg-gold/40 group-hover:bg-gold/70 transition-colors duration-300 mt-2" />

              {/* center ornament */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border border-muted/10 dark:border-cream/10 rounded-full" />
              </div>

              {/* label */}
              <span className="font-serif font-light text-[11px] tracking-[0.2em] text-muted/80 dark:text-cream/50 uppercase mb-1">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
