"use client";

import { useEffect, useState, useMemo } from "react";
import { get_products_by_type } from "@/app/api/product";
import { getThumbnailUrl, formatPriceWithCurrency } from "@/app/util";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import { useUserCountry } from "@/app/hooks/useUserCountry";

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
  power?: number | string;
  created_at?: string;
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
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
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
                <span className="px-2 py-2 text-gray-500 flex items-end">
                  ...
                </span>
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
                <span className="px-2 py-2 text-gray-500 flex items-end">
                  ...
                </span>
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
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="text-xs text-secondary-500 mt-2">
        Showing products {(currentPage - 1) * productsPerPage + 1} -{" "}
        {Math.min(currentPage * productsPerPage, totalProducts)} of{" "}
        {totalProducts}
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const { country } = useUserCountry();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });
  const { addItem } = useCart();
  const router = require("next/navigation").useRouter();

  const getProductLink = () => {
    const tags = product.tags;
    const subTitle = product.sub_title;
    let isSale = false;

    // Check tags
    if (Array.isArray(tags)) {
      isSale = tags.some((t) => String(t).toLowerCase().includes("sale"));
    } else if (typeof tags === "string") {
      isSale = tags.toLowerCase().includes("sale");
    }

    // Fallback: Check sub_title for "sale" keyword
    if (!isSale && typeof subTitle === "string") {
      isSale = subTitle.toLowerCase().includes("sale");
    }

    // Additional fallback: Check for sale indicators in price or discount
    if (!isSale && (product.discount_percentage || product.sale_price || product.original_price)) {
      isSale = true;
    }

    return isSale
      ? `/sale/${encodeURIComponent(product.id)}`
      : `/${encodeURIComponent(product.id)}`;
  };

  const handleProductClick = () => {
    router.push(getProductLink());
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
            src={imageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
        <h3 className="text-lg font-bold text-secondary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
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
            {formatPriceWithCurrency(product.price, country)}
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
  const { country } = useUserCountry();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [powerMin, setPowerMin] = useState<string>("");
  const [powerMax, setPowerMax] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products (use a large limit to get all products for filtering)
        const response = await get_products_by_type(
          type,
          1,
          1000, // Large limit to get all products
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

          setAllProducts(productsData);
          setTotalProducts(total);
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
  }, [type]);

  // Extract unique colors from all products
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.color_quantity && Array.isArray(product.color_quantity)) {
        product.color_quantity.forEach((cq) => {
          if (cq.label) {
            colorSet.add(cq.label);
          }
        });
      }
    });
    return Array.from(colorSet).sort();
  }, [allProducts]);

  // Extract unique sizes from all products (from specifications)
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.specifications) {
        try {
          const specs =
            typeof product.specifications === "string"
              ? JSON.parse(product.specifications)
              : product.specifications;

          if (Array.isArray(specs)) {
            specs.forEach((spec: any) => {
              if (spec && typeof spec === "object") {
                const label = (spec.label || "").toLowerCase();
                if (label.includes("size") && spec.value) {
                  sizeSet.add(spec.value);
                }
              }
            });
          } else if (typeof specs === "object" && specs !== null) {
            Object.entries(specs).forEach(([key, value]) => {
              const keyLower = key.toLowerCase();
              if (keyLower.includes("size") && value) {
                sizeSet.add(String(value));
              }
            });
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    });
    return Array.from(sizeSet).sort();
  }, [allProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply color filter
    if (selectedColor !== "all") {
      filtered = filtered.filter((product) => {
        if (!product.color_quantity || !Array.isArray(product.color_quantity)) {
          return false;
        }
        return product.color_quantity.some((cq) => cq.label === selectedColor);
      });
    }

    // Apply power range filter
    if (powerMin || powerMax) {
      filtered = filtered.filter((product) => {
        const power = product.power
          ? parseFloat(product.power.toString())
          : null;
        if (power === null) return false;

        const min = powerMin ? parseFloat(powerMin) : -Infinity;
        const max = powerMax ? parseFloat(powerMax) : Infinity;
        return power >= min && power <= max;
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Newest first
      });
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB; // Oldest first
      });
    } else if (sortBy === "popularity") {
      sorted.sort((a, b) => (b.order_count || 0) - (a.order_count || 0));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }

    return sorted;
  }, [allProducts, selectedColor, selectedSize, powerMin, powerMax, sortBy]);

  // Paginate filtered products
  useEffect(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginated = filteredAndSortedProducts.slice(startIndex, endIndex);
    setProducts(paginated);
    setTotalProducts(filteredAndSortedProducts.length);
    setTotalPages(
      Math.max(1, Math.ceil(filteredAndSortedProducts.length / productsPerPage))
    );
  }, [filteredAndSortedProducts, currentPage, productsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedColor, selectedSize, powerMin, powerMax, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedColor("all");
    setSelectedSize("all");
    setPowerMin("");
    setPowerMax("");
  };

  const hasActiveFilters =
    selectedColor !== "all" ||
    selectedSize !== "all" ||
    powerMin !== "" ||
    powerMax !== "";

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
    switch (type) {
      case "latest_arrival":
        return "Latest Arrivals";
      case "top_seller":
        return "Best Sellers";
      case "best_reviewed":
        return "Top Reviewed";
      default:
        return "Products";
    }
  };

  return (
    <section className="w-full py-12 bg-gradient-to-b from-white to-secondary-50 min-h-screen pt-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 lg:max-w-none lg:w-full w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-secondary-600 font-medium">
              Loading amazing products...
            </p>
          </div>
        ) : (
          <>
            {/* Header with Title and Sorting */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-secondary-200">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-3xl font-bold text-secondary-800 mb-2 relative font-sans">
                    {getTitle()}
                    <span className="absolute bottom-0 left-0 w-20 h-1 bg-primary-500 rounded-full"></span>
                  </h2>
                  <p className="text-secondary-600">
                    Showing {products.length} of {totalProducts} products
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden flex items-center justify-center px-4 py-2 bg-white border border-secondary-200 text-secondary-700 rounded-lg hover:bg-primary-50 transition-colors w-full sm:w-auto flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>

                  <div className="flex items-center w-full sm:w-auto min-w-0">
                    <label
                      htmlFor="sort"
                      className="mr-2 text-secondary-700 font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0"
                    >
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="flex-1 sm:flex-none bg-white border border-secondary-200 text-secondary-700 py-2 px-3 sm:px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base min-w-[150px] sm:min-w-0"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest to Oldest</option>
                      <option value="oldest">Oldest to Newest</option>
                      <option value="rating">Customer Rating</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 w-full lg:px-6">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0 max-w-64">
                <div className="bg-white border border-secondary-200 rounded-xl p-6 shadow-md sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-secondary-800">
                      Filters
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Color Filter */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Color
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Colors</option>
                        {availableColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size Filter */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Size
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Sizes</option>
                        {availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Power Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Power Range (W)
                      </label>
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="number"
                          placeholder="Min"
                          value={powerMin}
                          onChange={(e) => setPowerMin(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-secondary-200 text-secondary-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-0"
                        />
                        <span className="text-secondary-500 text-sm flex-shrink-0 whitespace-nowrap">
                          to
                        </span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={powerMax}
                          onChange={(e) => setPowerMax(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-secondary-200 text-secondary-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Mobile Filters Panel */}
              {showMobileFilters && (
                <div className="lg:hidden bg-white border border-secondary-200 rounded-xl p-6 mb-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-secondary-800">
                      Filters
                    </h3>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="text-secondary-500 hover:text-secondary-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Color Filter */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Color
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Colors</option>
                        {availableColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size Filter */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Size
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full bg-white border border-secondary-200 text-secondary-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Sizes</option>
                        {availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Power Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Power Range (W)
                      </label>
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="number"
                          placeholder="Min"
                          value={powerMin}
                          onChange={(e) => setPowerMin(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-secondary-200 text-secondary-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-0"
                        />
                        <span className="text-secondary-500 text-sm flex-shrink-0 whitespace-nowrap">
                          to
                        </span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={powerMax}
                          onChange={(e) => setPowerMax(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-secondary-200 text-secondary-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div className="flex-1 min-w-0 w-full">
                {products.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <svg
                      className="w-16 h-16 text-secondary-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
                      />
                    </svg>
                    <p className="text-secondary-600 text-lg">
                      No products found
                    </p>
                    <p className="text-secondary-500 mt-2">
                      Try changing your search or filter criteria
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Products Grid with Animation */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12 w-full">
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
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PaginatedProductList;
