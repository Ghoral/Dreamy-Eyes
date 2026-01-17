import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import BillboardCarousel from "./components/landing/Swiper";
import Footer from "./components/landing/Footer";
import ProductWrapper from "./components/product/ProductWrapper";
import AccessoriesSection from "./components/landing/AccessoriesSection";
import EyeLashesSection from "./components/landing/EyeLashesSection";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <GlobalSupabaseListenerWrapper />
      <BillboardCarousel />
      <ItemListing />
      <ProductWrapper />
      <EyeLashesSection />
      <AccessoriesSection />
      <div className="w-full h-px bg-secondary-200 opacity-60 max-w-7xl mx-auto my-4 md:my-8" />
      <TikTokCarousel />
      <Footer />
    </div>
  );
}
