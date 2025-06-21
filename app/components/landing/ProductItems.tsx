"use client";

import { getFirstImageUrl } from "@/app/util";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ProductItems = ({ data }: { data: any }) => {
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  const handleProductClick = (product: any) => {
    console.log("Clicked product:", product.title);
    // Add your click handler logic here
  };
  console.log("data", data);

  return (
    <section
      id="best-selling-items"
      className="position-relative"
      style={{
        backgroundColor: "#f8f9fa",
        padding: "32px 0px",
      }}
    >
      <div className="container">
        <div className="section-title d-md-flex justify-content-between align-items-center mb-4">
          <h3 className="d-flex align-items-center">Our Products</h3>
          <a href="index.html" className="btn">
            View All
          </a>
        </div>

        <div className="row g-3">
          {data.map((product: any, index: number) => {
            const isHovered = hoveredItem === index;
            const imageUrl = getFirstImageUrl(product.images);
            console.log(
              "imageUrl",
              `${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`
            );

            return (
              <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <div
                  className="card position-relative p-3 border-0 rounded-3 h-100 bg-white shadow-sm d-flex flex-column"
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
                  onClick={() => handleProductClick(product)}
                >
                  {product.discount && (
                    <div className="position-absolute top-0 end-0 z-3 m-2">
                      <p
                        className="py-1 px-2 fs-6 text-white rounded-2 mb-0"
                        style={{
                          backgroundColor: "rgb(220, 53, 69)",
                          fontSize: "0.7rem",
                          fontWeight: "600",
                        }}
                      >
                        {product.discount}
                      </p>
                    </div>
                  )}

                  <div className="position-relative overflow-hidden rounded-2 mb-2 d-flex justify-content-center align-items-center">
                    <Image
                      src={
                        imageUrl
                          ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`
                          : ""
                      }
                      className="img-fluid"
                      height={120}
                      width={120}
                      style={{
                        objectFit: "contain",
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
                          style={{ width: "40px", height: "40px" }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
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

                  <div className="card-body p-0 flex-grow-1 d-flex flex-column">
                    <h6
                      className="mt-1 mb-2 fw-bold lh-sm"
                      style={{
                        color: isHovered ? "rgb(220, 53, 69)" : "#212529",
                        transition: "color 0.2s ease-in-out",
                        fontSize: "0.9rem",
                      }}
                    >
                      {product.title}
                    </h6>

                    {/* Author & Rating */}
                    <div className="review-content d-flex align-items-center justify-content-between mb-2">
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        by {product.author}
                      </p>
                      <div className="rating text-warning d-flex align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "12px",
                              color: "#ffc107",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      <span
                        className="price fw-bold"
                        style={{
                          color: "rgb(220, 53, 69)",
                          fontSize: "1rem",
                        }}
                      >
                        {product.price}
                      </span>
                    </div>

                    {/* Side by side buttons - Always visible */}
                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-outline-danger btn-sm flex-fill"
                        style={{
                          fontSize: "0.75rem",
                          transition: "all 0.2s ease-in-out",
                          padding: "6px 8px",
                        }}
                        onMouseEnter={(e: any) => {
                          e.target.style.backgroundColor = "rgb(220, 53, 69)";
                          e.target.style.borderColor = "rgb(220, 53, 69)";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e: any) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.borderColor = "rgb(220, 53, 69)";
                          e.target.style.color = "rgb(220, 53, 69)";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Add to cart:", product.title);
                        }}
                      >
                        🛒 Cart
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm flex-fill"
                        style={{
                          fontSize: "0.75rem",
                          transition: "all 0.2s ease-in-out",
                          padding: "6px 8px",
                        }}
                        onMouseEnter={(e: any) => {
                          e.target.style.backgroundColor = "rgb(220, 53, 69)";
                          e.target.style.borderColor = "rgb(220, 53, 69)";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e: any) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.borderColor = "rgb(220, 53, 69)";
                          e.target.style.color = "rgb(220, 53, 69)";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Add to wishlist:", product.title);
                        }}
                      >
                        ❤️ Wishlist
                      </button>
                    </div>
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
