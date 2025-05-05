"use client";

import React from "react";
import { IProductList } from "@/app/interface/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";
import ImageSlider from "./image-slider";

const ProductCard = ({ product }: { product: IProductList }) => {
  const [selectedImages, setSelectedImges] = useState([]);
  const [colors, setColors] = useState<any>([]);

  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const images = product.images?.split(",");
  const thumbnail = images[0];

  useEffect(() => {
    const json = JSON.parse(product.images);
    const selectedColor = Object.keys(json);

    setColors(selectedColor);
    setSelectedColor(selectedColor[0]);
    setSelectedImges(json[selectedColor[0]]);
  }, [product]);

  const onColorSelected = (color: string) => {
    const json = JSON.parse(product.images);

    setSelectedColor(color);
    setSelectedImges(json[color]);
  };
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg max-w-sm mx-auto rounded-2xl border border-gray-200">
      {/* Product Image Slider */}
      <ImageSlider selectedImages={selectedImages} />

      <CardContent className="p-4">
        <h2 className="font-semibold text-xl text-gray-800 truncate">
          {product.title}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{product.sub_title}</p>

        {/* Color Selector */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Color:</p>
          <div className="flex space-x-2">
            {colors.map((color: string, index: number) => (
              <button
                key={index}
                onClick={() => onColorSelected(color)}
                aria-label={`Select ${color}`}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === selectedColor
                    ? "ring-2 ring-offset-2 ring-blue-500"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {/* {hasDiscount && (
              <span className="text-gray-400 line-through text-sm">
                ${product.originalPrice.toFixed(2)}
              </span>
            )} */}
            <span className="font-bold text-lg text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          {/* {hasDiscount && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )} */}
        </div>

        {/* Tags (Optional) */}
        {/* 
    <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 mb-4">
      <span className="bg-gray-100 rounded p-1">{product.type}</span>
      <span className="bg-gray-100 rounded p-1">{product.waterContent}</span>
      <span className="bg-gray-100 rounded p-1">{product.feature}</span>
    </div> 
    */}
      </CardContent>

      {/* Footer Buttons */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1">Add to Cart</Button>
        <Button variant="outline" className="flex-1">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
