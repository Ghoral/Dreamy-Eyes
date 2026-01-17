import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import BillboardCarousel from "./components/landing/Swiper";
import Footer from "./components/landing/Footer";
import ProductWrapper from "./components/product/ProductWrapper";
import SolutionsSection from "./components/landing/SolutionsSection";
import EyeLashesSection from "./components/landing/EyeLashesSection";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";
import ApplicatorsSection from "./components/applicators/ApplicatorsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <GlobalSupabaseListenerWrapper />
      <BillboardCarousel />
      <ItemListing />
      <ProductWrapper />
      <ApplicatorsSection />
      <SolutionsSection />
      <EyeLashesSection />
      <TikTokCarousel />
      <Footer />
    </div>
  );
}
