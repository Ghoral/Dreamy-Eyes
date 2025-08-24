"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Toast from "../components/ui/Toast";

const ProductDetail = ({ product }: { product: any }) => {
  // Get images for a specific color from product.images
  const getImagesForColor = (colorHex: string): string[] => {
    if (!product?.images) return [];

    try {
      const parsedImages = JSON.parse(product.images);
      return parsedImages[colorHex] || [];
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
    const images = getImagesForColor(colorHex);
    if (images.length > 0) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${images[0]}`;
    }
    // Fallback to first available image or default
    return getFirstImageUrl(product.images) || "/images/product-default.jpg";
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
      setMainImage(colorImage);
    }
  }, [selectedColor]);

  // Initialize main image when component mounts
  useEffect(() => {
    if (selectedColor && !mainImage.includes("/product-image/")) {
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

    console.log("Cart Debug:", {
      availableStock,
      currentCartQuantity,
      maxAddable,
      selectedColor: selectedColor.label,
    });

    return maxAddable;
  };

  // Initialize quantity based on cart state when component mounts or color changes
  useEffect(() => {
    if (selectedColor) {
      const currentCartQuantity = getCurrentCartQuantity();
      // If item is already in cart, start with 1 (to add more)
      // If not in cart, start with 1
      setQuantity(1);
    }
  }, [selectedColor, cartState.items]);

  // Reset quantity when cart changes to ensure proper limits
  useEffect(() => {
    if (selectedColor) {
      const maxForSession = getMaxQuantityForThisSession();
      if (quantity > maxForSession && maxForSession > 0) {
        setQuantity(maxForSession);
      } else if (maxForSession === 0) {
        setQuantity(1);
      }
    }
  }, [cartState.items, selectedColor, quantity]);

  const handleAddToCart = () => {
    if (!selectedColor) {
      setShowToast(true);
      return;
    }

    const currentCartQuantity = getCurrentCartQuantity();

    if (currentCartQuantity > 0) {
      // Update existing item quantity
      const newTotalQuantity = currentCartQuantity + quantity;
      updateQuantity(
        product.id || product.title,
        newTotalQuantity,
        selectedColor.label
      );
    } else {
      // Add new item
      addItem({
        id: product.id || product.title,
        title: product.title,
        description: product.description,
        price: product.price,
        quantity: quantity,
        color: selectedColor.label,
        colorHex: selectedColor.color,
        image: getImageUrlForColor(selectedColor.color),
        maxQuantity: parseInt(selectedColor.quantity),
      });
    }

    setShowToast(true);
  };

  const handleRemoveFromCart = () => {
    if (!selectedColor) return;

    removeItem(product.id || product.title, selectedColor.label);
  };

  const handleColorSelect = (colorOption: any) => {
    setSelectedColor(colorOption);
    setQuantity(1); // Reset quantity when color changes
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedColor) {
      const maxForSession = getMaxQuantityForThisSession();
      const validQuantity = Math.min(Math.max(1, newQuantity), maxForSession);

      console.log("Quantity Change:", {
        requested: newQuantity,
        maxForSession,
        validQuantity,
      });

      setQuantity(validQuantity);
    }
  };

  const getMaxQuantity = () => {
    return selectedColor ? parseInt(selectedColor.quantity) : 1;
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none text-muted">
                Home
              </a>
            </li>
            <li className="breadcrumb-item">
              <a href="/shop" className="text-decoration-none text-muted">
                Shop
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Left Column - Product Images */}
          <div className="col-lg-6">
            <div className="product-gallery">
              {/* Main Image */}
              <div className="main-image-container mb-4">
                <div
                  className="position-relative rounded-4 overflow-hidden shadow-lg"
                  style={{ backgroundColor: "white" }}
                >
                  {hasValidImages() ? (
                    <img
                      src={mainImage}
                      alt={product.title}
                      className="w-100"
                      style={{
                        height: "500px",
                        objectFit: "contain",
                        padding: "20px",
                      }}
                    />
                  ) : (
                    <div
                      className="w-100 d-flex align-items-center justify-content-center"
                      style={{
                        height: "500px",
                        backgroundColor: "#f8f9fa",
                        color: "#6c757d",
                      }}
                    >
                      <div className="text-center">
                        <i
                          className="bi bi-image"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <p className="mt-2 mb-0">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="thumbnail-container">
                {hasValidImages() && (
                  <div className="d-flex gap-3 justify-content-center">
                    {selectedColor
                      ? // Show images for the selected color
                        getImagesForColor(selectedColor.color).length > 0
                        ? getImagesForColor(selectedColor.color).map(
                            (image, i) => {
                              const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${image}`;
                              return (
                                <div
                                  key={i}
                                  className={`thumbnail-item rounded-3 overflow-hidden cursor-pointer ${
                                    mainImage === imageUrl
                                      ? "border-3 border-primary"
                                      : "border border-light"
                                  }`}
                                  style={{
                                    width: "80px",
                                    height: "80px",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setMainImage(imageUrl)}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Thumbnail ${i + 1}`}
                                    className="w-100 h-100"
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                              );
                            }
                          )
                        : // Show all available images if selected color has no images
                          availableImages.map((img, i) => (
                            <div
                              key={i}
                              className={`thumbnail-item rounded-3 overflow-hidden cursor-pointer ${
                                mainImage === img
                                  ? "border-3 border-primary"
                                  : "border border-light"
                              }`}
                              style={{
                                width: "80px",
                                height: "80px",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                              }}
                              onClick={() => setMainImage(img)}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${i + 1}`}
                                className="w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          ))
                      : // Show all available images if no color is selected
                        availableImages.map((img, i) => (
                          <div
                            key={i}
                            className={`thumbnail-item rounded-3 overflow-hidden cursor-pointer ${
                              mainImage === img
                                ? "border-3 border-primary"
                                : "border border-light"
                            }`}
                            style={{
                              width: "80px",
                              height: "80px",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                            onClick={() => setMainImage(img)}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${i + 1}`}
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="col-lg-6">
            <div className="product-info">
              {/* Product Title */}
              <h1 className="display-6 fw-bold text-dark mb-3">
                {product.title}
              </h1>

              {/* Subtitle */}
              {product.sub_title && (
                <p className="text-success fw-semibold fs-5 mb-3">
                  {product.sub_title}
                </p>
              )}

              {/* Rating */}
              <div className="rating-section mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className="bi bi-star-fill text-warning fs-5"
                      ></i>
                    ))}
                  </div>
                  <span className="text-muted">4.5</span>
                  <span className="text-muted">(120 reviews)</span>
                </div>
                <div className="text-success fw-semibold">
                  <i className="bi bi-check-circle me-2"></i>
                  In Stock
                </div>
              </div>

              {/* Price */}
              <div className="price-section mb-4">
                <div className="d-flex align-items-baseline gap-3">
                  <span className="display-5 fw-bold text-primary">
                    ${product.price}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="description-section mb-4">
                <h6 className="fw-semibold mb-2">Description</h6>
                <p
                  className="text-muted lh-base"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Color Selection */}
              <div className="color-section mb-4">
                <h6 className="fw-semibold mb-3">Color</h6>
                <div className="d-flex gap-3 flex-wrap">
                  {product?.color_quantity.map(
                    (colorOption: any, index: number) => {
                      const isAvailable = parseInt(colorOption.quantity) > 0;
                      const isSelected =
                        selectedColor?.label === colorOption.label;
                      const isDisabled = !isAvailable;

                      return (
                        <div key={index} className="text-center">
                          <input
                            type="radio"
                            className="btn-check"
                            name="color"
                            id={colorOption.label}
                            autoComplete="off"
                            checked={isSelected}
                            onChange={() => handleColorSelect(colorOption)}
                            disabled={isDisabled}
                          />
                          <label
                            className={`btn rounded-pill px-4 py-2 ${
                              isSelected
                                ? "btn-primary"
                                : isDisabled
                                ? "btn-secondary disabled"
                                : "btn-outline-secondary"
                            }`}
                            htmlFor={colorOption.label}
                            style={{
                              minWidth: "80px",
                              transition: "all 0.3s ease",
                              opacity: isDisabled ? 0.6 : 1,
                              cursor: isDisabled ? "not-allowed" : "pointer",
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: colorOption.color,
                                  border: "2px solid #fff",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              ></div>
                              <span>{colorOption.label}</span>
                            </div>
                          </label>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="quantity-section mb-4">
                <h6 className="fw-semibold mb-3">Quantity</h6>

                {/* Cart Summary */}
                <div className="cart-summary mb-3">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-2 bg-light rounded">
                        <i className="bi bi-cart-check text-primary me-2"></i>
                        <small className="text-muted">
                          In Cart: <strong>{getCurrentCartQuantity()}</strong>
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-2 bg-light rounded">
                        <i className="bi bi-box text-success me-2"></i>
                        <small className="text-muted">
                          Can Add:{" "}
                          <strong>{getMaxQuantityForThisSession()}</strong>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Cart Quantity Display */}
                {getCurrentCartQuantity() > 0 && (
                  <div className="alert alert-info mb-3" role="alert">
                    <i className="bi bi-cart-check me-2"></i>
                    You currently have{" "}
                    <strong>{getCurrentCartQuantity()}</strong> of this item in
                    your cart
                  </div>
                )}

                <div className="d-flex align-items-center gap-3">
                  <div className="input-group" style={{ width: "150px" }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center border-start-0 border-end-0"
                      value={quantity}
                      min={1}
                      max={getMaxQuantityForThisSession()}
                      onChange={(e) =>
                        handleQuantityChange(Number(e.target.value))
                      }
                      style={{ borderLeft: "none", borderRight: "none" }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        quantity >= getMaxQuantityForThisSession() ||
                        getMaxQuantityForThisSession() === 0
                      }
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <div className="d-flex flex-column">
                    <small className="text-muted">
                      {getMaxQuantityForThisSession()} more can be added
                    </small>
                    <small className="text-muted">
                      Total available: {getMaxQuantity()}
                    </small>
                    {getMaxQuantityForThisSession() === 0 && (
                      <small className="text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Maximum quantity reached
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons mb-4">
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg py-3 fw-semibold"
                    onClick={handleAddToCart}
                    disabled={
                      !selectedColor || getMaxQuantityForThisSession() === 0
                    }
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    {!selectedColor
                      ? "Select Color First"
                      : getCurrentCartQuantity() > 0
                      ? `Add ${quantity} More to Cart`
                      : "Add to Cart"}
                  </button>

                  {/* Show Remove from Cart button if item is already in cart */}
                  {getCurrentCartQuantity() > 0 && (
                    <button
                      className="btn btn-outline-danger btn-lg py-3 fw-semibold"
                      onClick={handleRemoveFromCart}
                      disabled={!selectedColor}
                    >
                      <i className="bi bi-cart-dash me-2"></i>
                      Remove from Cart ({getCurrentCartQuantity()})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="specifications-section mt-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4 text-dark">Specifications</h4>
                  <div className="row g-4">
                    {Object.entries(product.specifications).map(
                      ([key, value], index) => (
                        <div key={index} className="col-md-6">
                          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <span className="fw-semibold text-muted">
                              {key.charAt(0).toUpperCase() +
                                key.slice(1).replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="fw-medium">{String(value)}</span>
                          </div>
                        </div>
                      )
                    )}
                    {product.power && (
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <span className="fw-semibold text-muted">
                            Power Rating
                          </span>
                          <span className="fw-medium">{product.power}W</span>
                        </div>
                      </div>
                    )}
                  </div>
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

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }

        .thumbnail-item:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .main-image-container img:hover {
          transform: scale(1.02);
          transition: transform 0.3s ease;
        }

        .btn-outline-secondary.active {
          background-color: #6c757d;
          border-color: #6c757d;
          color: white;
        }

        .breadcrumb-item + .breadcrumb-item::before {
          content: "›";
          color: #6c757d;
        }

        .disabled {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
