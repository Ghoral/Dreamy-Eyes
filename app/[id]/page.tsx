import { supabaseBrowserClient } from "../services/supabase/client/supabaseBrowserClient";
import ProductDetail from "./ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("id", id);

  const { data, error } = await supabaseBrowserClient.rpc(
    "get_product_details",
    {
      product_id: "9cce49bc-7837-4f94-bb07-d6121fe0f4c1",
    }
  );
  console.log("data", data, error);

  if (error || !data) {
    return <div>Product not found</div>;
  }

  return <ProductDetail product={data} />;
}
