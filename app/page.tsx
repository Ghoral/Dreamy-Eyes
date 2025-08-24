import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import BillboardCarousel from "./components/landing/Swiper";
import Footer from "./components/landing/Footer";
import CompanyService from "./components/landing/CompanyService";
import ProductWrapper from "./components/product/ProductWrapper";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";

export default function Home() {
  return (
    <div>
      <GlobalSupabaseListenerWrapper />
      <BillboardCarousel />
      <ItemListing />
      <TikTokCarousel />
      <ProductWrapper />
      <Footer />
    </div>
  );
}
