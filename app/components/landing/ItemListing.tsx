"use client";

import Link from "next/link";
import Image from "next/image";

const ItemListing = () => {
  const sections = [
    {
      id: 1,
      title: "Latest Arrivals",
      subtitle: "Fresh new styles just in",
      image: "/images/logo.png", // Placeholder - replace with your fashion lens image
      category: "New",
      description:
        "Discover the newest fashion lens collections that just arrived",
      price: "$29.99",
    },
    {
      id: 2,
      title: "Best Sellers",
      subtitle: "Most loved by our customers",
      image: "/images/logo.png", // Placeholder - replace with your fashion lens image
      category: "Popular",
      description:
        "Our top-rated lenses that customers can't stop raving about",
      price: "$34.99",
    },
    {
      id: 3,
      title: "Top Reviews",
      subtitle: "Highest rated products",
      image: "/images/logo.png", // Placeholder - replace with your fashion lens image
      category: "Rated",
      description: "Lenses with the best customer reviews and ratings",
      price: "$39.99",
    },
    {
      id: 4,
      title: "Featured Collections",
      subtitle: "Curated for you",
      image: "/images/logo.png", // Placeholder - replace with your fashion lens image
      category: "Featured",
      description: "Handpicked collections that showcase the latest trends",
      price: "$44.99",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-secondary-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Collections
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary-800 mb-6">
            Explore Our Fashion Lens Collections
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            From the latest trends to customer favorites, discover the perfect
            lenses to express your unique style
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {sections.map((section) => (
            <div
              key={section.id}
              className="group bg-white rounded-3xl shadow-soft hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-secondary-100 overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white">
                    {section.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                  {section.title}
                </h3>
                <p className="text-secondary-600 text-sm mb-3">
                  {section.subtitle}
                </p>
                <p className="text-secondary-500 text-sm mb-4 line-clamp-2">
                  {section.description}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {section.price}
                  </span>
                </div>

                {/* Action Button */}
                <Link
                  href="/shop"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Look?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of fashion-forward customers who trust us for their
              style needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Shop All Lenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItemListing;
