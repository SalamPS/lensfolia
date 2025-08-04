import React from "react";
import { cn } from "@/lib/utils";

const ForumCardSkeleton = () => {
  return (
    <div className="dark:bg-card/20 rounded-2xl bg-zinc-300/20 p-4 transition-all">
      <div className="flex animate-pulse flex-col gap-3">
        {/* Header */}
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="dark:bg-card h-10 w-10 rounded-full bg-zinc-300" />
            <div>
              <div className="dark:bg-card mb-1 h-4 w-24 rounded bg-zinc-300" />
              <div className="dark:bg-card h-3 w-16 rounded bg-zinc-300" />
            </div>
          </div>
          <div
            className={cn(
              "flex h-fit w-16 items-center justify-center rounded-full px-4 py-2 font-mono text-sm font-bold uppercase",
              "dark:bg-card bg-zinc-300",
            )}
          />
        </div>

        {/* Title & Content */}
        <div className="space-y-2">
          <div className="dark:bg-card h-5 w-3/4 rounded bg-zinc-300" />
          <div className="dark:bg-card h-4 w-full rounded bg-zinc-300" />
          <div className="dark:bg-card h-4 w-5/6 rounded bg-zinc-300" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <div className="dark:bg-card h-6 w-16 rounded bg-zinc-300" />
          <div className="dark:bg-card h-6 w-12 rounded bg-zinc-300" />
          <div className="dark:bg-card h-6 w-20 rounded bg-zinc-300" />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <div className="dark:bg-card h-6 w-12 rounded bg-zinc-300" />
          <div className="dark:bg-card h-6 w-12 rounded bg-zinc-300" />
          <div className="dark:bg-card h-6 w-12 rounded bg-zinc-300" />
          <div className="dark:bg-card h-6 w-12 rounded bg-zinc-300" />
        </div>
      </div>
    </div>
  );
};

export default ForumCardSkeleton;
