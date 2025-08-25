"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Toast from "../components/ui/Toast";

const ProductDetail = ({ product }: { product: any }) => {
  // Get images for a specific color from product.images
  const getImagesForColor = (colorHex: string): string[] => {
    console.log("getImagesForColor called with hex:", colorHex);
    console.log("Product images:", product?.images);

    if (!product?.images) {
      console.log("No product images found");
      return [];
    }

    try {
      const parsedImages = JSON.parse(product.images);
      console.log("Parsed images:", parsedImages);
      console.log("Looking for color:", colorHex);
      console.log("Available colors:", Object.keys(parsedImages));

      const images = parsedImages[colorHex] || [];
      console.log("Images found for color:", images);
      return images;
    } catch (error) {
      console.error("Error parsing product images:", error);
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

  // Get the first image URL for a color (similar to ProductItems logic)
  const getFirstImageUrl = (images: string): string | null => {
    try {
      const parsed = JSON.parse(images);
      const firstKey = Object.keys(parsed)[0];
      const firstImage = parsed[firstKey]?.[0];

      if (firstImage) {
        return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${firstImage}`;
      }
      return null;
    } catch (err) {
      console.error("Invalid image format", err);
      return null;
    }
  };

  // Get image URL for a specific color
  const getImageUrlForColor = (colorHex: string): string => {
    console.log("Getting image for color:", colorHex);
    const images = getImagesForColor(colorHex);
    console.log("Images found for color:", images);

    if (images.length > 0) {
      const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${images[0]}`;
      console.log("Returning image URL:", imageUrl);
      return imageUrl;
    }

    // Fallback to first available image or default
    const fallbackUrl =
      getFirstImageUrl(product.images) || "/images/product-default.jpg";
    console.log("Using fallback URL:", fallbackUrl);
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
            const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${image}`;
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
  console.log("selectedColor", selectedColor);

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const { addItem, state: cartState, updateQuantity, removeItem } = useCart();

  // Update main image when color changes
  useEffect(() => {
    if (selectedColor) {
      const colorImage = getImageUrlForColor(selectedColor.color);
      console.log(
        "Color changed to:",
        selectedColor.color,
        "Image:",
        colorImage
      );
      setMainImage(colorImage);
    }
  }, [selectedColor]);

  // Initialize main image when component mounts
  useEffect(() => {
    if (selectedColor) {
      const colorImage = getImageUrlForColor(selectedColor.color);
      console.log("Initial color image:", colorImage);
      setMainImage(colorImage);
    }
  }, []);

  // Monitor mainImage changes for debugging
  useEffect(() => {
    console.log("Main image changed to:", mainImage);
  }, [mainImage]);

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
    console.log("Color selected:", colorOption);
    setSelectedColor(colorOption);

    // Immediately update main image for the selected color
    const colorImage = getImageUrlForColor(colorOption.color);
    console.log("Setting main image to:", colorImage);
    setMainImage(colorImage);

    // Reset quantity to 1 when color changes
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = getMaxQuantityForThisSession();
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
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
      maxQuantity: parseInt(selectedColor.quantity),
    };

    addItem(cartItem);
    setShowToast(true);
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pt-28 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {hasValidImages() ? (
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-[500px] object-contain p-8 transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-white flex items-center justify-center">
                    <div className="text-center text-secondary-400">
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
                      <p className="text-lg font-medium">No image available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {hasValidImages() && (
              <div className="flex justify-center space-x-4">
                {selectedColor
                  ? // Show images for the selected color
                    getImagesForColor(selectedColor.color).length > 0
                    ? getImagesForColor(selectedColor.color).map((image, i) => {
                        const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${image}`;
                        return (
                          <div
                            key={i}
                            className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 ${
                              mainImage === imageUrl
                                ? "ring-4 ring-primary-500 ring-offset-2"
                                : "ring-1 ring-secondary-200 hover:ring-primary-300"
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
                          className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 ${
                            mainImage === img
                              ? "ring-4 ring-primary-500 ring-offset-2"
                              : "ring-1 ring-secondary-200 hover:ring-primary-300"
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
                        className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 ${
                          mainImage === img
                            ? "ring-4 ring-primary-500 ring-offset-2"
                            : "ring-1 ring-secondary-200 hover:ring-primary-300"
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
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-4 leading-tight">
                {product.title}
              </h1>
              {product.sub_title && (
                <p className="text-primary-600 font-semibold text-xl mb-4">
                  {product.sub_title}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-secondary-600 font-medium">4.9</span>
                <span className="text-secondary-500">(120 reviews)</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600 font-semibold">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>In Stock</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-2xl border border-primary-100">
              <span className="text-5xl font-bold text-primary-600">
                ${product.price}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-3">
                Description
              </h3>
              <div
                className="text-secondary-600 leading-relaxed prose prose-secondary max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                Choose Color
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
                          className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "border-primary-500 bg-primary-50 shadow-glow"
                              : isDisabled
                              ? "border-secondary-200 bg-secondary-100 cursor-not-allowed opacity-60"
                              : "border-secondary-200 bg-white hover:border-primary-300 hover:shadow-soft"
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              handleColorSelect(colorOption);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: colorOption.color }}
                            />
                            <div className="flex-1 text-left">
                              <span
                                className={`font-medium ${
                                  isSelected
                                    ? "text-primary-700"
                                    : "text-secondary-700"
                                }`}
                              >
                                {colorOption.label}
                              </span>
                              <div className="text-sm text-secondary-500">
                                {isAvailable
                                  ? `${colorOption.quantity} available`
                                  : "Out of stock"}
                              </div>
                            </div>
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
              <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                Quantity
              </h3>

              {/* Cart Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-primary-600"
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
                    <span className="text-sm text-secondary-600">
                      In Cart:{" "}
                      <strong className="text-primary-700">
                        {getCurrentCartQuantity()}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="text-sm text-secondary-600">
                      Can Add:{" "}
                      <strong className="text-green-700">
                        {getMaxQuantityForThisSession()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Cart Quantity Display */}
              {getCurrentCartQuantity() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 text-blue-700">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      You currently have{" "}
                      <strong>{getCurrentCartQuantity()}</strong> of this item
                      in your cart
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-secondary-200 rounded-xl overflow-hidden bg-white">
                  <button
                    className="px-4 py-3 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
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
                    className="w-20 text-center border-0 focus:ring-0 text-lg font-semibold text-secondary-800"
                    value={quantity}
                    min={1}
                    max={getMaxQuantityForThisSession()}
                    onChange={(e) =>
                      handleQuantityChange(Number(e.target.value))
                    }
                  />
                  <button
                    className="px-4 py-3 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      quantity >= getMaxQuantityForThisSession() ||
                      getMaxQuantityForThisSession() === 0
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
                <div className="text-sm text-secondary-500">
                  <div>Total available: {getMaxQuantity()}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  !selectedColor || getMaxQuantityForThisSession() === 0
                    ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-glow hover:shadow-glow-lg"
                }`}
                onClick={handleAddToCart}
                disabled={
                  !selectedColor || getMaxQuantityForThisSession() === 0
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-6 h-6"
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
                  <span>
                    {!selectedColor
                      ? "Select Color First"
                      : getCurrentCartQuantity() > 0
                      ? `Add ${quantity} More to Cart`
                      : "Add to Cart"}
                  </span>
                </div>
              </button>

              {/* Show Remove from Cart button if item is already in cart */}
              {getCurrentCartQuantity() > 0 && (
                <button
                  className="w-full py-4 px-6 bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  onClick={handleRemoveFromCart}
                  disabled={!selectedColor}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-6 h-6"
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
                    <span>Remove from Cart ({getCurrentCartQuantity()})</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mt-20">
              <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
                <h3 className="text-3xl font-bold text-secondary-800 mb-8 text-center">
                  Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(
                    ([key, value], index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-4 border-b border-secondary-100 last:border-b-0"
                      >
                        <span className="font-semibold text-secondary-600 capitalize">
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-medium text-secondary-800">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                  {product.power && (
                    <div className="flex justify-between items-center py-4 border-b border-secondary-100 last:border-b-0">
                      <span className="font-semibold text-secondary-600">
                        Power Rating
                      </span>
                      <span className="font-medium text-secondary-800">
                        {product.power}W
                      </span>
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
    </div>
  );
};

export default ProductDetail;
