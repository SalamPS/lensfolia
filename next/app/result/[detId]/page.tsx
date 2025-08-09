import Navbar from "@/components/home/Navbar";
import React from "react";
import LFDResultPage from "@/components/detect/Result";
import StaticBG from "@/components/StaticBG";

export default async function LFDResultContainer({
  params,
}: {
  params: Promise<{ detId: string }>;
}) {
  const { detId } = await params;
  if (!detId) {
    return <div className="text-center">Deteksi tidak ditemukan.</div>;
  }
  return (
    <main className="bg-background h-full w-full">
      <Navbar/>
      <StaticBG>
        <div className="relative z-10 mt-4 flex h-[20rem] items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
              LensFolia—Deteksi Penyakit Tanaman dengan AI
            </h1>
            <p className="text-muted-foreground max-w-2xl text-center text-sm text-pretty">
              Kami telah menganalisis gambar daun yang Anda unggah. Berikut
              adalah hasil deteksi dan rekomendasi perawatan yang sesuai.
            </p>
          </div>
        </div>
      </StaticBG>
      <LFDResultPage detId={detId}/>
    </main>
  );
}
