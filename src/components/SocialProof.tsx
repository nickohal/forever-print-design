const stats = [
  { value: "43,200+", label: "Orders delivered" },
  { value: "4.9 ★", label: "Average rating" },
  { value: "3,900+", label: "Happy customers" },
  { value: "3 years", label: "On Etsy" },
];

export default function SocialProof() {
  return (
    <section className="border-t border-b border-muted/15 dark:border-cream/10 bg-cream dark:bg-dark-green px-12 lg:px-20 py-16 transition-colors duration-300">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center py-8 lg:py-0 ${
              i !== 0 ? "border-l border-muted/15 dark:border-cream/10" : ""
            }`}
          >
            <span className="font-serif font-light text-warm-black dark:text-cream text-[48px] leading-none mb-3 transition-colors duration-300">
              {stat.value}
            </span>
            <span className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-muted">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
