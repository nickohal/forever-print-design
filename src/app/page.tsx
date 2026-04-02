import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import SeoSection from "@/components/SeoSection";
import SocialProof from "@/components/SocialProof";
import Footer from "@/components/Footer";
import ExplainerLayer from "@/components/ExplainerLayer";
import AiEditor from "@/components/AiEditor";

export default function Home() {
  return (
    <main className="max-w-[1440px] mx-auto w-full">
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <SeoSection />
      <SocialProof />
      <Footer />
      <ExplainerLayer />
      <AiEditor />
    </main>
  );
}
