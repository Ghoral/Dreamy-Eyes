import React from "react";

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
  return (
    <section id="best-selling-items" className="position-relative ">
      <div className="container">
        <div className="section-title d-md-flex justify-content-between align-items-center mb-4">
          <h3 className="d-flex align-items-center">Best selling items</h3>
          <a href="index.html" className="btn">
            View All
          </a>
        </div>

        {/* Grid Layout with 4 Cards */}
        <div className="row g-4">
          {products.map((product, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card position-relative p-4 border rounded-3 h-100">
                {/* Discount badge */}
                {product.discount && (
                  <div className="position-absolute top-0 end-0 z-1">
                    <p className="bg-primary py-1 px-3 fs-6 text-white rounded-2 mb-0">
                      {product.discount}
                    </p>
                  </div>
                )}

                {/* Image */}
                <img
                  src={product.image}
                  className="img-fluid shadow-sm"
                  style={{
                    maxHeight: "250px",
                    objectFit: "cover",
                    width: "100%",
                  }}
                  alt={product.title}
                />

                {/* Title */}
                <h6 className="mt-4 mb-0 fw-bold">
                  <a
                    href="index.html"
                    className="text-decoration-none text-dark"
                  >
                    {product.title}
                  </a>
                </h6>

                {/* Author & Rating */}
                <div className="review-content d-flex align-items-center mt-2">
                  <p className="my-2 me-2 fs-6 text-black-50 mb-0">
                    {product.author}
                  </p>
                  <div className="rating text-warning d-flex align-items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="star star-fill"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <use xlinkHref="#star-fill"></use>
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <span className="price text-primary fw-bold mb-2 fs-5">
                  {product.price}
                </span>

                {/* Action buttons (hidden by default) */}
                <div className="card-concern position-absolute start-0 end-0 d-flex justify-content-center gap-2 opacity-0 transition-opacity">
                  <button
                    type="button"
                    className="btn btn-dark"
                    title="Add to cart"
                  >
                    <svg className="cart">
                      <use xlinkHref="#cart"></use>
                    </svg>
                  </button>
                  <a href="#" className="btn btn-dark">
                    <span>
                      <svg className="wishlist">
                        <use xlinkHref="#heart"></use>
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductItems;
