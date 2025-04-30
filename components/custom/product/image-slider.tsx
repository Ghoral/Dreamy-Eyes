"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageSlider({ selectedImages = [], product }: any) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="relative h-48 overflow-hidden rounded-md">
      <Carousel className="h-full w-full">
        <CarouselContent className="h-full">
          {selectedImages.map((image: any, index: any) => (
            <CarouselItem key={index} className="relative h-full w-full">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${image}`}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-1 top-1/2 -translate-y-1/2" />
      </Carousel>

      {/* Favorite button */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-colors hover:bg-white"
      >
        <Heart
          size={18}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}
        />
      </button>

      {/* Optional product badge */}
      {/* {product?.badge && (
        <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700">
          {product.badge}
        </Badge>
      )} */}
    </div>
  );
}
