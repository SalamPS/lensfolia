import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CompareDemo } from "../ui/compare-demo";
import { Spotlight } from "../ui/spotlight";

const Hero = () => {
  return (
    <>
      <section>
        <div className="bg-background flex h-fit w-full items-center justify-center">
          <div className="bg-background relative flex h-[50rem] w-full items-center justify-center overflow-hidden">
            <Spotlight
              gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(180, 100%, 85%, 0.12) 0%, hsla(180, 100%, 55%, 0.08) 50%, hsla(180, 100%, 45%, 0) 80%)"
              gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(200, 100%, 85%, 0.1) 0%, hsla(200, 100%, 55%, 0.06) 80%, transparent 100%)"
              gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(150, 100%, 85%, 0.08) 0%, hsla(150, 100%, 45%, 0.04) 80%, transparent 100%)"
              translateY={-320}
              duration={8}
              xOffset={80}
            />
            <div
              className={cn(
                "absolute inset-0",
                "[background-size:80px_80px]",
                "[background-image:linear-gradient(to_right,#d4d4d8_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d8_1px,transparent_1px)]",
                "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
              )}
            />

            {/* Radial gradient for the container to give a faded look */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-50 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,white_80%)] dark:bg-zinc-900"></div>

            {/* container */}
            <div className="z-20 flex h-full max-w-4xl flex-col items-center justify-center gap-6 px-6 pt-32 md:gap-8 md:px-8">
              {/* badge */}
              <div className="bg-card inset-shadow-foreground/5 border-border shadow-foreground/10 flex items-center justify-center gap-2 rounded-full border px-4 py-2 shadow-lg inset-shadow-sm">
                <Image
                  src="/sparkle.svg"
                  alt="sparkle-icon"
                  width={16}
                  height={16}
                  className="invert dark:invert-0"
                />
                <p className="text-xs font-semibold text-zinc-500 md:text-sm dark:text-zinc-50">
                  Deep Learning
                </p>
              </div>

              {/* Main title and desc*/}
              <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
                <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-xl font-bold text-wrap text-transparent md:text-3xl dark:from-zinc-50 dark:to-zinc-400">
                  Deteksi Penyakit Tanaman Melalui Daun dalam Sekejap dengan AI!
                </h1>
                <p className="text-muted-foreground max-w-2xl text-center text-sm text-pretty">
                  Gunakan teknologi kecerdasan buatan untuk menganalisis kondisi
                  daun tanaman Anda—cepat, akurat, dan mudah digunakan oleh
                  siapa saja.
                </p>
              </div>

              {/* Button CTA */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="default"
                  className="shadow-lg inset-shadow-sm inset-shadow-white/50"
                >
                  Coba Sekarang
                </Button>
                <Button
                  variant="secondary"
                  className="shadow-lg inset-shadow-sm inset-shadow-white/50"
                >
                  Pelajari Lebih
                </Button>
              </div>

              {/* Compare */}
              <CompareDemo />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
