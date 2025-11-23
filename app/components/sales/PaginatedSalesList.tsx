"use client";

import { useEffect, useState } from "react";
import { get_sales } from "@/app/api/sales";
import { getThumbnailUrl } from "@/app/util";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import Toast from "../ui/Toast";
import { useRouter } from "next/navigation";

type Sale = {
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
  itemsPerPage: number;
  totalItems: number;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
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
              className={`px-4 py-2 rounded-lg transition-all duration-300 border ${
                page === currentPage
                  ? "bg-primary-500 text-white border-primary-500 shadow-lg scale-105"
                  : "bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg border-secondary-200 hover:scale-105"
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
                className="px-4 py-2 rounded-lg bg-white text-secondary-700 hover:bg-primary-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-secondary-200 hover:scale-105 animate-fade-in"
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
        Showing items {(currentPage - 1) * itemsPerPage + 1} -{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
      </div>
    </div>
  );
};

const SaleCard = ({ sale }: { sale: Sale }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    isVisible: boolean;
  }>({ message: "", isVisible: false });
  const { addItem } = useCart();
  const router = useRouter();

  const handleSaleClick = () => {
    router.push(`/${encodeURIComponent(sale.id)}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    let maxQuantity = 1;
    if (sale.color_quantity && sale.color_quantity.length > 0) {
      maxQuantity =
        parseInt(sale.color_quantity[0].quantity.toString()) || 1;
    }

    addItem({
      id: sale.id,
      title: sale.title,
      description: sale.description,
      price: sale.price,
      quantity: 1,
      image: getThumbnailUrl(sale) || undefined,
      maxQuantity: maxQuantity,
      primary_thumbnail: sale.primary_thumbnail || undefined,
      productImages: sale.images || undefined,
    });

    setToastConfig({
      message: `${sale.title} added to cart!`,
      isVisible: true,
    });
  };

  // Check if sale is "hot" (high order count)
  const isHot = sale.order_count && sale.order_count > 10;

  const imageUrl = getThumbnailUrl(sale);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      onMouseEnter={() => setHoveredItem(sale.id)}
      onMouseLeave={() => setHoveredItem(null)}
      onClick={handleSaleClick}
    >
      {/* Hot Badge */}
      {isHot && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
          🔥 HOT
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-64 bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={sale.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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

        {/* Add to Cart Button - Shows on Hover */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            hoveredItem === sale.id ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-110 transition-all duration-300 shadow-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-secondary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {sale.title}
        </h3>
        {sale.sub_title && (
          <p className="text-sm text-secondary-600 mb-2 line-clamp-1">
            {sale.sub_title}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-primary-600">
            ${sale.price}
          </span>
          {sale.review_count !== undefined && sale.review_count > 0 && (
            <div className="flex items-center space-x-1 text-yellow-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">
                {sale.review_count}
              </span>
            </div>
          )}
        </div>
      </div>

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

const PaginatedSalesList = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalSales, setTotalSales] = useState<number>(0);
  const salesPerPage = 12;

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * salesPerPage;
        const response = await get_sales(salesPerPage, offset);

        if (response.status && response.data) {
          setSales(response.data);
          setTotalSales(response.total || 0);
          setTotalPages(Math.max(1, Math.ceil((response.total || 0) / salesPerPage)));
        } else {
          setError(response.message || "Failed to fetch sales");
        }
      } catch (err) {
        setError("An error occurred while fetching sales");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <section className="w-full py-12 bg-gradient-to-b from-white to-secondary-50 min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4 font-serif">
                Sales
              </h1>
              <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                Discover amazing deals and special offers on our products
              </p>
            </div>

            {sales.length === 0 ? (
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
                <p className="text-secondary-600 text-lg">No sales found</p>
                <p className="text-secondary-500 mt-2">
                  Check back later for new deals
                </p>
              </div>
            ) : (
              <>
                {/* Sales Grid with Animation */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                  {sales.map((sale, index) => (
                    <div
                      key={sale.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <SaleCard sale={sale} />
                    </div>
                  ))}
                </div>

                {/* Pagination - Always show at bottom */}
                <div className="mt-8 mb-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={salesPerPage}
                    totalItems={totalSales}
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

export default PaginatedSalesList;

