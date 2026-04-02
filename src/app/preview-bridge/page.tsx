import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import SeoSection from '@/components/SeoSection';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';
import PreviewListener from '@/components/PreviewListener';

export const metadata: Metadata = {
  robots: 'noindex',
};

export default function PreviewBridge() {
  return (
    <main className="max-w-[1440px] mx-auto w-full">
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <SeoSection />
      <SocialProof />
      <Footer />
      <PreviewListener />
    </main>
  );
}
