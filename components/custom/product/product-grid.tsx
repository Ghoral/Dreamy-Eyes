"use client";

import { IProductList } from "@/app/interface/product";
import { supabaseClient } from "@/app/service/supabase";
import { useEffect, useState } from "react";
import ProductCard from "./product-card";

export default function ProductGrid() {
  const [data, setData] = useState<IProductList[]>([]);
  const fetchProduct = async () => {
    try {
      const res = await supabaseClient.from("lens").select("*");
      setData(res.data ?? []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Premium Eye Lenses
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item: IProductList) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}
