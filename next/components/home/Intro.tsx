import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { IconBrain, IconLeaf } from "@tabler/icons-react";

const Intro = () => {
  // Data untuk card
  const cards = [
    {
      icon: <IconLeaf size={24} className="text-primary" />,
      title: "Pentingnya Kesehatan Daun bagi Tanaman",
      description:
        "Kesehatan daun mencerminkan kondisi tanaman secara keseluruhan. Dengan deteksi dini, Anda dapat mencegah kerusakan dan meningkatkan hasil panen.",
    },
    {
      icon: <IconBrain size={24} className="text-primary" />,
      title: "Solusi AI untuk Diagnosis Penyakit Daun",
      description:
        "Kami menghadirkan solusi AI yang menganalisis gambar daun secara otomatis. Teknologi ini mengenali penyakit dan memberikan rekomendasi perawatan yang tepat.",
    },
  ];

  // Data untuk statistik
  const stats = [
    { value: "99.9%", label: "Tingkat akurasi*" },
    { value: "~2.2s", label: "Hasil cepat*" },
    { value: "999+", label: "Jenis penyakit*" },
  ];

  return (
    <section>
      <div className="bg-backkround flex h-full w-full items-center justify-center">
        <div className="relative flex w-full items-center justify-center px-4">
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:20px_20px]",
              "[background-image:radial-gradient(#d4d4d8_1px,transparent_1px)]",
              "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
            )}
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-50 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,white_70%)] dark:bg-zinc-900" />

          {/* Content */}
          <div className="z-20 flex w-full flex-col items-center gap-4 py-12 md:gap-6">
            {/* Badge */}
            <div className="bg-card border-border flex items-center justify-center gap-2 rounded-full border px-4 py-2 shadow-sm">
              <Image
                src="/sparkle.svg"
                alt="sparkle-icon"
                width={16}
                height={16}
                className="invert dark:invert-0"
              />
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-50">
                Intro
              </p>
            </div>

            {/* Title */}
            <h1 className="max-w-4xl bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-2xl font-bold text-transparent md:text-4xl dark:from-zinc-50 py-4 dark:to-zinc-400">
              Mengapa Menggunakan LensFolia untuk Deteksi Dini Pada Tanaman Anda
              itu Penting?
            </h1>

            {/* Cards Grid */}
            <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-card border-border flex flex-col items-start gap-6 rounded-lg border p-6 shadow-sm"
                >
                  <div className="border-border rounded-full border p-3 shadow-sm">
                    {card.icon}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-foreground text-lg font-semibold">
                      {card.title}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-card border-border divide-border grid w-full max-w-4xl grid-cols-3 divide-x rounded-lg border shadow-sm">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center gap-2 p-6"
                >
                  <p className="text-primary font-mono text-2xl font-bold md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-xs">
              *Berdasarkan pengujian internal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
