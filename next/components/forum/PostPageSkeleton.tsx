import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const PostPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto mt-16 max-w-4xl">
        <Link href="/forum">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>

        <div className="mt-4 mb-8 animate-pulse">
          {/* Post Header Skeleton */}
          <div className="mb-4 flex items-center gap-2">
            <div className="dark:bg-card h-6 w-16 rounded-full bg-zinc-300" />
          </div>

          {/* Post Details Skeleton */}
          <div className="mb-6 flex items-start gap-3">
            <div className="dark:bg-card h-10 w-10 rounded-full bg-zinc-300" />
            <div className="flex-1 space-y-2">
              <div className="dark:bg-card h-4 w-32 rounded bg-zinc-300" />
              <div className="dark:bg-card h-3 w-24 rounded bg-zinc-300" />
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="mb-4 space-y-2">
            <div className="dark:bg-card h-6 w-full rounded bg-zinc-300" />
            <div className="dark:bg-card h-6 w-3/4 rounded bg-zinc-300" />
          </div>

          {/* Content Skeleton */}
          <div className="mb-6 space-y-2">
            <div className="dark:bg-card h-4 w-full rounded bg-zinc-300" />
            <div className="dark:bg-card h-4 w-full rounded bg-zinc-300" />
            <div className="dark:bg-card h-4 w-5/6 rounded bg-zinc-300" />
            <div className="dark:bg-card h-4 w-4/5 rounded bg-zinc-300" />
            <div className="dark:bg-card h-4 w-full rounded bg-zinc-300" />
            <div className="dark:bg-card h-4 w-2/3 rounded bg-zinc-300" />
          </div>

          {/* Tags Skeleton */}
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="dark:bg-card h-6 w-16 rounded-full bg-zinc-300" />
            <div className="dark:bg-card h-6 w-20 rounded-full bg-zinc-300" />
            <div className="dark:bg-card h-6 w-14 rounded-full bg-zinc-300" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="dark:bg-card h-8 w-8 rounded bg-zinc-300" />
              <div className="dark:bg-card h-4 w-8 rounded bg-zinc-300" />
            </div>
            <div className="flex items-center gap-2">
              <div className="dark:bg-card h-8 w-8 rounded bg-zinc-300" />
              <div className="dark:bg-card h-4 w-8 rounded bg-zinc-300" />
            </div>
            <div className="flex items-center gap-2">
              <div className="dark:bg-card h-8 w-8 rounded bg-zinc-300" />
              <div className="dark:bg-card h-4 w-8 rounded bg-zinc-300" />
            </div>
            <div className="flex items-center gap-2">
              <div className="dark:bg-card h-8 w-8 rounded bg-zinc-300" />
              <div className="dark:bg-card h-4 w-12 rounded bg-zinc-300" />
            </div>
          </div>
        </div>

        {/* Comments Section Skeleton */}
        <div className="space-y-6 animate-pulse">
          {/* Comment Form Skeleton */}
          <div className="rounded-xl border-[1px] border-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="dark:bg-card h-8 w-8 rounded-full bg-zinc-300" />
              <div className="dark:bg-card h-4 w-32 rounded bg-zinc-300" />
            </div>
            <div className="mb-4 space-y-2">
              <div className="dark:bg-card h-20 w-full rounded bg-zinc-300" />
            </div>
            <div className="flex justify-end">
              <div className="dark:bg-card h-8 w-20 rounded bg-zinc-300" />
            </div>
          </div>

          {/* Comments List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl border-[1px] border-card p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="dark:bg-card h-10 w-10 rounded-full bg-zinc-300" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="dark:bg-card h-4 w-24 rounded bg-zinc-300" />
                      <div className="dark:bg-card h-3 w-16 rounded bg-zinc-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="dark:bg-card h-4 w-full rounded bg-zinc-300" />
                      <div className="dark:bg-card h-4 w-4/5 rounded bg-zinc-300" />
                      <div className="dark:bg-card h-4 w-2/3 rounded bg-zinc-300" />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="dark:bg-card h-6 w-6 rounded bg-zinc-300" />
                        <div className="dark:bg-card h-3 w-6 rounded bg-zinc-300" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="dark:bg-card h-6 w-6 rounded bg-zinc-300" />
                        <div className="dark:bg-card h-3 w-6 rounded bg-zinc-300" />
                      </div>
                      <div className="dark:bg-card h-6 w-12 rounded bg-zinc-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPageSkeleton;
