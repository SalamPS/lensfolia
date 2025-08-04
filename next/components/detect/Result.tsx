/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable @next/next/no-img-element */
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconClipboardText,
  IconStethoscope,
  IconThumbUp,
} from "@tabler/icons-react";
import LFDWrapper from "./Wrapper";
import { Button } from "../ui/button";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import type { CarouselApi } from "@/components/ui/carousel";
import { ProductRecommendation } from "./ProductRecommendation";
import { AskAI } from "./AskAI";
import { supabase } from "@/lib/supabase";
import { LFD_, LFDProduct_, LFDResult_, } from "../types/diagnoseResult";

export default function LFDResultPage({detId}: {detId?: string}) {
  const [result, setResult] = React.useState<LFD_ | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await supabase
      .from("diagnoses")
      .select(`
        *,
        diagnoses_result(
          *,
          diagnoses_chat(*),
          encyclopedia(*)
        )
      `)
      .eq("id", detId)
      .single();
      if (res.data === null) {
        console.error("Error fetching result:", res.error);
        return;
      }
      else {
        const res_clone:LFD_ = res.data;
        
        // Gunakan Promise.all untuk menunggu semua query produk selesai
        await Promise.all(
          res.data.diagnoses_result.map(async (result: LFDResult_, index: number) => {
            if (result.products && result.products.length > 0) {
              const productRes = await supabase
                .from("products")
                .select("*")
                .in("id", result.products);
              res_clone.diagnoses_result[index].product_list = productRes.data as LFDProduct_[];
            }
            else {
              res_clone.diagnoses_result[index].product_list = [];
            }
          })
        );
        
        console.log(res_clone)
        setResult(res_clone);
      }
    })();
  }, []);


  const router = useRouter();
  const [bookmarked, setBookmarked] = React.useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentDisease, setCurrentDisease] = React.useState<LFDResult_ | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  React.useEffect(() => {
    if (result && result.diagnoses_result.length > 0) {
      setCurrentDisease(result.diagnoses_result[current - 1]);
    }
  }, [current, result]);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };
  return (
    <LFDWrapper>
      <section
        id="preview-image"
        className="border-border w-fullbg-card/[0.12] border-[2px] border-dashed p-6 backdrop-blur-md"
      >
        <div className="text-foreground mb-6 flex items-center gap-4 text-sm font-semibold">
          <Button
            className="dark:bg-secondary/40 dark:hover:bg-secondary flex h-10 w-10 cursor-pointer rounded-full bg-zinc-200 transition-colors hover:bg-zinc-300"
            onClick={() => {
              router.back();
            }}
          >
            <IconArrowLeft className="text-foreground" />
          </Button>
          {result?.image_url}
        </div>
        <div className="border-border bg-card flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[20px] border-[1px] p-4">
          <img
            src={result?.image_url || "/placeholder.svg"}
            alt="Captured Image"
            className="max-w-md rounded-md object-cover"
          />
        </div>
      </section>

      {/* Disease Result Section */}
      <section id="disease-result" className="z-20">
        <h1 className="dark:from-primary mt-8 mb-4 bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-4xl font-bold text-transparent dark:to-emerald-800">
          {!result?.diagnoses_result.length ? (
            <span className="">Tidak ada penyakit atau hama yang terindikasi!</span>
          ) : (
            <span className="">
              Ditemukan {result.diagnoses_result.length} indikasi!
            </span>
          )}
        </h1>

        {result?.diagnoses_result.length ? (
          <div className="my-14">
            <div className="mx-auto max-w-2xl">
              <Carousel setApi={setApi} className="w-[400px]">
                <CarouselContent>
                  {result.diagnoses_result.map((disease, index) => (
                    <CarouselItem key={index}>
                      <Card className="border-border">
                        <CardContent className="flex flex-col items-center justify-center">
                          <img
                            src={disease.image_url || "/placeholder.svg"}
                            alt={disease.encyclopedia?.name || "Disease Image"}
                            className="mb-4 w-full rounded-md object-cover"
                          />
                          <h2 className="my-2 text-lg font-semibold">
                            {disease.encyclopedia?.name || "Penyakit Tidak Diketahui"}
                          </h2>
                          <p
                            className={`text-foreground mt-1 mb-2 rounded-full border-[1px] p-2 px-4 text-xs font-semibold ${
                              disease.score > 0.8
                                ? "bg-primary/30 border-primary"
                                : disease.score > 0.5
                                  ? "border-[#FF8904] bg-[#FF8904]/30"
                                  : "bg-destructive/30 border-destructive"
                            }`}
                          >
                            Tingkat Keyakinan:{" "}
                            {Math.round(disease.score * 100)}%
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {result.diagnoses_result.length > 1 && (
                  <>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                  </>
                )}
              </Carousel>
            </div>

            {/* Dot Indicators */}
            {result.diagnoses_result.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      current === index + 1 ? "bg-primary" : "bg-muted"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-center">
          <Button onClick={handleBookmark}>
            {bookmarked ? (
              <>
                <IconBookmarkFilled size={24} /> Hasil Deteksi Tersimpan
              </>
            ) : (
              <>
                <IconBookmark size={24} /> Simpan Hasil Deteksi
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="mx-auto flex w-full flex-col items-center justify-center p-4">
        <div
          id="discussion"
          className="bg-card z-20 mx-4 my-16 flex w-full flex-col gap-4 rounded-4xl p-8 px-4 pb-4 md:max-w-7xl"
        >
          <h2 className="mb-4 text-center text-2xl font-semibold">
            Pembahasan Terkait{" "}
            {currentDisease?.encyclopedia?.name || "Penyakit Tanaman"}
          </h2>
          <Discussion
            title="Overview"
            description={
              currentDisease?.overview || "Tidak ada overview yang tersedia."
            }
          >
            <IconClipboardText className="text-primary" size={24} />
          </Discussion>
          <Discussion
            title="Perawatan"
            description={
              currentDisease?.treatment ||
              "Tidak ada rekomendasi yang tersedia."
            }
          >
            <IconStethoscope className="text-[#53EAFD]" size={24} />
          </Discussion>
          <Discussion
            title="Rekomendasi"
            description={
              currentDisease?.recommend ||
              "Tidak ada catatan penting yang tersedia."
            }
          >
            <IconThumbUp className="text-[#FB7185]" size={24} />
          </Discussion>
          {currentDisease?.product_list && (
            <ProductRecommendation products={currentDisease.product_list} />
          )}
          <p className="text-muted-foreground px-6 text-sm">
            *Catatan: Informasi ini hanya sebagai referensi. Untuk penanganan
            lebih lanjut, konsultasikan dengan ahli pertanian atau dokter
            tanaman.
          </p>
          <AskAI disease={currentDisease}/>
        </div>
      </section>
    </LFDWrapper>
  );
}

interface DiscussionProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const Discussion: React.FC<DiscussionProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <div className="border-border rounded-2xl border-[1px] p-4">
      <div className="mb-4 flex w-fit items-center">
        <div className="border-border bg-card mr-3 flex items-center justify-center rounded-full border-[1px] p-3 shadow-2xl">
          {children}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
