import React from "react";
import PaginatedProductList from "@/app/components/product/PaginatedProductList";

const Shop = () => {
  // For now, we'll display all product types
  // You can modify this to show specific types or filters
  return (
    <div className="pt-20 min-h-screen"> {/* Added padding-top for navbar and min-height for full height */}
      <PaginatedProductList type="latest_arrival" />
    </div>
  );
};

export default Shop;
