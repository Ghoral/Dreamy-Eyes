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
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              <div className="bg-white overflow-hidden rounded-2xl shadow-2xl">
                {hasValidImages() ? (
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-[600px] object-contain"
                  />
                ) : (
                  <div className="w-full h-[600px] bg-gray-50 flex items-center justify-center">
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
            </div>

            {/* Thumbnail Images */}
            {hasValidImages() && (
              <div className="flex justify-start space-x-3">
                {selectedColor
                  ? // Show images for the selected color
                    getImagesForColor(selectedColor.color).length > 0
                    ? getImagesForColor(selectedColor.color).map((image, i) => {
                        const imageUrl = getProductImageUrl(image);
                        return (
                          <div
                            key={i}
                            className={`w-16 h-16 overflow-hidden cursor-pointer border ${
                              mainImage === imageUrl
                                ? "border-black"
                                : "border-gray-200"
                            }`}
                            onClick={() => setMainImage(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Thumbnail ${i + 1}`}
                              className="w-full h-full object-contain bg-white"
                            />
                          </div>
                        );
                      })
                    : // Show all available images if selected color has no images
                      availableImages.map((img, i) => (
                        <div
                          key={i}
                          className={`w-16 h-16 overflow-hidden cursor-pointer border ${
                            mainImage === img
                              ? "border-black"
                              : "border-gray-200"
                          }`}
                          onClick={() => setMainImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${i + 1}`}
                            className="w-full h-full object-contain bg-white"
                          />
                        </div>
                      ))
                  : // Show all available images if no color is selected
                    availableImages.map((img, i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 overflow-hidden cursor-pointer border ${
                          mainImage === img
                            ? "border-black"
                            : "border-gray-200"
                        }`}
                        onClick={() => setMainImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-8">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-normal text-black mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {product.title}
              </h1>
              {product.sub_title && (
                <p className="text-gray-600 text-sm mb-4">
                  {product.sub_title}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <span className="text-2xl font-normal text-black">
                {formatPriceWithCurrency(product.price, country)}
              </span>
            </div>

            {/* Description */}
            <div>
              <div
                className="text-black text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-normal text-black mb-4 uppercase tracking-wide">
                Color
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product?.color_quantity.map(
                  (colorOption: any, index: number) => {
                    const isAvailable = parseInt(colorOption.quantity) > 0;
                    const isSelected =
                      selectedColor?.label === colorOption.label;
                    const isDisabled = !isAvailable;

                    return (
                      <div key={index} className="relative">
                        <input
                          type="radio"
                          className="sr-only"
                          name="color"
                          id={colorOption.label}
                          checked={isSelected}
                          onChange={() => handleColorSelect(colorOption)}
                          disabled={isDisabled}
                        />
                        <label
                          htmlFor={colorOption.label}
                          className={`block p-3 border cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "border-black"
                              : isDisabled
                              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                              : "border-gray-200 bg-white hover:border-gray-400"
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              handleColorSelect(colorOption);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-5 h-5 border border-gray-300"
                              style={{ backgroundColor: colorOption.color }}
                            />
                            <span className="text-sm text-black">
                              {colorOption.label}
                            </span>
                          </div>
                        </label>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-normal text-black mb-4 uppercase tracking-wide">
                Quantity
              </h3>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex items-center border border-gray-200 overflow-hidden bg-white">
                  <button
                    className="px-4 py-2 text-black hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || isCheckingQuantity}
                  >
                    <svg
                      className="w-4 h-4"
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
                    className="w-16 text-center border-0 focus:ring-0 text-sm font-normal text-black"
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
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <button
                    className="px-4 py-2 text-black hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      quantity >= getMaxQuantityForThisSession() ||
                      getMaxQuantityForThisSession() === 0 ||
                      isCheckingQuantity
                    }
                  >
                    <svg
                      className="w-4 h-4"
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
              </div>

              {/* Quantity Error Display */}
              {quantityError && (
                <div className="mb-4">
                  <span className="text-xs text-red-600">{quantityError}</span>
                </div>
              )}

            {/* Action Buttons */}
            <div>
              <button
                className={`w-full py-3 px-6 border border-black text-black font-normal text-sm uppercase tracking-wide transition-all duration-300 ${
                  !selectedColor || getMaxQuantityForThisSession() === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                    : "bg-white hover:bg-black hover:text-white"
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
                  className="w-full py-3 px-6 mt-3 border border-gray-300 text-black bg-white hover:bg-gray-50 font-normal text-sm uppercase tracking-wide transition-all duration-300"
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

        {/* Specifications Section */}
        {hasSpecs && (
          <div className="mt-20">
            <div className="bg-white border border-gray-200 p-8">
              <div className="flex items-center justify-center mb-8">
                <h3 className="text-xl font-normal text-black">
                  Specifications
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isSpecsArray
                  ? // Handle array format: [{"label": "size", "value": "14.5mm"}, ...]
                    parsedSpecs
                      .filter((item: any) => {
                        // Filter out invalid items
                        if (!item || typeof item !== "object") return false;
                        if (item.label && item.value) return true;
                        return false;
                      })
                      .map((item: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-normal text-black capitalize text-sm">
                              {item.label}
                            </span>
                            <span className="font-normal text-black">
                              {item.value}
                            </span>
                          </div>
                        </div>
                      ))
                  : // Handle object format: {key: value, ...}
                    Object.entries(parsedSpecs)
                      .filter(([key, value]) => {
                        // Filter out keys that are just numbers (array indices like "0", "1", etc.)
                        // But allow keys that contain numbers with other characters
                        if (/^[0-9]+$/.test(String(key))) return false;

                        // Filter out null and undefined
                        if (value === null || value === undefined) return false;

                        // Filter out empty strings
                        if (typeof value === "string" && value.trim() === "")
                          return false;

                        // Filter out empty arrays
                        if (Array.isArray(value) && value.length === 0)
                          return false;

                        // For objects, check if they have meaningful data
                        if (
                          typeof value === "object" &&
                          !Array.isArray(value)
                        ) {
                          const obj = value as any;
                          // If it has label and value, it's valid
                          if (obj.label && obj.value) return true;
                          // If it's an empty object, filter it out
                          if (Object.keys(obj).length === 0) return false;
                          // Otherwise, allow it (might have other properties)
                          return true;
                        }

                        // Allow all other values (including 0, false, "0", "1" as they might be valid)
                        return true;
                      })
                      .map(([key, value]) => {
                        // Format the value properly
                        let displayValue: string | React.ReactNode = "";

                        if (
                          typeof value === "object" &&
                          value !== null &&
                          !Array.isArray(value)
                        ) {
                          const obj = value as any;
                          // Handle object with label and value
                          if (obj.label && obj.value) {
                            displayValue = (
                              <span className="flex flex-col items-end">
                                <span className="font-normal text-black">
                                  {obj.label}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {obj.value}
                                </span>
                              </span>
                            );
                          } else if (obj.value !== undefined) {
                            displayValue = String(obj.value);
                          } else if (obj.name !== undefined) {
                            displayValue = String(obj.name);
                          } else {
                            // Try to stringify the object
                            displayValue = JSON.stringify(value);
                          }
                        } else if (Array.isArray(value)) {
                          displayValue = value
                            .map((item) => {
                              if (typeof item === "object" && item !== null) {
                                if (item.label && item.value) {
                                  return `${item.label}: ${item.value}`;
                                }
                                return (
                                  item.value ||
                                  item.name ||
                                  JSON.stringify(item)
                                );
                              }
                              return String(item);
                            })
                            .join(", ");
                        } else {
                          displayValue = String(value);
                        }

                        return (
                          <div
                            key={key}
                            className="bg-white border border-gray-200 p-4"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-normal text-black capitalize text-sm">
                                {key.charAt(0).toUpperCase() +
                                  key.slice(1).replace(/([A-Z])/g, " $1")}
                              </span>
                              <div className="text-right">
                                {typeof displayValue === "string" ? (
                                  <span className="font-normal text-black">
                                    {displayValue}
                                  </span>
                                ) : (
                                  displayValue
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                {product.power && (
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-normal text-black text-sm">
                        Power Rating
                      </span>
                      <span className="font-normal text-black">
                        {product.power}W
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
