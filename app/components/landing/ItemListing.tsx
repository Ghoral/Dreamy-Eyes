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
    <section id="items-listing" className="py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          {sections.map((section, idx) => (
            <div key={idx} className="col-sm-6 col-lg-3 d-flex">
              <div className="card shadow-sm w-100 h-100 border-0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-4 text-primary">
                    {section.title}
                  </h5>
                  <div className="d-flex flex-column gap-3">
                    {section.products.map((product, pIdx) => (
                      <div
                        key={pIdx}
                        className="d-flex align-items-start gap-2"
                      >
                        <img
                          src={product.image}
                          className="rounded"
                          alt={product.title}
                          style={{
                            width: "48px",
                            height: "64px",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-dark fw-semibold fs-6">
                            {product.title}
                          </h6>
                          <p className="mb-0 text-muted small">
                            {product.author}
                          </p>
                          <span className="text-danger fw-bold small">
                            Rs. {product.price}
                          </span>
                        </div>
                      </div>
                    ))}
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
