import { get_all_products } from "@/app/api/product";
import ProductItems from "../landing/ProductItems";

export const dynamic = "force-dynamic";

const ProductWrapper = async () => {
  try {
    const { data } = await get_all_products();

    return (
      <div id="products-section">
        <ProductItems data={data || []} />
      </div>
    );
  } catch (error) {
    console.error("Error loading products:", error);
    return (
      <div id="products-section">
        <ProductItems data={[]} />
      </div>
    );
  }
};

export default ProductWrapper;
