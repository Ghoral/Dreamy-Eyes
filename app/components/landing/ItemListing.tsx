const sections = [
  {
    title: "Featured",
    className: "featured",
    products: [
      {
        title: "Echoes of the Ancients",
        image: "images/product-item2.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "The Midnight Garden",
        image: "images/product-item1.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Shadow of the Serpent",
        image: "images/product-item3.png",
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
        image: "images/product-item4.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "The Forgotten Realm",
        image: "images/product-item5.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Moonlit Secrets",
        image: "images/product-item6.png",
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
        image: "images/product-item7.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Windswept Shores",
        image: "images/product-item8.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Lost Horizons",
        image: "images/product-item9.png",
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
        image: "images/product-item10.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Emerald Horizon",
        image: "images/product-item11.png",
        author: "Lauren Asher",
        price: 870,
      },
      {
        title: "Crimson Echo",
        image: "images/product-item12.png",
        author: "Lauren Asher",
        price: 870,
      },
    ],
  },
];

const ItemListing = () => {
  return (
    <section id="items-listing" className="padding-large">
      <div className="container">
        <div className="row">
          {sections.map((section, idx) => (
            <div key={idx} className="col-md-6 mb-4 mb-lg-0 col-lg-3">
              <div className={`${section.className} border rounded-3 p-4`}>
                <div className="section-title overflow-hidden mb-5 mt-2">
                  <h3 className="d-flex flex-column mb-0">{section.title}</h3>
                </div>
                <div className="items-lists">
                  {section.products.map((product, pIdx) => (
                    <div key={pIdx}>
                      <div className="item d-flex">
                        <img
                          src={product.image}
                          className="img-fluid shadow-sm"
                          style={{ objectFit: "contain" }}
                          alt={product.title}
                        />
                        <div className="item-content ms-3">
                          <h6 className="mb-0 fw-bold">{product.title}</h6>
                          <div className="review-content d-flex">
                            <p className="my-2 me-2 fs-6 text-black-50">
                              {product.author}
                            </p>
                            <div className="rating text-warning d-flex align-items-center">
                              {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <svg key={i} className="star star-fill">
                                    <use xlinkHref="#star-fill"></use>
                                  </svg>
                                ))}
                            </div>
                          </div>
                          <span
                            className="price fw-bold mb-2 fs-5"
                            style={{ color: "rgb(248, 109, 114)" }}
                          >
                            Rs. {product.price}
                          </span>
                        </div>
                      </div>
                      {pIdx < section.products.length - 1 && (
                        <hr className={pIdx % 2 === 0 ? "gray-400" : ""} />
                      )}
                    </div>
                  ))}
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
