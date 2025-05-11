"use client";

import React, { useEffect, useState } from "react";
import { IProductList } from "@/app/interface/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ImageSlider from "./image-slider";
import { Separator } from "@/components/ui/separator";

const ProductCard = ({ product }: { product: IProductList }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [colors, setColors] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const json = JSON.parse(product.images);
    const selectedColor = Object.keys(json);

    setColors(selectedColor);
    setSelectedColor(selectedColor[0]);
    setSelectedImages(json[selectedColor[0]]);
  }, [product]);

  const onColorSelected = (color: string) => {
    const json = JSON.parse(product.images);
    setSelectedColor(color);
    setSelectedImages(json[color]);
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md max-w-xs mx-auto rounded-lg border border-gray-200">
      <div className="h-48 overflow-hidden">
        <ImageSlider selectedImages={selectedImages} />
      </div>
      <Separator />
      <CardContent className="p-3">
        <h2 className="font-medium text-base text-gray-800 truncate">
          {product.title}
        </h2>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
          {product.sub_title}
        </p>

        <div className="flex items-center mb-2 gap-2">
          <p className="text-xs text-gray-500">Color:</p>
          <div className="flex space-x-1">
            {colors.map((color: string, index: number) => (
              <button
                key={index}
                onClick={() => onColorSelected(color)}
                aria-label={`Select ${color}`}
                className={`w-4 h-4 rounded-full border ${
                  color === selectedColor
                    ? "ring-1 ring-offset-1 ring-blue-500"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="ml-auto">
            <span className="font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button size="sm" className="flex-1 text-xs py-1">
          Add to Cart
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs py-1">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
