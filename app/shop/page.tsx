"use client";

import React from "react";
import PaginatedProductList from "@/app/components/product/PaginatedProductList";
import { useSearchParams } from "next/navigation";

const Shop = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "latest_arrival";
  
  return (
    <div className="pt-20 min-h-screen"> {/* Added padding-top for navbar and min-height for full height */}
      <PaginatedProductList type={type} />
    </div>
  );
};

export default Shop;
