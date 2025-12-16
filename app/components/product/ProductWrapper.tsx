import { get_products } from "@/app/api/product";
import ProductItems from "../landing/ProductItems";

export const dynamic = "force-dynamic";

const ProductWrapper = async () => {
  const { data } = await get_products(1000, 0, [
    "sale",
    "latest_arrival",
    "top_seller",
    "best_reviewed",
  ]);


  return (
    <div id="products-section">
      <ProductItems data={data} />
    </div>
  );
};

export default ProductWrapper;
