const products = [
  { id: 1, title: "Wildflower Wedding Invitation", category: "Wedding Invitations", price: "from kr 148", tag: "Bestseller", etsy: "https://www.etsy.com/no-en/shop/ForeverPrintDesign" },
  { id: 2, title: "Oval Bar Menu Sign", category: "Bar Signs", price: "from kr 78", tag: "Popular", etsy: "https://www.etsy.com/no-en/shop/ForeverPrintDesign" },
  { id: 3, title: "Round Wedding Menu", category: "Menus", price: "from kr 78", tag: null, etsy: "https://www.etsy.com/no-en/shop/ForeverPrintDesign" },
  { id: 4, title: "Minimalist Table Numbers", category: "Table Numbers", price: "from kr 51", tag: null, etsy: "https://www.etsy.com/no-en/shop/ForeverPrintDesign" },
  { id: 5, title: "Red Stripe Christmas Card", category: "Christmas", price: "from kr 79", tag: "Seasonal", etsy: "https://www.etsy.com/no-en/shop/ForeverPrintDesign" },
  { id: 6, title: "Seating Chart Template", category: "Seating Charts", price: "from kr 120", tag: null, etsy: "https://www.etsy.com/no-en/shop/ForeverPrintDesign" },
];

export default function FeaturedProducts() {
  return (
    <section className="border-t border-muted/15 dark:border-cream/10 px-12 lg:px-20 py-24 lg:py-32 transition-colors duration-300">
      {/* Section heading */}
      <div className="mb-14">
        <p className="font-sans font-light text-[11px] uppercase tracking-[0.3em] text-muted mb-4">
          Featured Collection
        </p>
        <h2 data-preview-id="featured-heading" className="font-serif font-light italic text-warm-black dark:text-cream text-5xl leading-[1.15] transition-colors duration-300">
          Crafted for every occasion
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group flex flex-col">
            {/* Image placeholder */}
            <div className="relative aspect-[3/4] bg-[#F3F0EB] dark:bg-[#1F4B38] border border-muted/15 dark:border-cream/10 mb-4 flex items-center justify-center overflow-hidden transition-colors duration-300">
              {/* Inner frame */}
              <div className="absolute inset-3 border border-muted/15 dark:border-cream/10 pointer-events-none" />

              <span className="font-serif font-light text-[11px] tracking-[0.2em] text-muted/60 dark:text-cream/40 uppercase">
                {product.category}
              </span>

              {/* Tag pill */}
              {product.tag && (
                <span className="absolute top-3 right-3 font-sans font-light text-[9px] uppercase tracking-[0.18em] text-gold border border-gold/50 px-2 py-0.5">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Card copy */}
            <h3 className="font-serif font-light text-warm-black dark:text-cream text-[18px] leading-snug mb-1 transition-colors duration-300">
              {product.title}
            </h3>
            <p className="font-sans font-light text-[11px] text-muted tracking-wide mb-3">
              {product.category}&ensp;·&ensp;{product.price}
            </p>
            <a
              href={product.etsy}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans font-light text-[11px] uppercase tracking-[0.18em] text-muted/50 group-hover:text-gold transition-colors duration-200 mt-auto"
            >
              Shop on Etsy →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
