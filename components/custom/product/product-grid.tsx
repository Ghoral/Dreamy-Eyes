import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function ProductGrid() {
  // Sample product data
  const products = [
    {
      id: 1,
      name: "Sapphire Blue Monthly",
      description: "Premium comfort, vibrant color",
      price: 24.99,
      originalPrice: 29.99,
      badge: "BEST SELLER",
      image: "/images/lens1.png",
      type: "Monthly",
      waterContent: "42%",
      feature: "UV Protection",
      colors: [
        { name: "Deep Blue", hex: "#1e3799" },
        { name: "Sky Blue", hex: "#6a89cc" },
        { name: "Royal Blue", hex: "#4a69bd" },
      ],
    },
    {
      id: 2,
      name: "Natural Hazel Daily",
      description: "Single-use, breathable material",
      price: 19.99,
      badge: null,
      image: "/images/lens1.png",
      type: "Daily",
      waterContent: "58%",
      feature: "High Oxygen",
      colors: [
        { name: "Brown", hex: "#78281f" },
        { name: "Hazel", hex: "#b03a2e" },
        { name: "Amber", hex: "#e74c3c" },
      ],
    },
    {
      id: 3,
      name: "Platinum Gray HD",
      description: "Enhanced clarity, 3-month durability",
      price: 39.99,
      originalPrice: 49.99,
      badge: "NEW",
      image: "/images/lens1.png",
      type: "Quarterly",
      waterContent: "45%",
      feature: "Anti-Glare",
      colors: [
        { name: "Charcoal", hex: "#2c3e50" },
        { name: "Silver", hex: "#7f8c8d" },
        { name: "Light Gray", hex: "#bdc3c7" },
      ],
    },
    {
      id: 4,
      name: "Emerald Green Weekly",
      description: "Silicone hydrogel, vibrant color",
      price: 22.99,
      badge: null,
      image: "/images/lens1.png",
      type: "Weekly",
      waterContent: "55%",
      feature: "Astigmatism",
      colors: [
        { name: "Forest", hex: "#145a32" },
        { name: "Emerald", hex: "#27ae60" },
        { name: "Mint", hex: "#2ecc71" },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Premium Eye Lenses
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: any) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg max-w-xs mx-auto">
      {/* Product Image - Fixed to properly fill container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {product.badge && (
          <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700">
            {product.badge}
          </Badge>
        )}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-colors hover:bg-white"
        >
          <Heart
            size={18}
            className={
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }
          />
        </button>
      </div>

      <CardContent className="p-4">
        <h2 className="font-semibold text-lg">{product.name}</h2>
        <p className="text-sm text-gray-500 mb-3">{product.description}</p>

        {/* Color options */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">
            Color: {selectedColor.name}
          </p>
          <div className="flex space-x-2">
            {product.colors.map((color: any) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-all duration-200 ${
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

        {/* Product Details */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-100 rounded p-1 text-center text-xs">
            <span className="block text-gray-700">{product.type}</span>
          </div>
          <div className="bg-gray-100 rounded p-1 text-center text-xs">
            <span className="block text-gray-700">{product.waterContent}</span>
          </div>
          <div className="bg-gray-100 rounded p-1 text-center text-xs">
            <span className="block text-gray-700">{product.feature}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm mr-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-bold text-lg">
              ${product.price.toFixed(2)}
            </span>
          </div>
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercentage}%</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1">Add to Cart</Button>
        <Button variant="outline" className="flex-1">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}
