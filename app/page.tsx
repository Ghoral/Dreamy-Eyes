"use client";

import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import ProductItems from "./components/landing/ProductItems";
import BillboardCarousel from "./components/landing/Swiper";
import Footer from "./components/landing/Footer";
import CompanyService from "./components/landing/CompanyService";

export default function Home() {
  return (
    <div>
      <BillboardCarousel />
      <CompanyService />
      <ItemListing />
      <TikTokCarousel />
      <ProductItems />
      <Footer />
    </div>
  );
}
