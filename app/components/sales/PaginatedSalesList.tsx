"use client";

import { useEffect, useState } from "react";
import { get_sales } from "@/app/api/sales";
import { getThumbnailUrl, formatPriceWithCurrency } from "@/app/util";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import Link from "next/link";
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
  [key: string]: any;
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
    <div className="flex flex-col items-center justify-center space-y-4 mt-12 w-full bg-gradient-to-r from-secondary-50 to-primary-50 py-8 rounded-xl shadow-md">
      <div className="text-center mb-2">
        <p className="text-secondary-600 font-medium">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-5 py-2.5 rounded-lg flex items-center transition-all duration-300 ${currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-secondary-700 hover:bg-primary-50 hover:shadow-lg border border-secondary-200"
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
                className="px-4 py-2 rounded-lg bg-white text-secondary-700 hover:bg-primary-50 hover:shadow-lg transition-all duration-300 border border-secondary-200"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-2 text-gray-500">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 border ${currentPage === page
                  ? "bg-primary-500 text-white border-primary-500 shadow-lg"
                  : "bg-white text-secondary-700 hover:bg-primary-50 border-secondary-200 hover:shadow-lg"
                }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-4 py-2 rounded-lg bg-white text-secondary-700 hover:bg-primary-50 hover:shadow-lg transition-all duration-300 border border-secondary-200"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-5 py-2.5 rounded-lg flex items-center transition-all duration-300 ${currentPage >= totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-secondary-700 hover:bg-primary-50 hover:shadow-lg border border-secondary-200"
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

      <div className="text-center mt-4">
        <p className="text-sm text-secondary-500">
          Showing{" "}
          {Math.min((currentPage - 1) * productsPerPage + 1, totalProducts)} to{" "}
          {Math.min(currentPage * productsPerPage, totalProducts)} of{" "}
          {totalProducts} products
        </p>
      </div>
    </div>
  );
};

export default function PaginatedSalesList() {
  const { country } = useUserCountry();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const { addItem } = useCart();
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * productsPerPage;
      const response = await get_sales(productsPerPage, offset);

      if (response.status && response.data) {
        setProducts(response.data);
        setTotalProducts(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / productsPerPage));
      } else {
        setToast({
          message: response.message || "Failed to fetch sales",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      setToast({
        message: "An error occurred while fetching sales",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.color_quantity || product.color_quantity.length === 0) {
      setToast({
        message: "Product is out of stock",
        type: "error",
      });
      return;
    }

    const firstColor = product.color_quantity[0];
    const thumbnailUrl = getThumbnailUrl(product);

    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      quantity: 1,
      color: firstColor.label,
      colorHex: firstColor.color,
      image: thumbnailUrl || undefined,
      primary_thumbnail: product.primary_thumbnail || undefined,
      maxQuantity: Number(firstColor.quantity),
    });

    setToast({
      message: "Product added to cart!",
      type: "success",
    });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-4">
            Sales
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Discover amazing deals and special offers on our products
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-secondary-600 text-lg">
              No sales products found
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => {
                const thumbnailUrl = getThumbnailUrl(product);
                const hasStock =
                  product.color_quantity &&
                  product.color_quantity.some((cq) => Number(cq.quantity) > 0);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <Link href={`/sale/${product.id}`}>
                      <div className="relative aspect-square bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt={product.title}
                            fill
                            className="object-contain p-4"
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
                      </div>
                    </Link>

                    <div className="p-6">
                      <Link href={`/sale/${product.id}`}>
                        <h3 className="text-lg font-bold text-secondary-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                          {product.title}
                        </h3>
                      </Link>

                      {product.sub_title && (
                        <p className="text-sm text-secondary-500 mb-3 line-clamp-2">
                          {product.sub_title}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPriceWithCurrency(
                            Number(product.price),
                            country
                          )}
                        </span>
                        {hasStock ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!hasStock}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${hasStock
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-soft hover:shadow-glow transform hover:scale-105"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {hasStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                productsPerPage={productsPerPage}
                totalProducts={totalProducts}
              />
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
