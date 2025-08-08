/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable @next/next/no-img-element */
import {
  IconArrowLeft,
  IconClipboardText,
  IconExternalLink,
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
import { LFD_, LFDProduct_ } from "../types/diagnoseResult";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import { ProductList } from "@/lib/products";
import ResultSkeleton from "./ResultSkeleton";

export default function LFDResultPage({detId}: {detId?: string}) {
  const [result, setResult] = React.useState<LFD_ | null>(null);
  const [api, setApi] = React.useState<CarouselApi>();
  const [loading, setLoading] = React.useState(true);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const {user, anonUser} = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      setLoadingProgress(10); // Start loading
      
      const res = await supabase
      .from("diagnoses")
      .select(`
        *,
        diagnoses_aichat(*),
        diagnoses_result(
          *,
          encyclopedia(*)
        )
      `)
      .eq("id", detId)
      .single();
      
      setLoadingProgress(40); // Data fetched
      
      if (res.data === null) {
        console.error("Error fetching result:", res.error);
        setError("Data tidak ditemukan atau terjadi kesalahan");
        setLoading(false);
        return;
      }
      else {
        const res_clone:LFD_ = res.data;
        const parsedDiseases = JSON.parse(res.data.diagnoses_result[0].cropped_images);
        res_clone.diagnoses_result[0].list_of_diseases = parsedDiseases;

        setLoadingProgress(60); // Data processed

        const recoms = res_clone.diagnoses_result[0].recommendations;
        const productList = ProductList.filter((product) => recoms.includes(product));

        const fetchedProducts = await supabase
          .from("products")
          .select("*")
          .in("name", productList);

        setLoadingProgress(80); // Products fetched

        if (fetchedProducts.error) {
          console.error("Error fetching products:", fetchedProducts.error);
        } else {
          const products: LFDProduct_[] = fetchedProducts.data.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            link: product.link,
            category: product.category,
          }));
          res_clone.diagnoses_result[0].product_list = products;
        }
        
        setLoadingProgress(100); // Complete
        setResult(res_clone);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (result && !result.created_by && user && anonUser) {
        const res = await supabase
          .from("diagnoses")
          .update({ 
            created_by: user.id,
            id_anon: null,
            is_public: false,
            is_bookmark: true,
          })
          .eq("id", result.id)
          .eq("id_anon", anonUser.id);
        if (res.error) {
          console.error("Error updating diagnosis:", res.error);
        }
      }
    })();
  }, [user, anonUser, result]);

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

  const goToBookmark = () => {
    router.push("/bookmarks");
  };

  if (loading || !result) {
    return <ResultSkeleton progress={loadingProgress} />;
  }

  if (error) {
    return (
      <LFDWrapper>
        <section className="flex w-full items-center justify-center px-4 py-20">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.back()}>
              <IconArrowLeft className="mr-2" size={16} />
              Kembali
            </Button>
          </div>
        </section>
      </LFDWrapper>
    );
  }
  
  return (
    <LFDWrapper>
      <section className="flex w-full items-center justify-center px-4">
        <div
          id="preview-image"
          className="border-border bg-card/[0.12] w-full border-[2px] border-dashed p-4 backdrop-blur-md sm:max-w-[500px] sm:p-6"
        >
          <div className="text-foreground mb-4 flex items-center gap-2 text-xs font-semibold sm:mb-6 sm:gap-4 sm:text-sm">
            <Button
              className="dark:bg-secondary/40 dark:hover:bg-secondary flex h-8 w-8 cursor-pointer rounded-full bg-zinc-200 transition-colors hover:bg-zinc-300 sm:h-10 sm:w-10"
              onClick={() => {
                router.back();
              }}
            >
              <IconArrowLeft className="text-foreground text-sm sm:text-base" />
            </Button>
            <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
              {result?.image_url}
            </div>
          </div>
          <div className="border-border bg-card flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-[1px] p-2 sm:rounded-[20px] sm:p-4">
            <img
              src={result?.diagnoses_result[0].annotated_image || "not-found.svg"}
              alt="Captured Image"
              className="w-full max-w-xs rounded-md object-cover sm:max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Disease Result Section */}
      <section id="disease-result" className="z-20">
        <h1 className="dark:from-primary mt-12 mb-8 bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-3xl md:text-4xl font-bold text-transparent dark:to-emerald-800">
          {!result?.diagnoses_result.length ? (
            <span className="">
              Tidak ada penyakit atau hama yang terindikasi!
            </span>
          ) : (
            <span className="w-full px-4 text-center">
              Ditemukan {result.diagnoses_result.length} indikasi!
            </span>
          )}
        </h1>

        {result?.diagnoses_result[0]?.list_of_diseases.length ? (
          <div className="mb-14">
            <div className="flex justify-center px-4">
              <Carousel setApi={setApi} className="w-fit max-w-[350px]">
                <CarouselContent>
                  {result.diagnoses_result[0]?.list_of_diseases.map((disease, index) => (
                    <CarouselItem key={index}>
                      <Card className="border-border w-full">
                        <CardContent className="flex flex-col items-center justify-center">
                          <img
                            src={disease.base64_image || "not-found.svg"}
                            alt={disease.label || "Disease Image"}
                            className="mb-4 aspect-[4/3] min-h-[200px] w-full rounded-md object-cover"
                          />
                          <h2 className="my-2 text-lg font-semibold">
                            {disease.label || "Penyakit Tidak Diketahui"}
                          </h2>
                          <p
                            className={`text-foreground mt-1 mb-2 rounded-full border-[1px] p-2 px-4 text-xs font-semibold ${
                              disease.confidence > 80
                                ? "bg-primary/30 border-primary"
                                : disease.confidence > 50
                                  ? "border-[#FF8904] bg-[#FF8904]/30"
                                  : "bg-destructive/30 border-destructive"
                            }`}
                          >
                            Tingkat Keyakinan: {Math.round(disease.confidence/100 * 100)}
                            %
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
                      current === index + 1
                        ? "bg-primary"
                        : "dark:bg-muted bg-zinc-300"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-center">
          <Button onClick={goToBookmark}>
            <IconExternalLink size={24} /> Lihat Riwayat Diagnosis
          </Button>
        </div>
      </section>

      <section className="mx-auto flex w-full flex-col items-center justify-center p-4">
        <div
          id="discussion"
          className="bg-card z-20 mx-4 my-16 flex w-full flex-col gap-4 rounded-4xl p-8 px-4 pb-4 md:max-w-7xl"
        >
          <h2 className="text-foreground mb-4 text-center text-2xl font-semibold">
            Pembahasan Terkait{" "}
            {result?.diagnoses_result[0]?.encyclopedia?.name || "Penyakit Tanaman"}
          </h2>
          <Discussion
            title="Overview"
            description={
              result?.diagnoses_result[0]?.overview || "Tidak ada overview yang tersedia."
            }
          >
            <IconClipboardText className="text-primary" size={24} />
          </Discussion>
          <Discussion
            title="Perawatan"
            description={
              result?.diagnoses_result[0]?.treatment ||
              "Tidak ada rekomendasi yang tersedia."
            }
          >
            <IconStethoscope className="text-[#53EAFD]" size={24} />
          </Discussion>
          <Discussion
            title="Rekomendasi"
            description={
              result?.diagnoses_result[0]?.recommendations ||
              "Tidak ada catatan penting yang tersedia."
            }
          >
            <IconThumbUp className="text-[#FB7185]" size={24} />
          </Discussion>
          {result?.diagnoses_result[0]?.product_list && (
            <ProductRecommendation products={result?.diagnoses_result[0].product_list} />
          )}
          <p className="text-muted-foreground px-6 text-sm">
            *Catatan: Informasi ini hanya sebagai referensi. Untuk penanganan
            lebih lanjut, konsultasikan dengan ahli pertanian atau dokter
            tanaman.
          </p>
          <AskAI thread_id={result?.thread_id} disease={result?.diagnoses_result[0]} />
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
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="text-muted-foreground">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  );
};
