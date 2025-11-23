"use client";

import React, { Suspense } from "react";
import PaginatedProductList from "@/app/components/product/PaginatedProductList";
import { useSearchParams } from "next/navigation";

// Component that uses useSearchParams hook
function ProductListWithParams() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "latest_arrival";
  
  return <PaginatedProductList type={type} />;
}

const Shop = () => {
  return (
    <div className="pt-20 min-h-screen"> {/* Added padding-top for navbar and min-height for full height */}
      <Suspense fallback={<div className="flex justify-center items-center h-96">Loading products...</div>}>
        <ProductListWithParams />
      </Suspense>
    </div>
  );
};

export default Shop;
