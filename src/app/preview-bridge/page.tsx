import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import type { HeroOverrides } from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import SeoSection from '@/components/SeoSection';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';
import { getPreview } from '@/lib/previewStore';
import { applyTextOverride, extractCssOverrides } from '@/lib/applyTextOverride';

export const metadata: Metadata = {
  robots: 'noindex',
};

export const dynamic = 'force-dynamic';

export default async function PreviewBridge({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const changes = token ? getPreview(token) ?? [] : [];

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
    </main>
  );
}
