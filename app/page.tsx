"use client";

import TikTokCarousel from "./components/landing/TikTokCarousel";
import ItemListing from "./components/landing/ItemListing";
import ProductItems from "./components/landing/ProductItems";
import BillboardCarousel from "./components/landing/Swiper";
import Image from "next/image";
import Footer from "./components/landing/Footer";
import CompanyService from "./components/landing/CompanyService";
import Navbar from "./components/landing/Navbar";

export default function Home() {
  return (
    <div>
      <header id="header" className="site-header">
        <div className="top-info border-bottom d-none d-md-block ">
          <div className="container-fluid">
            <div className="row g-0">
              <div className="col-md-4">
                <p className="fs-6 my-2 text-center">
                  Need any help? Call us <span>112233344455</span>
                </p>
              </div>
              <div className="col-md-4 border-start border-end">
                <p className="fs-6 my-2 text-center">
                  Summer sale discount off 60% off! Shop Now
                </p>
              </div>
              <div className="col-md-4">
                <p className="fs-6 my-2 text-center">
                  2-3 business days delivery & free returns
                </p>
              </div>
            </div>
          </div>
        </div>
        <Navbar />
      </header>
      <BillboardCarousel />
      <CompanyService />
      <ItemListing />
      <TikTokCarousel />
      <ProductItems />
      <Footer />
    </div>
  );
}
