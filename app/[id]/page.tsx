import { createSupabaseServerClient } from "../services/supabase/server/supabaseServerClient";
import ProductDetail from "./ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_product_details", {
    product_id: id,
  });

  if (error || !data) {
    return <div>Product not found</div>;
  }

  return <ProductDetail product={data} />;
}
