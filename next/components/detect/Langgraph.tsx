"use client";

import {
  LGFail,
  LGPrepare,
  LGStart,
  LGSteps,
  LGUpload,
} from "@/components/detect/ module/langgrapht";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LGStep_ } from "./ module/langgraph_type";
import { useRouter } from "next/navigation";
import { LFD_ } from "../types/diagnoseResult";
import { Button } from "../ui/button";
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import {
  IconBook2,
  IconCheck,
  IconDatabase,
  IconImageInPicture,
  IconLeaf,
  IconSearch,
  IconSparkles,
  IconStethoscope,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

function StatusIcon({ status }: { status: string }) {
  if (status === "error") {
    return <IconX className="text-destructive h-6 w-6" />;
  }
  if (status === "success") {
    return <IconCheck className="text-primary h-6 w-6" />;
  }
  return (
    <motion.div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="bg-primary h-2 w-2 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const iconMaping: Record<string, React.ReactNode> = {
  image: <IconImageInPicture className="text-muted-foreground h-6 w-6" />,
  leaf: <IconLeaf className="text-muted-foreground h-6 w-6" />,
  data: <IconDatabase className="text-muted-foreground h-6 w-6" />,
  query: <IconSearch className="text-muted-foreground h-6 w-6" />,
  overview: <IconBook2 className="text-muted-foreground h-6 w-6" />,
  treatment_query: <IconSearch className="text-muted-foreground h-6 w-6" />,
  treatment: <IconStethoscope className="text-muted-foreground h-6 w-6" />,
  recommendation_query: (
    <IconSearch className="text-muted-foreground h-6 w-6" />
  ),
  recommendation: <IconSparkles className="text-muted-foreground h-6 w-6" />,
  check: <IconCheck className="text-muted-foreground h-6 w-6" />,
  error: <IconX className="text-destructive h-6 w-6" />,
};

type LangGraphVisualProps = {
  setUploadStatus: (status: string) => void;
  setTrigger: (trigger: boolean) => void;
  trigger: boolean;
  diagnose_data: LFD_ | null;
  uploadStatus: string;
};

export function LangGraphVisual({
  setTrigger,
  trigger = false,
  diagnose_data,
  uploadStatus,
  setUploadStatus,
}: LangGraphVisualProps) {
  const [threadId, setThreadId] = useState<string | null>(null);

  const thread = useStream<{
    messages: Message[];
    image_url: string;
    diagnoses_ref: string;
    task_type: "diagnosis" | "qa";
  }>({
		apiUrl: process.env.NEXT_PUBLIC_AGENTIC_API || "https://lensfolia-diagnosis.andyathsid.com/",
    assistantId: "agent",
    messagesKey: "messages",
    threadId: threadId,
    onThreadId: async (id) => {
      setThreadId(id);
      await supabase
        .from("diagnoses")
        .update({ thread_id: id })
        .eq("id", diagnose_data?.id);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdateEvent(event: any) {
      // if (!LGSteps.includes(event.step)) return;
      console.log("Event received:", event);

      if (event.image_analysis) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "image_analysis",
            title: "Analisis Gambar",
            description:
              "Menganalisis gambar tanaman untuk mendeteksi penyakit.",
            icon: "image",
          },
        ]);
      } else if (event.plant_disease_detection) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "plant_disease_detection",
            title: "Deteksi Penyakit Tanaman",
            description:
              "Mendeteksi penyakit tanaman berdasarkan analisis gambar.",
            icon: "leaf",
          },
        ]);
      } else if (event.retriever_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "retriever_agent",
            title: "Pengambilan Data Penyakit",
            description: "Mengambil data penyakit tanaman terkait.",
            icon: "data",
          },
        ]);
      } else if (event.overview_query_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "overview_query_generation",
            title: "Pembuatan Query Overview",
            description: "Membuat query untuk overview penyakit tanaman.",
            icon: "query",
          },
        ]);
      } else if (event.overview_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "overview_generation",
            title: "Pembuatan Overview",
            description: "Membuat overview penyakit tanaman berdasarkan query.",
            icon: "overview",
          },
        ]);
      } else if (event.treatment_query_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "treatment_query_generation",
            title: "Pembuatan Query Pengobatan",
            description: "Membuat query untuk pengobatan penyakit tanaman.",
            icon: "treatment_query",
          },
        ]);
      } else if (event.treatment_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "treatment_generation",
            title: "Pembuatan Pengobatan",
            description: "Membuat pengobatan untuk penyakit tanaman.",
            icon: "treatment",
          },
        ]);
      } else if (event.recommendation_query_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "recommendation_query_generation",
            title: "Pembuatan Query Rekomendasi",
            description: "Membuat query untuk rekomendasi penyakit tanaman.",
            icon: "recommendation_query",
          },
        ]);
      } else if (event.recommendation_agent) {
        statusHelper("success");
        setProcessedSteps((prev) => [
          ...prev,
          {
            step: "recommendation_generation",
            title: "Pembuatan Rekomendasi",
            description: "Membuat rekomendasi untuk penyakit tanaman.",
            icon: "recommendation",
          },
        ]);
      } else if (event.create_final_response) {
        if (event.create_final_response.is_plant_leaf) {
          statusClearing();
        }
        else {
          statusPurging();
        }
      }
    },
  });

  const [countdown, setCountdown] = useState(0);
  const [processedSteps, setProcessedSteps] = useState<LGStep_[]>([]);
  const [processedStatus, setProcessedStatus] = useState<string[]>(["loading"]);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [processedSteps]);

  const statusPurging = async () => {
    statusHelper("error", "error");
    setProcessedSteps((prev) => [
      ...prev,
      LGFail({
        title: "Gagal memproses diagnosis",
        description:
          "Kami tidak dapat mendeteksi daun pada gambar anda. Silakan coba lagi.",
        icon: "error",
      }),
    ]);
    await supabase
      .from("diagnoses")
      .delete()
      .eq("id", diagnose_data?.id);
  }

  const statusClearing = async () => {
    statusHelper("success");
    setProcessedSteps((prev) => [
      ...prev,
      {
        step: "end",
        title: "Mengumpulkan hasil akhir",
        description: "Proses diagnosis selesai. Mengalihkan ke halaman hasil.",
        icon: "check",
      },
    ]);
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    await delay(5000);
    statusHelper("success");
    await delay(500);
    router.push("/result/" + diagnose_data?.id);
  };

  const statusHelper = (status: string, future?: string) => {
    setProcessedStatus((prev) => {
      const newStatus = [...prev];
      const index = newStatus.length;
      if (index > 0) {
        newStatus[index - 1] = status;
      }
      newStatus.push(future || "loading");
      return [...newStatus];
    });
  };

  useEffect(() => {
    (async () => {
      if (uploadStatus === "idle") {
        setProcessedSteps([]);
        setProcessedStatus(["loading"]);
        return;
      }
      if (uploadStatus === "prepare") {
        setProcessedSteps((prev) => [...prev, LGPrepare]);
        await delay(3000);
        statusHelper("success");
        setProcessedSteps((prev) => [...prev, LGUpload]);
        return;
      }

      await delay(3000);
      if (uploadStatus === "error" || !diagnose_data) {
        statusHelper("error", "error");
        setProcessedSteps((prev) => [
          ...prev,
          LGFail({
            title: "Gagal memproses diagnosis",
            description:
              "Terjadi kesalahan dalam proses diagnosis. Silakan coba lagi.",
            icon: "error",
          }),
        ]);
        return;
      }
      if (uploadStatus === "success") {
        statusHelper("success");
        setProcessedSteps((prev) => [...prev, LGStart]);

        await delay(3000);
        const dataSubmit = {
        	image_url: diagnose_data?.image_url || "",
        	diagnoses_ref: diagnose_data?.id || "",
        	created_by: diagnose_data?.created_by,
        	task_type: "diagnosis" as const,
        }
        console.log("Submitting data to thread:", dataSubmit);
        const newMessages: Message[] = [
        	...(thread.messages || []),
        	{
        		type: "human",
        		content: "Tolong deteksi penyakit tanaman ini.",
        		id: Date.now().toString(),
        	},
        ];
        thread.submit({
        	messages: newMessages,
        	...dataSubmit,
        })

        // for (const step of LGSteps) {
        //   console.log(`================\n${step.title}`);
        //   statusHelper("success");
        //   setProcessedSteps((prev) => [...prev, step]);
        //   await delay(3000);
        // }

        // setProcessedSteps((prev) => [
        //   ...prev,
        //   {
        //     step: "end",
        //     title: "Mengumpulkan hasil akhir",
        //     description:
        //       "Proses diagnosis selesai. Mengalihkan ke halaman hasil.",
        //     icon: "check",
        //   },
        // ]);
        // setCountdown(5);
        // const countdownInterval = setInterval(() => {
        //   setCountdown((prev) => {
        //     if (prev <= 1) {
        //       clearInterval(countdownInterval);
        //       return 0;
        //     }
        //     return prev - 1;
        //   });
        // }, 1000);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, uploadStatus]);

  useEffect(() => {});

  if (!trigger) {
    return <></>;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-background/90 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      >
        <div
          className="bg-background border-border flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-xl"
          style={{ height: "500px" }}
        >
          <div className="px-4 py-8 text-center">
            <h1 className="font-mono text-lg font-semibold md:text-2xl">
              {processedStatus.includes("error")
                ? "GAGAL MEMPROSES DIAGNOSIS"
                : processedSteps.some((step) => step.step === "end")
                  ? "DIAGNOSIS SELESAI"
                  : "MEMPROSES DIAGNOSIS"}
            </h1>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {/* gradient overlay */}
            <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-[36px] bg-gradient-to-b to-transparent" />

            {/* content */}
            <div
              ref={scrollRef}
              className="relative h-full w-full overflow-y-hidden px-4 py-4 pb-[60px]"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="mx-auto flex min-h-full w-full max-w-[400px] flex-col gap-4">
                {processedSteps.map((step, index) => (
                  <motion.div
                    key={step.step + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="border-border bg-muted/30 flex items-center gap-4 rounded-xl border p-4"
                  >
                    <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                      {iconMaping[step.icon] || (
                        <IconImageInPicture className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "text-card-foreground font-semibold",
                          processedStatus[index] === "loading" &&
                            "shimmer-text",
                        )}
                      >
                        {step.title}
                      </h3>

                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                    <StatusIcon status={processedStatus[index]} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-4">
            {processedStatus.includes("error") ? (
              <Button
                variant="destructive"
                className="w-full rounded py-3"
                onClick={() => {
                  setTrigger(false);
                  setUploadStatus("idle");
                  setProcessedSteps([]);
                  setProcessedStatus(["loading"]);
                }}
              >
                Kembali
              </Button>
            ) : processedSteps.some((step) => step.step === "end") ? (
              <Button
                className="w-full rounded py-3 font-semibold"
                onClick={() => router.push("/result/" + diagnose_data?.id)}
              >
                Lanjut ({countdown})
              </Button>
            ) : (
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      (processedSteps.length / (LGSteps.length + 4)) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
