import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import BillboardCarousel from "./components/landing/Swiper";
import Footer from "./components/landing/Footer";
import ProductWrapper from "./components/product/ProductWrapper";
import SalesSection from "./components/landing/SalesSection";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";
import AccessoriesSection from "./components/accessories/AccessoriesSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <GlobalSupabaseListenerWrapper />
      <BillboardCarousel />
      <ItemListing />
      <SalesSection />
      <ProductWrapper />
      <AccessoriesSection />
      <TikTokCarousel />
      <Footer />
    </div>
  );
}
