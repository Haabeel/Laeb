import Image from "next/image";
import React, { useState } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import { GoDotFill, GoDot } from "react-icons/go";
const Carousel = ({
  images,
  className,
}: {
  images: { url: string; thumbnailUrl: string }[] | null;
  className?: string;
}) => {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div className={className}>
      <div className="w-full h-full relative flex items-center justify-between">
        <button
          onClick={() => {
            if (!images) return;
            const index = imageIndex - 1;
            if (index < 0) {
              setImageIndex(images.length - 1);
            } else {
              setImageIndex(imageIndex - 1);
            }
          }}
          className="p-[1rem] absolute top-0 bottom-0 left-0 z-10 cursor-pointer text-white rounded-l-lg h-full flex items-center justify-center hover:bg-black/50"
        >
          <GrPrevious className="h-auto w-11 bg-black/50 rounded-full p-3" />
        </button>
        <div className="h-full w-full flex overflow-hidden rounded-lg">
          {images &&
            images.map((image, index) => {
              return (
                <div
                  key={index}
                  className="w-full h-full flex items-center justify-center flex-shrink-0 flex-grow-0 transform duration-500"
                  style={{
                    translate: `${imageIndex * -100}%`,
                    alignSelf: "center",
                  }}
                >
                  <Image
                    src={image.url}
                    alt="carousel"
                    width={1000}
                    height={1000}
                    className="object-cover h-full w-auto aspect-[16/9]"
                  />
                </div>
              );
            })}
        </div>
        <button
          onClick={() => {
            if (!images) return;
            const index = imageIndex + 1;
            if (index >= images.length) {
              setImageIndex(0);
            } else {
              setImageIndex(imageIndex + 1);
            }
          }}
          className="p-[1rem] cursor-pointer absolute top-0 bottom-0 right-0 z-10 rounded-r-lg h-full flex items-center justify-center hover:bg-black/50 text-white"
        >
          <GrNext className="h-auto w-11 bg-black/50 rounded-full p-3" />
        </button>
      </div>
      <div className="flex w-full h-full items-center justify-center gap-3">
        {images?.map((image, index) => (
          <button
            key={index}
            onClick={() => setImageIndex(index)}
            className={`w-4 h-4 rounded-full bg-white cursor-pointer ${
              imageIndex === index ? "opacity-50" : "opacity-25"
            }`}
          >
            {imageIndex === index ? (
              <GoDotFill className="w-full h-full" />
            ) : (
              <GoDot className="w-full h-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
