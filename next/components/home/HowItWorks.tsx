import React from "react";
import TitleBadge from "../ui/title-badge";
import Image from "next/image";

const HowItWorks = () => {
  const CARDS = [
    {
      id: 1,
      image: "/asset-web-1.png",
      alt: "Step 1",
      step: "STEP 1",
      title: "Ambil atau Upload Gambar Daun",
      description:
        "Ambil atau upload gambar daun tanaman yang ingin Anda periksa. Pastikan gambar jelas dan tidak buram.",
      imageClass: "rounded-lg object-cover",
    },
    {
      id: 2,
      image: "/asset-web-2.png",
      alt: "Step 2",
      step: "STEP 2",
      title: "Analisis AI Otomatis",
      description:
        "Gambar diproses oleh model AI yang telah dilatih dengan ribuan data daun dari berbagai jenis penyakit.",
      imageClass: "rounded-lg object-cover",
    },
    {
      id: 3,
      image: "/asset-web-3.png",
      alt: "Step 3",
      step: "STEP 3",
      title: "Hasil & Rekomendasi",
      description:
        "Hasil diagnosis ditampilkan dengan lengkap dan Anda dapat berkonsultasi lebih lanjut dengan AI.",
      imageClass: "rounded-lg object-cover object-left",
    },
  ];

  return (
    <section id="how-it-works">
      <div className="h-full w-full items-center justify-center">
        <div className="flex w-full items-center justify-center px-4">
          <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-12 md:gap-8">
            {/* Content container */}
            <div className="bg-background flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-12 md:gap-6">
              {/* Badge */}
              <TitleBadge
                title="Cara Kerja"
                iconDark="/sparkle.svg"
                iconLight="/sparkle-color-primary.svg"
              />

              {/* Title */}
              <h1 className="max-w-4xl bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text py-4 text-center text-xl font-bold text-pretty text-transparent md:text-3xl dark:from-zinc-50 dark:to-zinc-400">
                Cara Kerja Platform LensFolia untuk Deteksi Dini Penyakit
                Tanaman
              </h1>

              {/* Card container */}
              <div className="grid h-full w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {CARDS.map((card) => (
                  <div
                    key={card.id}
                    className="bg-card border-border group flex gap-2 rounded-2xl border p-2 md:flex-col md:gap-4"
                  >
                    <Image
                      src={card.image}
                      alt={card.alt}
                      width={300}
                      height={200}
                      className={`h-24 w-24 sm:h-40 sm:w-40 md:h-full md:w-full ${card.imageClass}`}
                    />
                    <div className="flex flex-col justify-between gap-2 md:justify-start">
                      <div className="flex w-full flex-row items-center gap-2 px-1 md:items-center">
                        <h2 className="text-primary shrink-0 font-mono text-xs font-bold uppercase md:shrink-0 md:text-sm">
                          {card.step}
                        </h2>
                        <div className="bg-primary h-[1.5px] w-full rounded-full"></div>
                      </div>

                      <div className="flex w-full flex-col gap-2 px-1 pb-2">
                        <h3 className="text-foreground text-xs font-semibold md:text-sm">
                          {card.title}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
