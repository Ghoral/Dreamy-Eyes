import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TikTokEmbed } from "react-social-media-embed";

export function MultiCarousel() {
  const [data, setData] = React.useState([
    "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    "https://www.tiktok.com/@scout2015/video/6718335390845095173",
  ]);

  return (
    <div className="px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 pl-2 text-center md:text-left">
        Watch Our TikToks
      </h2>
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {data.map((_, index) => (
            <CarouselItem
              key={index}
              className="w-full sm:basis-full md:basis-1/2 lg:basis-1/3 flex justify-center"
            >
              <TikTokEmbed
                url="https://www.tiktok.com/@scout2015/video/6718335390845095173"
                width="100%"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="rounded-full bg-white shadow-lg border-0 text-black left-2 w-10 h-10" />
        <CarouselNext className="rounded-full bg-white shadow-lg border-0 text-black right-2 w-10 h-10" />
      </Carousel>
    </div>
  );
}
