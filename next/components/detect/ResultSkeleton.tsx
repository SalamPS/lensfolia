import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "../ui/button";
import LFDWrapper from "./Wrapper";
import { Card, CardContent } from "@/components/ui/card";

interface ResultSkeletonProps {
  progress?: number;
}

const ResultSkeleton: React.FC<ResultSkeletonProps> = ({ progress = 0 }) => {
  const getLoadingMessage = () => {
    if (progress < 20) return "Memuat data...";
    if (progress < 50) return "Menganalisis hasil...";
    if (progress < 80) return "Memproses rekomendasi...";
    return "Menyelesaikan...";
  };

  return (
    <LFDWrapper>
      {/* Loading Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-1 bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Loading Message */}
      <div className="flex justify-center items-center py-4">
        <div className="text-center">
        </div>
      </div>
      {/* Preview Image Section Skeleton */}
      <section className="flex w-full items-center justify-center px-4">
        <div
          id="preview-image"
          className="border-border bg-card/[0.12] w-full border-[2px] border-dashed p-4 backdrop-blur-md sm:max-w-[500px] sm:p-6"
        >
          <div className="text-foreground mb-4 flex items-center gap-2 text-xs font-semibold sm:mb-6 sm:gap-4 sm:text-sm">
            <Button
              className="dark:bg-secondary/40 dark:hover:bg-secondary flex h-8 w-8 cursor-pointer rounded-full bg-zinc-200 transition-colors hover:bg-zinc-300 sm:h-10 sm:w-10"
              disabled
            >
              <IconArrowLeft className="text-foreground text-sm sm:text-base" />
            </Button>
            <div className="animate-pulse">
							<div className="flex items-center justify-center gap-2 text-muted-foreground">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-r-transparent"></div>
								<span className="text-sm font-medium">{getLoadingMessage()}</span>
							</div>
            </div>
          </div>
          <div className="border-border bg-card flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-[1px] p-2 sm:rounded-[20px] sm:p-4">
            <div className="animate-pulse w-full max-w-xs sm:max-w-md">
              <div className="aspect-video w-full rounded-md dark:bg-card bg-zinc-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Result Section Skeleton */}
      <section id="disease-result" className="z-20">
        <div className="animate-pulse mt-8 mb-4 flex justify-center">
          <div className="h-10 w-80 rounded dark:bg-card bg-zinc-300"></div>
        </div>

        {/* Disease Card Skeleton */}
        <div className="my-14">
          <div className="flex justify-center px-4">
            <div className="w-fit max-w-[350px]">
              <Card className="border-border w-full animate-pulse">
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="mb-4 aspect-[4/3] min-h-[200px] w-full rounded-md dark:bg-card bg-zinc-300"></div>
                  <div className="my-2 h-6 w-3/4 rounded dark:bg-card bg-zinc-300"></div>
                  <div className="mt-1 mb-2 h-8 w-32 rounded-full dark:bg-card bg-zinc-300"></div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dot Indicators Skeleton */}
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full animate-pulse dark:bg-card bg-zinc-300"
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="animate-pulse h-10 w-48 rounded dark:bg-card bg-zinc-300"></div>
        </div>
      </section>

      {/* Discussion Section Skeleton */}
      <section className="mx-auto flex w-full flex-col items-center justify-center p-4">
        <div
          id="discussion"
          className="bg-card z-20 mx-4 my-16 flex w-full flex-col gap-4 rounded-4xl p-8 px-4 pb-4 md:max-w-7xl"
        >
          <div className="animate-pulse mb-4 flex justify-center">
            <div className="h-8 w-64 rounded dark:bg-secondary bg-zinc-300"></div>
          </div>
          
          {/* Discussion Items Skeleton */}
          {Array.from({ length: 3 }).map((_, index) => (
            <DiscussionSkeleton key={index} delay={index * 0.1} />
          ))}
          
          {/* Product Recommendation Skeleton */}
          <div className="animate-pulse mt-4">
            <div className="mb-4 h-6 w-48 rounded dark:bg-secondary bg-zinc-300"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4 rounded-lg border-border border-[1px] p-4">
                  <div className="h-18 aspect-square rounded dark:bg-secondary bg-zinc-300"></div>
									<div className="grow flex flex-col justify-center">
										<div className="mb-2 h-5 w-3/4 rounded dark:bg-secondary bg-zinc-300"></div>
										<div className="mb-2 h-4 w-full rounded dark:bg-secondary bg-zinc-300"></div>
										<div className="h-4 w-1/2 rounded dark:bg-secondary bg-zinc-300"></div>
									</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="animate-pulse">
            <div className="h-4 w-full rounded dark:bg-secondary bg-zinc-300"></div>
            <div className="mt-1 h-4 w-2/3 rounded dark:bg-secondary bg-zinc-300"></div>
          </div>
          
          {/* AskAI Section Skeleton */}
          <div className="animate-pulse mt-2">
            <div className="mb-4 h-6 w-32 rounded dark:bg-secondary bg-zinc-300"></div>
            <div className="rounded-lg border-border border-[1px] p-4">
              <div className="mb-3 h-20 w-full rounded dark:bg-secondary bg-zinc-300"></div>
              <div className="h-10 w-24 rounded dark:bg-secondary bg-zinc-300"></div>
            </div>
          </div>
        </div>
      </section>
    </LFDWrapper>
  );
};

const DiscussionSkeleton: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  return (
    <div 
      className="animate-pulse border-border rounded-2xl border-[1px] p-4"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-4 flex w-fit items-center">
        <div className="border-border bg-card mr-3 flex h-12 w-12 items-center justify-center rounded-full border-[1px] shadow-2xl">
          <div className="h-6 w-6 rounded dark:bg-secondary bg-zinc-300"></div>
        </div>
        <div className="h-6 w-24 rounded dark:bg-secondary bg-zinc-300"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded dark:bg-secondary bg-zinc-300"></div>
        <div className="h-4 w-5/6 rounded dark:bg-secondary bg-zinc-300"></div>
        <div className="h-4 w-3/4 rounded dark:bg-secondary bg-zinc-300"></div>
      </div>
    </div>
  );
};

export default ResultSkeleton;
