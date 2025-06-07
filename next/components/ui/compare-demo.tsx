import React from "react";
import { Compare } from "./compare";

export function CompareDemo() {
  return (
    <div className="flex h-[60vh] w-3/4 items-center justify-center px-1 [perspective:800px] [transform-style:preserve-3d] md:px-8">
      <div
        style={{
          transform: "rotateX(15deg) translateZ(80px)",
        }}
        className="mx-auto h-1/2 w-full rounded-4xl border border-teal-300 bg-teal-200 p-2 md:h-3/4 md:p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <Compare
          firstImage="/hero-image-0.jpg"
          secondImage="/hero-image.webp"
          firstImageClassName="object-cover object-center-top w-full"
          secondImageClassname="object-cover object-center-top w-full"
          className="h-full w-full rounded-[22px] md:rounded-lg"
          slideMode="drag"
          autoplay={false}
        />
      </div>
    </div>
  );
}
