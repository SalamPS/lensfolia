import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface HeroSectionProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const StaticBG: React.FC<HeroSectionProps> = ({
  title,
  description,
  children,
}) => {
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
      <div className="relative z-10 mt-16 flex h-[20rem] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 px-4">
          {title && (
            <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground max-w-2xl text-center text-sm text-pretty">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};

export default StaticBG;
