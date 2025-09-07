"use client";

import { useEffect, useState } from "react";
import { get_products_by_type } from "@/app/api/product";
import { getThumbnailUrl } from "@/app/util";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";

type Product = {
  id: string;
  images: string;
  title: string;
  description: string;
  price: number;
  sub_title?: string;
  color_quantity?: Array<{
    color: string;
    quantity: string | number;
    label: string;
  }>;
  primary_thumbnail?: string | null;
  order_count?: number;
  review_count?: number;
  [key: string]: any; // Allow additional properties
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  productsPerPage: number;
  totalProducts: number;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  productsPerPage,
  totalProducts,
}: PaginationProps) => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-4 mt-12 w-full bg-gradient-to-r from-secondary-50 to-primary-50 py-8 rounded-xl shadow-md animate-fade-in">
      <div className="text-center mb-2">
        <p className="text-secondary-600 font-medium animate-pulse">
          Page {currentPage} of {totalPages}
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-5 py-2.5 rounded-lg flex items-center transition-all duration-300 transform ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg border border-secondary-200 hover:scale-105"
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="hidden md:flex space-x-2">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-4 py-2 rounded-lg bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-secondary-200 hover:scale-105 animate-fade-in"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-2 text-gray-500 flex items-end">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                currentPage === page
                  ? "bg-primary-500 text-white shadow-glow transform scale-110"
                  : "bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg border border-secondary-200"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-2 text-gray-500 flex items-end">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-lg bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-secondary-200"
          >
            {totalPages}
          </button>
        </>
      )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-5 py-2.5 rounded-lg flex items-center transition-all duration-300 transform ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg border border-secondary-200"
          }`}
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="text-xs text-secondary-500 mt-2">
        Showing products {(currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts}
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });
  const { addItem } = useCart();
  const router = require("next/navigation").useRouter();

  const handleProductClick = () => {
    router.push(`/${encodeURIComponent(product.id)}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    let maxQuantity = 1;
    if (product.color_quantity && product.color_quantity.length > 0) {
      maxQuantity =
        parseInt(product.color_quantity[0].quantity.toString()) || 1;
    }

    addItem({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: 1,
      image: getThumbnailUrl(product) || undefined,
      maxQuantity: maxQuantity,
    });

    setToastConfig({
      message: `${product.title} added to cart!`,
      isVisible: true,
    });
  };
  
  // Check if product is "hot" (high order count)
  const isHot = product.order_count && product.order_count > 10;
  
  const imageUrl = getThumbnailUrl(product);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      onMouseEnter={() => setHoveredItem(product.id)}
      onMouseLeave={() => setHoveredItem(null)}
      onClick={handleProductClick}
    >
      {/* Sale Badge - Show if product has order_count > 10 */}
      {isHot && (
        <div className="absolute top-4 left-4 z-10 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-12 animate-pulse">
          HOT
        </div>
      )}
      
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-secondary-50 to-primary-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-secondary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Quick View Button */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-primary-500/40 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          <div className="bg-white rounded-full p-3 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category/Subtitle */}
        {product.sub_title && (
          <div className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-1">
            {product.sub_title}
          </div>
        )}
        
        {/* Title */}
        <h3 className="text-lg font-bold text-secondary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300 font-script">
          {product.title}
        </h3>

        {/* Description */}
        <div
          className="text-secondary-600 text-sm mb-3 line-clamp-2 leading-relaxed h-10 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-secondary-500 ml-2">
            {product.review_count
              ? `4.9 (${product.review_count})`
              : "4.9 (120)"}
          </span>
          
          {/* Order Count Badge */}
          {product.order_count && product.order_count > 0 && (
            <span className="ml-auto text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
              {product.order_count}+ sold
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="text-xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        {/* Action Button - Moved to bottom */}
        <button
          onClick={(e) => handleAddToCart(e)}
          className="w-full flex items-center justify-center bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
            />
          </svg>
          Add
        </button>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-200 transition-all duration-500"></div>

      {/* Toast Notification */}
      <Toast
        message={toastConfig.message}
        type="success"
        isVisible={toastConfig.isVisible}
        onClose={() => setToastConfig({ message: "", isVisible: false })}
        duration={2000}
      />
    </div>
  );
};

const PaginatedProductList = ({ type }: { type: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await get_products_by_type(
          type,
          currentPage,
          productsPerPage,
          {}
        );

        if (response.status && response.data) {
          // Handle different response structures based on the task description
          let productsData: Product[] = [];
          let total = 0;

          // Check if response.data is an array (direct products array)
          if (Array.isArray(response.data)) {
            productsData = response.data as Product[];
            total = response.data.length;
          }
          // Check if response.data is an object with type keys (like in task description)
          else if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            // If the type key exists in the response data, use that
            if (type in response.data) {
              productsData = (response.data[type] || []) as Product[];
              total = productsData.length;
            }
            // If there's a products array directly
            else if (
              "products" in response.data &&
              Array.isArray(response.data.products)
            ) {
              productsData = response.data.products as Product[];
              total = (response.data.total as number) || productsData.length;
            }
            // Otherwise treat the whole object as a single product
            else {
              productsData = [response.data] as unknown as Product[];
              total = 1;
            }
          }

          // Apply sorting
          if (sortBy === "price-low") {
            productsData.sort((a, b) => a.price - b.price);
          } else if (sortBy === "price-high") {
            productsData.sort((a, b) => b.price - a.price);
          } else if (sortBy === "popularity") {
            productsData.sort((a, b) => (b.order_count || 0) - (a.order_count || 0));
          } else if (sortBy === "rating") {
            productsData.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
          }

          setProducts(productsData);
          setTotalProducts(total);
          setTotalPages(Math.max(1, Math.ceil(total / productsPerPage)));
        } else {
          setError(response.message || "Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, currentPage, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );
  }

  const getTitle = () => {
    switch(type) {
      case "latest_arrival": return "Latest Arrivals";
      case "top_seller": return "Best Sellers";
      case "best_reviewed": return "Top Reviewed";
      default: return "Products";
    }
  };

  return (
    <section className="w-full py-12 bg-gradient-to-b from-white to-secondary-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-secondary-600 font-medium">Loading amazing products...</p>
          </div>
        ) : (
          <>
            {/* Header with Title and Sorting */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-secondary-200">
              <div>
                <h2 className="text-3xl font-bold text-secondary-800 mb-2 relative font-serif">
                  {getTitle()}
                  <span className="absolute bottom-0 left-0 w-20 h-1 bg-primary-500 rounded-full"></span>
                </h2>
                <p className="text-secondary-600">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <label htmlFor="sort" className="mr-2 text-secondary-700 font-medium">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="bg-white border border-secondary-200 text-secondary-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <svg className="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
                </svg>
                <p className="text-secondary-600 text-lg">No products found</p>
                <p className="text-secondary-500 mt-2">Try changing your search or filter criteria</p>
              </div>
            ) : (
              <>
                {/* Products Grid with Animation */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                  {products.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="animate-fade-in" 
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination - Always show at bottom */}
                <div className="mt-8 mb-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    productsPerPage={productsPerPage}
                    totalProducts={totalProducts}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PaginatedProductList;
