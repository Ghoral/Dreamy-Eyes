import { IProductList } from "@/app/interface/product";
import { supabaseClient } from "@/app/service/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductGrid() {
  const [data, setData] = useState<IProductList[]>([]);
  const fetchProduct = async () => {
    try {
      const res = await supabaseClient.from("lens").select("*");
      setData(res.data ?? []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Premium Eye Lenses
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item: IProductList) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: IProductList }) {
  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const colors = product.color?.split(",") ?? [];
  const images = product.images?.split(",");
  const thumbnail = images[0];

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg max-w-xs mx-auto">
      {/* Product Image - Fixed to properly fill container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={process.env.NEXT_PUBLIC_IMAGE_URL + "/" + thumbnail}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* {product.badge && (
          <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700">
            {product.badge}
          </Badge>
        )} */}
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
        <h2 className="font-semibold text-lg">{product.title}</h2>
        <p className="text-sm text-gray-500 mb-3">{product.sub_title}</p>

        {/* Color options */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Color:</p>
          <div className="flex space-x-2">
            {colors.map((color: any, index: number) => (
              <button
                key={index.toString()}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-all duration-200 ${
                  color === selectedColor
                    ? "ring-2 ring-offset-2 ring-blue-500"
                    : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        {/* <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-100 rounded p-1 text-center text-xs">
            <span className="block text-gray-700">{product.type}</span>
          </div>
          <div className="bg-gray-100 rounded p-1 text-center text-xs">
            <span className="block text-gray-700">{product.waterContent}</span>
          </div>
          <div className="bg-gray-100 rounded p-1 text-center text-xs">
            <span className="block text-gray-700">{product.feature}</span>
          </div>
        </div> */}

        {/* Price */}
        {/* <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm mr-2">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="font-bold text-lg">
              ${product.price.toFixed(2)}
            </span>
          </div>
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercentage}%</Badge>
          )}
        </div> */}
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
