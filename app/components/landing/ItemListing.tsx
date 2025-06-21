"use client";

import Image from "next/image";
import React, { useState } from "react";

const sections = [
  {
    title: "Featured",
    className: "featured",
    products: [
      {
        title: "Echoes of the Ancients",
        image: "/images/product-item2.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "The Midnight Garden",
        image: "/images/product-item1.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Shadow of the Serpent",
        image: "/images/product-item3.png",
        author: "Lauren Asher",
        price: 870,
      },
    ],
  },
  {
    title: "Latest items",
    className: "latest-items",
    products: [
      {
        title: "Whispering Winds",
        image: "/images/product-item4.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "The Forgotten Realm",
        image: "/images/product-item5.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Moonlit Secrets",
        image: "/images/product-item6.png",
        author: "Lauren Asher",
        price: 870,
      },
    ],
  },
  {
    title: "Best reviewed",
    className: "best-reviewed",
    products: [
      {
        title: "The Crystal Key",
        image: "/images/product-item7.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Windswept Shores",
        image: "/images/product-item8.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Lost Horizons",
        image: "/images/product-item9.png",
        author: "Lauren Asher",
        price: 870,
      },
    ],
  },
  {
    title: "Top sellers",
    className: "top-sellers",
    products: [
      {
        title: "Sunset Dreams",
        image: "/images/product-item10.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Emerald Horizon",
        image: "/images/product-item11.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Crimson Echo",
        image: "/images/product-item12.png",
        author: "Lauren Asher",
        price: 870,
      },
    ],
  },
];

const ItemListing = () => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleItemClick = (
    sectionIndex: any,
    productIndex: any,
    product: any
  ) => {
    console.log("Clicked:", product.title);
    // Click logic here
  };

  return (
    <section
      id="items-listing"
      className="py-5"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {sections.map((section, idx) => (
            <div key={idx} className="col d-flex">
              <div className="card shadow-sm w-100 h-100 border-0 bg-white rounded-4 overflow-hidden">
                <div className="card-body d-flex flex-column">
                  <h5
                    className="card-title mb-4 fw-bold text-danger text-uppercase"
                    style={{ fontSize: "1rem", letterSpacing: "0.5px" }}
                  >
                    {section.title}
                  </h5>

                  <div className="d-flex flex-column gap-2">
                    {section.products.map((product, pIdx) => {
                      const itemId: any = `${idx}-${pIdx}`;
                      const isHovered = hoveredItem === itemId;

                      return (
                        <div
                          key={pIdx}
                          className="d-flex align-items-start gap-3 p-3 rounded-3 position-relative bg-white"
                          style={{
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            transform: isHovered
                              ? "translateY(-2px) scale(1.01)"
                              : "scale(1)",
                            boxShadow: isHovered
                              ? "0 6px 20px rgba(0,0,0,0.1)"
                              : "0 1px 4px rgba(0,0,0,0.05)",
                            border: "1px solid",
                            borderColor: isHovered ? "#dee2e6" : "#f8f9fa",
                          }}
                          onMouseEnter={() => setHoveredItem(itemId)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleItemClick(idx, pIdx, product)}
                        >
                          <div className="position-relative">
                            <Image
                              src={product.image}
                              className="rounded-2"
                              alt={product.title}
                              width={80}
                              height={80}
                              style={{
                                objectFit: "cover",
                                flexShrink: 0,
                                transition: "transform 0.3s ease",
                                transform: isHovered
                                  ? "scale(1.07)"
                                  : "scale(1)",
                                borderRadius: "0.5rem",
                              }}
                            />
                            {isHovered && (
                              <div
                                className="position-absolute top-0 start-0 w-100 h-100 rounded d-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: "rgba(220, 53, 69, 0.1)",
                                  transition: "opacity 0.3s ease",
                                }}
                              >
                                <div
                                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: "24px", height: "24px" }}
                                >
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "rgb(220, 53, 69)",
                                    }}
                                  >
                                    →
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex-grow-1 min-w-0">
                            <h6
                              className="mb-1 fw-semibold lh-sm"
                              style={{
                                fontSize: "0.9rem",
                                color: isHovered
                                  ? "rgb(220, 53, 69)"
                                  : "#212529",
                                transition: "color 0.3s ease",
                              }}
                            >
                              {product.title}
                            </h6>
                            <p
                              className="mb-1 text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              by {product.author}
                            </p>
                            <div className="d-flex align-items-center justify-content-between">
                              <span
                                className="fw-bold"
                                style={{
                                  fontSize: "0.85rem",
                                  color: "rgb(220, 53, 69)",
                                }}
                              >
                                Rs. {product.price}
                              </span>
                              {isHovered && (
                                <span
                                  className="badge bg-light text-dark"
                                  style={{
                                    fontSize: "0.65rem",
                                    transition: "opacity 0.3s ease",
                                  }}
                                >
                                  View Details
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-3">
                    <button
                      className="btn btn-outline-danger btn-sm w-100 rounded-pill"
                      style={{
                        fontSize: "0.8rem",
                        transition: "all 0.3s ease-in-out",
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
                    >
                      View All {section.title}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ItemListing;
