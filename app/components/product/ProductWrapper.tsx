import { get_all_products } from "@/app/api/product";
import { get_sales } from "@/app/api/sales";
import ProductItems from "../landing/ProductItems";

export const dynamic = "force-dynamic";

const ProductWrapper = async () => {
  try {
    // Fetch both products and sales
    const [productsResponse, salesResponse] = await Promise.all([
      get_all_products(),
      get_sales(100, 0), // Fetch up to 100 sale items
    ]);

    const products = productsResponse.data || [];
    const sales = salesResponse.data || [];

    // Mark sale items with isSale flag
    const markedSales = sales.map((sale: any) => ({
      ...sale,
      isSale: true,
    }));

    // Merge products and sales, removing duplicates (prefer sale version)
    const saleIds = new Set(markedSales.map((s: any) => s.id));
    const uniqueProducts = products.filter((p: any) => !saleIds.has(p.id));
    
    // Combine and sort: sales first, then regular products
    const allItems = [...markedSales, ...uniqueProducts];

    return (
      <div id="products-section">
        <ProductItems data={allItems} />
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
