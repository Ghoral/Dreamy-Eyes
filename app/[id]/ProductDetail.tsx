"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Toast from "../components/ui/Toast";
import { getThumbnailUrl, formatPriceWithCurrency } from "../util";
import { update_product_quantity } from "../api/quantity";
import ModalOffers from "../components/modals/ModalOffers";
import { Offer } from "../context/CartContext";
import { get_enabled_offers } from "../api/offers";
import { useOfferStore } from "../store/offerStore";
import { useUserCountry } from "../hooks/useUserCountry";

const ProductDetail = ({
  product,
  isSale = false,
}: {
  product: any;
  isSale?: boolean;
}) => {
  // Early return if no product
  if (!product) {
    return <div>Product not found</div>;
  }
  // Get images for a specific color from product.images
  const getImagesForColor = (colorHex: string): string[] => {
    if (!product?.images) {
      return [];
    }

    try {
      const parsedImages = JSON.parse(product.images);
      const images = parsedImages[colorHex] || [];
      return images;
    } catch (error) {
      return [];
    }
  };

  // Check if product has valid images
  const hasValidImages = (): boolean => {
    if (!product?.images) return false;

    try {
      const parsedImages = JSON.parse(product.images);
      return (
        Object.keys(parsedImages).length > 0 &&
        Object.values(parsedImages).some(
          (arr: any) => Array.isArray(arr) && arr.length > 0
        )
      );
    } catch (error) {
      return false;
    }
  };

  // Helper function to get Supabase public bucket URL for product images
  const getProductImageUrl = (filename: string): string => {
    if (!filename) return "";

    // If it's already a full URL, return as is
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
      return filename;
    }

    // Construct Supabase public bucket URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/product-image/${filename}`;
    }

    // Fallback to NEXT_PUBLIC_IMAGE_URL if available (for backward compatibility)
    if (process.env.NEXT_PUBLIC_IMAGE_URL) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${filename}`;
    }

    // Last resort fallback
    return `/product-image/${filename}`;
  };

  // Get the first image URL for a color (similar to ProductItems logic)
  const getFirstImageUrl = (images: string): string | null => {
    try {
      const parsed = JSON.parse(images);
      const firstKey = Object.keys(parsed)[0];
      const firstImage = parsed[firstKey]?.[0];

      if (firstImage) {
        return getProductImageUrl(firstImage);
      }
      return null;
    } catch (err) {
      console.error("Invalid image format", err);
      return null;
    }
  };

  // Get image URL for a specific color
  const getImageUrlForColor = (colorHex: string): string => {
    const images = getImagesForColor(colorHex);

    if (images.length > 0) {
      const imageUrl = getProductImageUrl(images[0]);
      return imageUrl;
    }

    // Fallback to primary_thumbnail or first available image or default
    const fallbackUrl =
      getThumbnailUrl(product) || "/images/product-default.jpg";
    return fallbackUrl;
  };

  // Get all available images for the product
  const getAllProductImages = (): string[] => {
    if (!product?.images) return ["/images/product-default.jpg"];

    try {
      const parsedImages = JSON.parse(product.images);
      const allImages: string[] = [];

      Object.values(parsedImages).forEach((imageArray: any) => {
        if (Array.isArray(imageArray)) {
          imageArray.forEach((image: string) => {
            const imageUrl = getProductImageUrl(image);
            if (!allImages.includes(imageUrl)) {
              allImages.push(imageUrl);
            }
          });
        }
      });

      return allImages.length > 0 ? allImages : ["/images/product-default.jpg"];
    } catch (error) {
      console.error("Error parsing product images:", error);
      return ["/images/product-default.jpg"];
    }
  };

  const availableImages = getAllProductImages();

  // Parse specifications - handle both string and object formats
  const parseSpecifications = () => {
    if (!product.specifications) return null;
    try {
      if (typeof product.specifications === "string") {
        return JSON.parse(product.specifications);
      }
      return product.specifications;
    } catch (e) {
      console.error("Error parsing specifications:", e);
      return product.specifications;
    }
  };

  const parsedSpecs = parseSpecifications();
  const isSpecsArray = Array.isArray(parsedSpecs);
  const hasSpecs =
    parsedSpecs &&
    (isSpecsArray
      ? parsedSpecs.length > 0
      : Object.keys(parsedSpecs).length > 0);

  const { country } = useUserCountry();
  const [mainImage, setMainImage] = useState<string>(() => {
    // Try to get the first image from the first available color
    if (product?.color_quantity?.[0]) {
      const firstColor = product.color_quantity[0];
      const firstColorImage = getImageUrlForColor(firstColor.color);
      if (firstColorImage !== "/images/product-default.jpg") {
        return firstColorImage;
      }
    }
    return availableImages[0] || "/images/product-default.jpg";
  });

  const [selectedColor, setSelectedColor] = useState(
    product?.color_quantity?.[0] || null
  );

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isCheckingQuantity, setIsCheckingQuantity] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  const {
    addItem,
    state: cartState,
    updateQuantity,
    removeItem,
    setOffer,
  } = useCart();

  const { isOfferApplied, selectedOffer, clearOffer } = useOfferStore();

  // Update main image when color changes
  useEffect(() => {
    if (selectedColor) {
      const colorImage = getImageUrlForColor(selectedColor.color);
      setMainImage(colorImage);
    }
  }, [selectedColor]);

  // Initialize main image when component mounts
  useEffect(() => {
    if (selectedColor) {
      const colorImage = getImageUrlForColor(selectedColor.color);
      setMainImage(colorImage);
    }
  }, []);

  // Get current cart quantity for this product and color
  const getCurrentCartQuantity = () => {
    if (!selectedColor) return 0;

    const existingItem = cartState.items.find(
      (item) =>
        item.id === (product.id || product.title) &&
        item.color === selectedColor.label
    );

    return existingItem ? existingItem.quantity : 0;
  };

  // Get maximum quantity that can be added (available stock minus current cart quantity)
  const getMaxAddableQuantity = () => {
    if (!selectedColor) return 0;

    const availableStock = parseInt(selectedColor.quantity);
    const currentCartQuantity = getCurrentCartQuantity();

    // You can add up to the available stock, regardless of current cart quantity
    // This allows users to remove items and then add them back
    return Math.max(0, availableStock);
  };

  // Get the actual maximum quantity that can be added in this session
  const getMaxQuantityForThisSession = () => {
    if (!selectedColor) return 0;

    const availableStock = parseInt(selectedColor.quantity);
    const currentCartQuantity = getCurrentCartQuantity();
    const maxAddable = Math.max(0, availableStock - currentCartQuantity);

    return maxAddable;
  };

  // Initialize quantity based on cart state when component mounts or color changes
  useEffect(() => {
    const maxQuantity = getMaxQuantityForThisSession();
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
  }, [selectedColor, cartState.items]);

  const handleColorSelect = (colorOption: any) => {
    setSelectedColor(colorOption);

    // Immediately update main image for the selected color
    const colorImage = getImageUrlForColor(colorOption.color);
    setMainImage(colorImage);

    // Reset quantity to 1 when color changes
    setQuantity(1);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (!selectedColor || !product.id) return;

    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }

    setIsCheckingQuantity(true);
    setQuantityError(null);

    try {
      // Call RPC to validate and update quantity
      const result = await update_product_quantity(
        product.id,
        selectedColor.color,
        newQuantity
      );

      if (result.success) {
        // Use the validated quantity from RPC response
        setQuantity(result.validated_quantity || newQuantity);
      } else {
        setQuantityError(result.message || "Quantity not available");
        // Set to maximum available if less than requested
        if (result.available_quantity > 0) {
          setQuantity(result.available_quantity);
        } else {
          setQuantity(1);
        }
      }
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      setQuantityError(error.message || "Failed to update quantity");
    } finally {
      setIsCheckingQuantity(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      setShowToast(true);
      return;
    }

    const cartItem = {
      id: product.id || product.title,
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: quantity,
      color: selectedColor.label,
      colorHex: selectedColor.color,
      image: getImageUrlForColor(selectedColor.color),
      primary_thumbnail: product.primary_thumbnail || undefined,
      maxQuantity: parseInt(selectedColor.quantity),
      productImages: product.images || undefined,
    };

    addItem(cartItem);
    setShowToast(true);

    // Reset quantity to 1 after adding to cart
    setQuantity(1);

    // Open offers modal when item is added to cart (only if no offer is already applied)
    // Use setTimeout to ensure cart state is updated before checking
    setTimeout(async () => {
      // Get fresh state from Zustand store to ensure we have the latest values
      const { useOfferStore } = await import("@/app/store/offerStore");
      const {
        isOfferApplied: currentIsOfferApplied,
        selectedOffer: currentSelectedOffer,
      } = useOfferStore.getState();

      // Don't open modal if an offer is already applied
      if (currentIsOfferApplied || currentSelectedOffer) {
        return;
      }

      try {
        const response = await get_enabled_offers();
        // Open modal if there are any enabled offers
        if (response.status && response.data && response.data.length > 0) {
          setIsOffersModalOpen(true);
        }
      } catch (error) {
        console.error("Error checking offers:", error);
      }
    }, 100);
  };

  const handleOfferSelect = (offer: any, selectedProducts: any[]) => {
    setOffer(offer, selectedProducts);
  };

  const handleRemoveFromCart = () => {
    if (!selectedColor) return;

    const existingItem = cartState.items.find(
      (item) =>
        item.id === (product.id || product.title) &&
        item.color === selectedColor.label
    );

    if (existingItem) {
      removeItem(existingItem.id, existingItem.color);
    }
  };

  const getMaxQuantity = () => {
    return selectedColor ? parseInt(selectedColor.quantity) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              {hasValidImages() ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg
                      className="w-24 h-24 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {hasValidImages() && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedColor
                  ? getImagesForColor(selectedColor.color).length > 0
                    ? getImagesForColor(selectedColor.color).map((image, i) => {
                        const imageUrl = getProductImageUrl(image);
                        return (
                          <div
                            key={i}
                            className={`flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                              mainImage === imageUrl
                                ? "border-blue-500"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setMainImage(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Thumbnail ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })
                    : availableImages.map((img, i) => (
                        <div
                          key={i}
                          className={`flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            mainImage === img
                              ? "border-blue-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setMainImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                  : availableImages.map((img, i) => (
                      <div
                        key={i}
                        className={`flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          mainImage === img
                            ? "border-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setMainImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
                {product.title}
              </h1>
              {product.sub_title && (
                <p className="text-gray-600 text-base mb-3">
                  {product.sub_title}
                </p>
              )}
              
              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <svg
                    className="w-5 h-5 text-gray-300 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Features Icons */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Easy Return</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">EXPRESS<br/>DELIVERY</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">FREE COD</p>
              </div>
            </div>

            {/* Specifications Section */}
            {hasSpecs && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {isSpecsArray
                    ? parsedSpecs
                        .filter((item: any) => {
                          if (!item || typeof item !== "object") return false;
                          if (item.label && item.value) return true;
                          return false;
                        })
                        .map((item: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 capitalize text-sm">
                                {item.label}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {item.value}
                              </span>
                            </div>
                          </div>
                        ))
                    : Object.entries(parsedSpecs)
                        .filter(([key, value]) => {
                          if (/^[0-9]+$/.test(String(key))) return false;
                          if (value === null || value === undefined) return false;
                          if (typeof value === "string" && value.trim() === "") return false;
                          if (Array.isArray(value) && value.length === 0) return false;
                          if (typeof value === "object" && !Array.isArray(value)) {
                            const obj = value as any;
                            if (obj.label && obj.value) return true;
                            if (Object.keys(obj).length === 0) return false;
                            return true;
                          }
                          return true;
                        })
                        .map(([key, value]) => {
                          let displayValue: string | React.ReactNode = "";
                          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                            const obj = value as any;
                            if (obj.label && obj.value) {
                              displayValue = (
                                <span className="flex flex-col items-end">
                                  <span className="font-normal text-black">{obj.label}</span>
                                  <span className="text-sm text-gray-600">{obj.value}</span>
                                </span>
                              );
                            } else if (obj.value !== undefined) {
                              displayValue = String(obj.value);
                            } else if (obj.name !== undefined) {
                              displayValue = String(obj.name);
                            } else {
                              displayValue = JSON.stringify(value);
                            }
                          } else if (Array.isArray(value)) {
                            displayValue = value
                              .map((item) => {
                                if (typeof item === "object" && item !== null) {
                                  if (item.label && item.value) {
                                    return `${item.label}: ${item.value}`;
                                  }
                                  return item.value || item.name || JSON.stringify(item);
                                }
                                return String(item);
                              })
                              .join(", ");
                          } else {
                            displayValue = String(value);
                          }
                          return (
                            <div key={key} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 capitalize text-sm">
                                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                                </span>
                                <div className="text-right">
                                  {typeof displayValue === "string" ? (
                                    <span className="font-semibold text-gray-900">{displayValue}</span>
                                  ) : (
                                    displayValue
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  {product.power && (
                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 text-sm">Power Rating</span>
                        <span className="font-semibold text-gray-900">{product.power}W</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="pt-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPriceWithCurrency(product.price, country)}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Select Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {product?.color_quantity.map(
                  (colorOption: any, index: number) => {
                    const isAvailable = parseInt(colorOption.quantity) > 0;
                    const isSelected =
                      selectedColor?.label === colorOption.label;
                    const isDisabled = !isAvailable;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isDisabled) {
                            handleColorSelect(colorOption);
                          }
                        }}
                        disabled={isDisabled}
                        className={`relative px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isDisabled
                            ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: colorOption.color }}
                          />
                          <span className={`text-sm font-medium ${
                            isSelected ? "text-blue-700" : "text-gray-700"
                          }`}>
                            {colorOption.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quantity
              </h3>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || isCheckingQuantity}
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
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    className="w-20 text-center border-0 focus:ring-0 text-base font-semibold text-gray-900"
                    value={quantity}
                    min={1}
                    max={getMaxQuantityForThisSession()}
                    onChange={(e) =>
                      handleQuantityChange(Number(e.target.value))
                    }
                    disabled={isCheckingQuantity}
                  />
                  {isCheckingQuantity && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <button
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      quantity >= getMaxQuantityForThisSession() ||
                      getMaxQuantityForThisSession() === 0 ||
                      isCheckingQuantity
                    }
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
                {selectedColor && (
                  <span className="text-sm text-gray-600">
                    {getMaxQuantityForThisSession()} available
                  </span>
                )}
              </div>

              {/* Quantity Error Display */}
              {quantityError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm text-red-600">{quantityError}</span>
                </div>
              )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                className={`w-full py-4 px-6 rounded-lg font-semibold text-base transition-all duration-300 ${
                  !selectedColor || getMaxQuantityForThisSession() === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                }`}
                onClick={handleAddToCart}
                disabled={
                  !selectedColor || getMaxQuantityForThisSession() === 0
                }
              >
                {!selectedColor
                  ? "Select Color First"
                  : getCurrentCartQuantity() > 0
                  ? `Add ${quantity} More to Cart`
                  : "Add to Cart"}
              </button>

              {/* Show Remove from Cart button if item is already in cart */}
              {getCurrentCartQuantity() > 0 && (
                <button
                  className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium text-base transition-all duration-300"
                  onClick={handleRemoveFromCart}
                  disabled={!selectedColor}
                >
                  Remove from Cart ({getCurrentCartQuantity()})
                </button>
              )}
            </div>
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      <Toast
        message={
          !selectedColor
            ? "Please select a color first!"
            : getCurrentCartQuantity() > 0 &&
              getCurrentCartQuantity() > parseInt(selectedColor.quantity)
            ? `${quantity} more ${product.title} added to cart!`
            : `${product.title} added to cart!`
        }
        type={!selectedColor ? "error" : "success"}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Offers Modal */}
      <ModalOffers
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        onSelectOffer={handleOfferSelect}
      />
    </div>
  );
};

export default ProductDetail;
