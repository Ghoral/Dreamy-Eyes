import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";
import ProductDetail from "./ProductDetail";

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
    return <div>Product not found</div>;
  }

  return <ProductDetail product={data} />;
}
