import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface HeroSectionProps {
  children?: React.ReactNode;
  overlay?: boolean;
}

const StaticBG: React.FC<HeroSectionProps> = ({ children, overlay }) => {
  return (
    <section className="bg-background relative h-fit w-full overflow-hidden">
      {/* Background spotlight */}
      <div className="relative flex justify-between">
        <div className="absolute top-0 -left-40 z-5">
          <Image
            src="/spotlight.svg"
            alt="Spotlight Left"
            height={720}
            width={720}
            objectFit="cover"
            className="pointer-events-none dark:opacity-35"
            priority
          />
        </div>
        <div className="absolute top-0 -right-40 z-5 hidden md:block">
          <Image
            src="/spotlight.svg"
            alt="Spotlight Right"
            height={720}
            width={720}
            objectFit="cover"
            className="transfform pointer-events-none -scale-x-100 dark:opacity-35"
            priority
          />
        </div>
      </div>

      {/* Grid background */}
      <div
        className={cn(
          "absolute inset-0 -z-0",
          "[background-size:80px_80px]",
          "[background-image:linear-gradient(to_right,#d4d4d8_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d8_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      <div className="bg-background pointer-events-none absolute inset-0 z-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_10%,white_80%)] dark:bg-zinc-900"></div>

      {/* Content */}
      {overlay ? 
      <div className="relative z-10 mt-16 flex items-center justify-center">
        <div className="w-full max-w-7xl">{children}</div>
      </div>
      : 
      <div className="relative z-10 mt-16 flex h-[20rem] items-center justify-center">
        <div className="w-full max-w-7xl">{children}</div>
      </div>}
    </section>
  );
};

export default StaticBG;
