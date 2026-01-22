import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";
import ProductDetail from "./ProductDetail";
import { get_sale_by_id } from "../api/sales";
import { redirect } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabaseBrowserClient.rpc(
    "get_product_details",
    {
      product_id: id,
    }
  );

  if (error || !data) {
    // If product not found in standard products, check if it's a sale item
    const saleResult = await get_sale_by_id(id);
    if (saleResult.status && saleResult.data) {
      redirect(`/sale/${id}`);
    }
    
    return <div>Product not found</div>;
  }

  return <ProductDetail product={data} />;
}
