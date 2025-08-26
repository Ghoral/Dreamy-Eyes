import React from "react";
import PaginatedProductList from "@/app/components/product/PaginatedProductList";

const Shop = () => {
  // For now, we'll display all product types
  // You can modify this to show specific types or filters
  return (
    <div>
      <PaginatedProductList type="latest_arrival" />
    </div>
  );
};

export default Shop;
