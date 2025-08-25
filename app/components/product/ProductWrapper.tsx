import { get_all_products } from "@/app/api/product";
import ProductItems from "../landing/ProductItems";

const ProductWrapper = async () => {
  const { data } = await get_all_products();

  return <ProductItems data={data} />;
};

export default ProductWrapper;
