"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import Toast from "../components/ui/Toast";

const ProductDetail = ({ product }: { product: any }) => {
  const images = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
    "https://images.unsplash.com/photo-1528148343865-51218c4a13e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.0.3&q=80&w=1080",
  ];

  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState(
    product?.color_quantity?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedColor) {
      setShowToast(true);
      return;
    }

    addItem({
      id: product.id || product.title,
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: quantity,
      color: selectedColor.label,
      colorHex: selectedColor.color,
      image: mainImage,
      maxQuantity: parseInt(selectedColor.quantity), // Add maximum quantity limit
    });
    setShowToast(true);
  };

  const handleColorSelect = (colorOption: any) => {
    setSelectedColor(colorOption);
    setQuantity(1); // Reset quantity when color changes
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedColor) {
      const maxQuantity = parseInt(selectedColor.quantity);
      setQuantity(Math.min(Math.max(1, newQuantity), maxQuantity));
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
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="thumbnail-container">
                <div className="d-flex gap-3 justify-content-center">
                  {images.map((img, i) => (
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
                      max={getMaxQuantity()}
                      onChange={(e) =>
                        handleQuantityChange(Number(e.target.value))
                      }
                      style={{ borderLeft: "none", borderRight: "none" }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= getMaxQuantity()}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <small className="text-muted">
                    {getMaxQuantity()} available
                  </small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons mb-4">
                <div className="d-grid">
                  <button
                    className="btn btn-primary btn-lg py-3 fw-semibold"
                    onClick={handleAddToCart}
                    disabled={!selectedColor || getMaxQuantity() === 0}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    {!selectedColor ? "Select Color First" : "Add to Cart"}
                  </button>
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
            : `${product.title} added to cart!`
        }
        type={!selectedColor ? "error" : "success"}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
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
