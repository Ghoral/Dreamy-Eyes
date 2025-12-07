"use client";

import { useEffect, useState, useMemo } from "react";
import { get_products_by_type } from "@/app/api/product";
import { getThumbnailUrl, formatPriceWithCurrency, formatPrice } from "@/app/util";
import Image from "next/image";
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
  const router = require("next/navigation").useRouter();

  const handleProductClick = () => {
    router.push(`/${encodeURIComponent(product.id)}`);
  };

  const imageUrl = getThumbnailUrl(product);
  
  // Check if product is on sale
  const originalPrice = (product as any).original_price || product.price;
  const salePrice = (product as any).sale_price || product.price;
  const isOnSale = (product as any).original_price && (product as any).original_price > salePrice;
  const hasDiscount = (product as any).discount || (product as any).discount_percentage;
  
  // Calculate sale price if discount exists
  let finalSalePrice = salePrice;
  let finalOriginalPrice = originalPrice;
  
  if (hasDiscount && !isOnSale) {
    const discountValue = (product as any).discount_percentage || (product as any).discount || 0;
    if (discountValue > 0) {
      finalOriginalPrice = typeof originalPrice === "number" ? originalPrice : parseFloat(originalPrice.toString());
      finalSalePrice = finalOriginalPrice - (finalOriginalPrice * discountValue / 100);
      if (finalSalePrice < finalOriginalPrice) {
        // Only show sale if there's actually a discount
      } else {
        finalSalePrice = finalOriginalPrice;
      }
    }
  }

  const showSale = isOnSale || (hasDiscount && finalSalePrice < finalOriginalPrice);

  // Determine product tags
  const tags: string[] = [];
  
  // Check for On Sale (priority tag - show first)
  if (showSale) {
    tags.push("On Sale");
  }
  
  // Check for Newest (created within last 30 days)
  if (product.created_at) {
    const createdDate = new Date(product.created_at);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      tags.push("Newest");
    }
  }
  
  // Check for Best Seller (high order_count)
  if (product.order_count && product.order_count > 50) {
    tags.push("Best Seller");
  }

  return (
    <div
      className="group cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Product Image Container - Premium Luxury Design */}
      <div className="relative w-full aspect-square bg-white mb-3 overflow-hidden rounded-lg">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              className="w-full h-full object-cover"
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
            {/* Product Tags - Top Left */}
            {tags.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                {tags.map((tag, tagIndex) => (
                  <div
                    key={tagIndex}
                    className="bg-black text-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <svg
              className="w-12 h-12 text-gray-300"
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
      </div>

      {/* Product Info - Left Aligned */}
      <div className="text-left">
        {/* Title */}
        <h3 className="text-[13px] font-normal text-black mb-1.5 line-clamp-2 leading-tight">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex flex-col">
          {showSale ? (
            <>
              <span className="text-[13px] font-normal text-black line-through mb-0.5 opacity-60">
                {formatPrice(
                  typeof finalOriginalPrice === "number"
                    ? finalOriginalPrice
                    : parseFloat(finalOriginalPrice.toString()),
                  country
                )}
              </span>
              <span className="text-[13px] font-normal text-black">
                {formatPrice(
                  typeof finalSalePrice === "number"
                    ? finalSalePrice
                    : parseFloat(finalSalePrice.toString()),
                  country
                )}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-normal text-black">
              {formatPrice(
                typeof originalPrice === "number"
                  ? originalPrice
                  : parseFloat(originalPrice.toString()),
                country
              )}
            </span>
          )}
        </div>
      </div>
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
                  <h2 className="text-3xl font-bold text-secondary-800 mb-2 relative font-serif">
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
                    {/* Products Grid - Minimal Design */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 mb-12 w-full">
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
