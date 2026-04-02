import { cookies } from 'next/headers';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import SeoSection from "@/components/SeoSection";
import SocialProof from "@/components/SocialProof";
import Footer from "@/components/Footer";
import ExplainerLayer from "@/components/ExplainerLayer";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('admin_auth')?.value === 'true';

  return (
    <main className="max-w-[1440px] mx-auto w-full">
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <SeoSection />
      <SocialProof />
      <Footer />
      <ExplainerLayer />

      {/* Floating edit-site pill */}
      <a
        href="/admin"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 bg-warm-black text-cream font-sans font-light text-[12px] tracking-wide px-5 py-3 rounded-full shadow-lg hover:bg-warm-black/85 transition-colors duration-200"
      >
        <span className="text-[14px]">✦</span>
        <span>{isAuth ? 'Site Editor' : 'Edit site'}</span>
      </a>
    </main>
  );
}
