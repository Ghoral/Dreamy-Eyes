"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetail from "../../[id]/ProductDetail";
import { get_sale_by_id } from "../../api/sales";

export default function SalesProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaleProduct = async () => {
      if (!id) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await get_sale_by_id(id);

        if (result.status && result.data) {
          setProduct(result.data);
        } else {
          setError(result.message || "Sale product not found");
        }
      } catch (err: any) {

        setError(err.message || "Failed to load sale product");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading sale product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Sale product not found"}</p>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} isSale={true} />;
}

