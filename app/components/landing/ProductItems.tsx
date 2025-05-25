import React, { useState } from "react";

const products = [
  {
    title: "House of Sky Breath",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item1.png",
    discount: "10% off",
  },
  {
    title: "Heartland Stars",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item2.png",
  },
  {
    title: "Heavenly Bodies",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item3.png",
  },
  {
    title: "His Saving Grace",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item4.png",
    discount: "10% off",
  },
  {
    title: "House of Sky Breath",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item1.png",
    discount: "10% off",
  },
  {
    title: "Heartland Stars",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item2.png",
  },
  {
    title: "Heavenly Bodies",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item3.png",
  },
  {
    title: "His Saving Grace",
    author: "Lauren Asher",
    price: "$870",
    image: "images/product-item4.png",
    discount: "10% off",
  },
];

const ProductItems = () => {
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  const handleProductClick = (product: any, index: number) => {
    console.log("Clicked product:", product.title);
    // Add your click handler logic here
  };

  return (
    <section
      id="best-selling-items"
      className="position-relative py-5"
      style={{
        marginTop: 48,
        backgroundColor: "#f8f9fa",
      }}
    >
      <div className="container">
        <div className="section-title d-md-flex justify-content-between align-items-center mb-4">
          <h3 className="d-flex align-items-center">Our Products</h3>
          <a href="index.html" className="btn">
            View All
          </a>
        </div>

        <div className="row g-4">
          {products.map((product, index: number) => {
            const isHovered = hoveredItem === index;

            return (
              <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div
                  className="card position-relative p-4 border-0 rounded-3 h-100 bg-white shadow-sm"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                    boxShadow: isHovered
                      ? "0 12px 24px rgba(0,0,0,0.15)"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleProductClick(product, index)}
                >
                  {product.discount && (
                    <div className="position-absolute top-0 end-0 z-3 m-3">
                      <p
                        className="py-1 px-3 fs-6 text-white rounded-2 mb-0"
                        style={{
                          backgroundColor: "rgb(220, 53, 69)",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {product.discount}
                      </p>
                    </div>
                  )}

                  <div className="position-relative overflow-hidden rounded-2 mb-3">
                    <img
                      src={product.image}
                      className="img-fluid"
                      style={{
                        height: "180px",
                        objectFit: "contain",
                        width: "100%",
                        transition: "transform 0.3s ease-in-out",
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                      }}
                      alt={product.title}
                    />

                    {/* Hover overlay */}
                    {isHovered && (
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(220, 53, 69, 0.1)",
                          transition: "opacity 0.3s ease-in-out",
                        }}
                      >
                        <div
                          className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow"
                          style={{ width: "48px", height: "48px" }}
                        >
                          <span
                            style={{
                              fontSize: "18px",
                              color: "rgb(220, 53, 69)",
                              fontWeight: "bold",
                            }}
                          >
                            →
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-body p-0">
                    <h6
                      className="mt-2 mb-2 fw-bold lh-sm"
                      style={{
                        color: isHovered ? "rgb(220, 53, 69)" : "#212529",
                        transition: "color 0.2s ease-in-out",
                        fontSize: "1rem",
                      }}
                    >
                      {product.title}
                    </h6>

                    {/* Author & Rating */}
                    <div className="review-content d-flex align-items-center justify-content-between mb-2">
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        by {product.author}
                      </p>
                      <div className="rating text-warning d-flex align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "14px",
                              color: "#ffc107",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="d-flex align-items-center justify-content-between">
                      <span
                        className="price fw-bold fs-5"
                        style={{ color: "rgb(220, 53, 69)" }}
                      >
                        {product.price}
                      </span>

                      {isHovered && (
                        <span
                          className="badge bg-light text-dark"
                          style={{
                            fontSize: "0.7rem",
                            transition: "all 0.2s ease-in-out",
                            animation: "fadeIn 0.3s ease-in-out",
                          }}
                        >
                          Quick View
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons with enhanced hover effect */}
                  <div
                    className="card-concern position-absolute start-0 end-0 d-flex justify-content-center gap-2 p-3"
                    style={{
                      bottom: "20px",
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered
                        ? "translateY(0)"
                        : "translateY(10px)",
                      transition: "all 0.3s ease-in-out",
                      pointerEvents: isHovered ? "auto" : "none",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm shadow-sm"
                      title="Add to cart"
                      style={{
                        backgroundColor: "rgb(220, 53, 69)",
                        borderColor: "rgb(220, 53, 69)",
                        color: "white",
                        padding: "8px 12px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Add to cart:", product.title);
                      }}
                    >
                      🛒
                    </button>
                    <button
                      className="btn btn-sm bg-white shadow-sm"
                      title="Add to wishlist"
                      style={{
                        color: "rgb(220, 53, 69)",
                        border: "1px solid #e9ecef",
                        padding: "8px 12px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Add to wishlist:", product.title);
                      }}
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default ProductItems;
