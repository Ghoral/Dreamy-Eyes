import { Suspense } from "react";
import ProductWrapper from "./components/product/ProductWrapper";
import Footer from "./components/landing/Footer";
import BillboardCarousel from "./components/landing/Swiper";
import InstagramCarousel from "./components/landing/InstagramCarousel";
import OffersDisplayWrapper from "./components/landing/OffersCarouselWrapper";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";
import HomeClient from "./HomeClient";

const LoadingFallback = () => (
  <div className="w-full py-12 flex items-center justify-center">
    <div className="text-gray-400 text-sm">Loading products...</div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <GlobalSupabaseListenerWrapper />
      <BillboardCarousel />
      <Suspense fallback={null}>
        <OffersDisplayWrapper />
      </Suspense>
      <HomeClient>
        <Suspense fallback={<LoadingFallback />}>
          <ProductWrapper />
        </Suspense>
        <InstagramCarousel />
      </HomeClient>
      <Footer />
    </div>
  );
}
