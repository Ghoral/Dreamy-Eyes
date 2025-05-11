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
    <Carousel className="h-full w-full" style={{ width: 250 }}>
      <CarouselContent className="h-full">
        {selectedImages.map((image: any, index: any) => (
          <CarouselItem key={index} className="relative h-full w-full">
            <img
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/lens-images/${image}`}
              alt={`Product image ${index + 1}`}
              className="w-full max-h-48 object-contain mx-auto"
              style={{ height: 170, width: 170 }}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-1 top-1/2 -translate-y-1/2" />
      <CarouselNext className="right-1 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
