// pages/product/[id].tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  Star,
  ShoppingCart,
  Share2,
  Plus,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams, useRouter } from "next/navigation";

// This would come from your actual data source
const getProductById = (id: string) => {
  const products = [
    {
      id: "1",
      name: "Sapphire Blue Monthly",
      description:
        "Premium comfort contacts with vibrant blue color enhancement for all eye types. These monthly lenses offer superior breathability and moisture retention for all-day comfort.",
      price: 24.99,
      originalPrice: 29.99,
      badge: "BEST SELLER",
      image: "/images/lens1.png",
      images: [
        "/images/lens1.png",
        "/images/lens2.png",
        "/images/lens1.png",
        "/images/lens2.png",
      ],
      type: "Monthly",
      waterContent: "42%",
      feature: "UV Protection",
      colors: [
        { name: "Deep Blue", hex: "#1e3799" },
        { name: "Sky Blue", hex: "#6a89cc" },
        { name: "Royal Blue", hex: "#4a69bd" },
      ],
      powers: ["-1.00", "-1.50", "-2.00", "-2.50", "-3.00", "-3.50", "-4.00"],
      baseCurve: "8.6mm",
      diameter: "14.2mm",
      material: "Silicone Hydrogel",
      packSize: "6 lenses per box",
      manufacturer: "OptiVision",
      rating: 4.8,
      reviewCount: 124,
      stock: 24,
      specifications: [
        { name: "Replacement Schedule", value: "Monthly" },
        { name: "Water Content", value: "42%" },
        { name: "Material", value: "Silicone Hydrogel" },
        { name: "Oxygen Permeability (Dk/t)", value: "140" },
        { name: "Base Curve", value: "8.6mm" },
        { name: "Diameter", value: "14.2mm" },
        { name: "UV Protection", value: "Class 1 (blocks >90%)" },
        { name: "Handling Tint", value: "Light Blue" },
        { name: "Pack Size", value: "6 lenses per box" },
      ],
      features: [
        "High oxygen transmissibility for healthy eyes",
        "Smooth lens surface resistant to deposits",
        "Maintains 95% of moisture for up to 16 hours",
        "Enhanced visual clarity in low light conditions",
        "Digital screen compatible to reduce eye strain",
      ],
    },
  ];

  return products.find((p) => p.id === id);
};

export default function ProductDetail() {
  const params = useParams();
  const productId = params?.id as string;

  const router = useRouter();
  const product = getProductById(productId);

  // Handle case where product isn't found or page is still loading
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Loading product details...
          </h1>
          <p>If nothing appears soon, the product may not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetailView product={product} />;
}

function ProductDetailView({ product }: { product: any }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedPower, setSelectedPower] = useState(product.powers[0]);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Eye Lenses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-semibold">
                {product.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => history.back()}
          className="gap-1"
        >
          <ChevronLeft size={16} />
          Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Images */}
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4 border">
            <img
              src={"/images/lens1.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setMainImage(img)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition ${
                  mainImage === img
                    ? "border-blue-500"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <Heart
                size={20}
                className={
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                }
              />
            </button>
          </div>

          {/* Ratings */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center mb-6">
            {hasDiscount && (
              <span className="text-gray-400 line-through text-lg mr-3">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-bold text-2xl text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <Badge variant="destructive" className="ml-3">
                Save {discountPercentage}%
              </Badge>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Product Specs Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="block text-sm font-medium mb-1">Type</span>
              <span className="block text-gray-700">{product.type}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="block text-sm font-medium mb-1">Water</span>
              <span className="block text-gray-700">
                {product.waterContent}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="block text-sm font-medium mb-1">Feature</span>
              <span className="block text-gray-700">{product.feature}</span>
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Color: {selectedColor.name}
            </label>
            <div className="flex space-x-3">
              {product.colors.map((color: any) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    selectedColor.hex === color.hex
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Power Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Power</label>
            <div className="flex flex-wrap gap-2">
              {product.powers.map((power: string) => (
                <button
                  key={power}
                  onClick={() => setSelectedPower(power)}
                  className={`px-3 py-2 rounded-md text-sm transition ${
                    selectedPower === power
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {power}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center max-w-[140px]">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-r-none"
              >
                <Minus size={16} />
              </Button>
              <div className="h-10 flex items-center justify-center border-y px-4 w-20">
                {quantity}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                className="h-10 w-10 rounded-l-none"
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {product.stock} boxes available
            </p>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3 mb-6">
            <Button className="flex-1 gap-2">
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 size={18} />
              Share
            </Button>
          </div>

          {/* Key Details */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-3">Key Details</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium">{product.manufacturer}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-gray-600">Base Curve:</span>
                <span className="font-medium">{product.baseCurve}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-gray-600">Diameter:</span>
                <span className="font-medium">{product.diameter}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium">{product.material}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-gray-600">Pack Size:</span>
                <span className="font-medium">{product.packSize}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs for Additional Information */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full border-b justify-start rounded-none mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-0">
            <div className="space-y-4">
              <p className="text-gray-700">
                {product.description} Our premium monthly contact lenses are
                designed to provide exceptional comfort and vision clarity
                throughout the day. The advanced silicone hydrogel material
                ensures your eyes stay hydrated and healthy, while the vibrant
                color enhancement adds a natural-looking tint to your eyes.
              </p>

              <h3 className="text-lg font-medium mt-6 mb-3">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.features.map((feature: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">How To Use</h3>
                <p className="text-gray-700 mb-3">
                  For optimal comfort and eye health, follow these guidelines:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>
                    Always wash and dry your hands thoroughly before handling
                    lenses
                  </li>
                  <li>Store lenses in fresh solution every night</li>
                  <li>
                    Never sleep with your contact lenses unless specifically
                    designed for extended wear
                  </li>
                  <li>
                    Replace lenses according to the recommended schedule, even
                    if they feel comfortable
                  </li>
                  <li>
                    Visit your eye care professional regularly for check-ups
                  </li>
                </ol>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-0">
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {product.specifications.map((spec: any, i: number) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                        {spec.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <div className="text-4xl font-bold">{product.rating}</div>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {product.reviewCount} reviews
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    // Simulate different distribution of ratings
                    const percentage =
                      rating === 5
                        ? 68
                        : rating === 4
                        ? 22
                        : rating === 3
                        ? 7
                        : rating === 2
                        ? 2
                        : 1;
                    return (
                      <div key={rating} className="flex items-center">
                        <div className="w-8 text-sm text-gray-600">
                          {rating}★
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-sm text-gray-600">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ml-4">
                <Button>Write a Review</Button>
              </div>
            </div>

            {/* Sample reviews */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">2 weeks ago</div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < 5
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <h4 className="font-medium mb-2">
                    Amazing comfort and color!
                  </h4>
                  <p className="text-gray-700">
                    I've tried many different colored contacts before, but these
                    are by far the most comfortable. The blue color looks
                    natural and I can wear them all day without any irritation.
                    Highly recommend!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Michael Chen</div>
                    <div className="text-sm text-gray-500">1 month ago</div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < 4
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <h4 className="font-medium mb-2">
                    Great quality for the price
                  </h4>
                  <p className="text-gray-700">
                    These lenses are very good quality for the price. The color
                    is vibrant yet looks natural. I only gave 4 stars because
                    they tend to dry out a bit faster than expected, but overall
                    I'm satisfied with my purchase.
                  </p>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full">
                Load More Reviews
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Here you would map through related products and render ProductCard components */}
          {/* This is just placeholder content */}
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Related Product 1</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Related Product 2</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Related Product 3</p>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Related Product 4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
