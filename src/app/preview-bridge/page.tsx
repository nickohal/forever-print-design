import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import type { HeroOverrides } from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import SeoSection from '@/components/SeoSection';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';
import { getPreview } from '@/lib/previewStore';
import { applyTextOverride, extractCssOverrides, getComponentChanges } from '@/lib/applyTextOverride';

export const metadata: Metadata = {
  robots: 'noindex',
};

export const dynamic = 'force-dynamic';

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export default async function PreviewBridge({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const changes = token ? (await getPreview(token)) ?? [] : [];

  // Compute text overrides
  const heroFile = 'src/components/Hero.tsx';
  const heroOverrides: HeroOverrides = {};
  const eyebrow = applyTextOverride('Bespoke Digital Stationery', heroFile, changes);
  if (eyebrow !== 'Bespoke Digital Stationery') heroOverrides.eyebrow = eyebrow;
  const headline = applyTextOverride('Designed for your most cherished moments', heroFile, changes);
  if (headline !== 'Designed for your most cherished moments') heroOverrides.headline = headline;
  const subtext = applyTextOverride('Premium printable templates for weddings, celebrations & every occasion in between.', heroFile, changes);
  if (subtext !== 'Premium printable templates for weddings, celebrations & every occasion in between.') heroOverrides.subtext = subtext;
  const ctaPrimary = applyTextOverride('Shop Collection', heroFile, changes);
  if (ctaPrimary !== 'Shop Collection') heroOverrides.ctaPrimary = ctaPrimary;

  const featuredHeading = applyTextOverride('Crafted for every occasion', 'src/components/FeaturedProducts.tsx', changes);
  const seoHeading = applyTextOverride('Your brand. Your traffic. Your customers.', 'src/components/SeoSection.tsx', changes);

  // Compute CSS overrides
  const cssOverrides = extractCssOverrides(changes);

  // Component-level changes that can't be rendered live
  const componentChanges = getComponentChanges(changes);

  return (
    <main className="max-w-[1440px] mx-auto w-full">
      {cssOverrides && (
        <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
      )}
      <Navbar />
      <Hero overrides={Object.keys(heroOverrides).length > 0 ? heroOverrides : undefined} />
      <FeaturedProducts headingOverride={featuredHeading !== 'Crafted for every occasion' ? featuredHeading : undefined} />
      <SeoSection headingOverride={seoHeading !== 'Your brand. Your traffic. Your customers.' ? seoHeading : undefined} />
      <SocialProof />
      <Footer />

      {/* Diff overlay for component-level changes */}
      {componentChanges.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
          {componentChanges.map((change, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-xl p-4 border border-muted/15 flex flex-col gap-2"
            >
              <p className="font-sans font-light text-[9px] uppercase tracking-[0.2em] text-sage">
                Forhåndsvisning
              </p>
              <p className="font-sans font-light text-[12px] text-warm-black leading-snug">
                {change.description}
              </p>
              <div className="bg-muted/5 rounded-lg p-2.5 flex flex-col gap-1.5">
                <p className="font-sans font-light text-[10px] text-muted line-through leading-relaxed break-words">
                  {truncate(change.oldCode, 60)}
                </p>
                <p className="font-sans font-light text-[10px] text-sage leading-relaxed break-words">
                  {truncate(change.newCode, 60)}
                </p>
              </div>
              <p className="font-sans font-light text-[9px] text-muted/50">
                Trykk &lsquo;Legg til&rsquo; for å godkjenne
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
