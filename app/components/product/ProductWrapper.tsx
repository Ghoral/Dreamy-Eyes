import { get_products } from "../../api/product";
import ProductItems from "../landing/ProductItems";
import { getServerSideCountry } from "../../util/country";

export const dynamic = "force-dynamic";

const ProductWrapper = async () => {
  const country = await getServerSideCountry();
  const { data } = await get_products(1000, 0, [
    "sale",
    "latest_arrival",
    "top_seller",
    "best_reviewed",
  ], country);


  return (
    <div id="products-section">
      <ProductItems data={data} initialCountry={country} />
    </div>
  );
};

export default ProductWrapper;
