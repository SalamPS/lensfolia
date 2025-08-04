"use client";

/* eslint-disable @next/next/no-img-element */
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconClipboardText,
  IconSend,
  IconSparkles,
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

export default function LFDResultPage({ result }: { result?: LFDResult_ }) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = React.useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
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

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const currentDisease = result?.result[current - 1];
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
          {result?.imageName}
        </div>
        <div className="border-border bg-card flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[20px] border-[1px] p-4">
          <img
            src={result?.imageUrl || "/placeholder.svg"}
            alt="Captured Image"
            className="max-w-md rounded-md object-cover"
          />
        </div>
      </section>

      {/* Disease Result Section */}
      <section id="disease-result" className="z-20">
        <h1 className="dark:from-primary mt-8 mb-4 bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-4xl font-bold text-transparent dark:to-emerald-800">
          {!result?.result.length ? (
            <span className="">Tidak ada penyakit terdeteksi!</span>
          ) : (
            <span className="">
              {result.result.length} Penyakit Terdeteksi!
            </span>
          )}
        </h1>

        {result?.result.length ? (
          <div className="my-14">
            <div className="mx-auto max-w-2xl">
              <Carousel setApi={setApi} className="w-[400px]">
                <CarouselContent>
                  {result.result.map((disease, index) => (
                    <CarouselItem key={index}>
                      <Card className="border-border">
                        <CardContent className="flex flex-col items-center justify-center">
                          <img
                            src={disease.exampleImageUrl || "/placeholder.svg"}
                            alt={disease.diseaseName}
                            className="mb-4 w-full rounded-md object-cover"
                          />
                          <h2 className="my-2 text-lg font-semibold">
                            {disease.diseaseName}
                          </h2>
                          <p
                            className={`text-foreground mt-1 mb-2 rounded-full border-[1px] p-2 px-4 text-xs font-semibold ${
                              disease.confidence > 0.8
                                ? "bg-primary/30 border-primary"
                                : disease.confidence > 0.5
                                  ? "border-[#FF8904] bg-[#FF8904]/30"
                                  : "bg-destructive/30 border-destructive"
                            }`}
                          >
                            Tingkat Keyakinan:{" "}
                            {Math.round(disease.confidence * 100)}%
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {result.result.length > 1 && (
                  <>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                  </>
                )}
              </Carousel>
            </div>

            {/* Dot Indicators */}
            {result.result.length > 1 && (
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
            {currentDisease?.diseaseName || "Penyakit Tanaman"}
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
              currentDisease?.recommendation ||
              "Tidak ada catatan penting yang tersedia."
            }
          >
            <IconThumbUp className="text-[#FB7185]" size={24} />
          </Discussion>
          {currentDisease?.products && (
            <ProductRecommendation products={currentDisease.products} />
          )}
          <p className="text-muted-foreground px-6 text-sm">
            *Catatan: Informasi ini hanya sebagai referensi. Untuk penanganan
            lebih lanjut, konsultasikan dengan ahli pertanian atau dokter
            tanaman.
          </p>
          <div id="ask-ai" className="border-border rounded-3xl border-[1px]">
            <h3 className="border-border flex items-center justify-center border-b-[1px] p-2 py-6 font-semibold">
              <IconSparkles className="mr-2 inline" size={24} />
              Konsultasi lebih lanjut dengan AI
            </h3>
            <div className="flex flex-col gap-4 px-6">
              <div className="flex h-80 grow flex-col items-center justify-center">
                <h4 className="mb-8 font-semibold">
                  Apa yang bisa saya bantu?
                </h4>
                <div className="w-[80%] text-center">
                  {currentDisease?.aibubble?.length
                    ? currentDisease.aibubble.map((text, index) => (
                        <AIBubble key={index} text={text} />
                      ))
                    : result?.aibubble?.length
                      ? result.aibubble.map((text, index) => (
                          <AIBubble key={index} text={text} />
                        ))
                      : null}
                </div>
              </div>
              <div className="bg-secondary mt-2 flex rounded-t-2xl p-3 px-5">
                <input
                  className="text-muted-foreground grow outline-none"
                  type="text"
                  placeholder="Tanyakan apapun terkait deteksi daunmu"
                />
                <button className="bg-foreground text-background hover:bg-primary/10 rounded-full p-3 transition-colors">
                  <IconSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LFDWrapper>
  );
}
interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  link: string;
}
interface LFDResult_ {
  id: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  imageName: string;
  result: {
    diseaseName: string;
    confidence: number;
    exampleImageUrl: string;
    overview?: string;
    treatment?: string;
    recommendation?: string;
    aibubble?: string[];
    products?: ProductRecommendation[];
  }[];
  aibubble?: string[];
}

interface DiscussionProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const AIBubble = ({ text }: { text: string }) => {
  return (
    <div className="bg-secondary shadow-foreground/[0.1] hover:bg-secondary/80 m-1 inline-block cursor-pointer rounded-full p-2 px-3 text-xs shadow-inner transition-colors">
      {text}
    </div>
  );
};

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
