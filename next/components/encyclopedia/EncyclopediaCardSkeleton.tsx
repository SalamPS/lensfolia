import React from "react";

const EncyclopediaCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg">
      <div className="aspect-[4/3] w-full rounded-lg dark:bg-card bg-zinc-300"></div>
      <div className="px-2 py-4">
        <div className="flex items-start justify-between">
          <div className="h-4 w-1/4 rounded dark:bg-card bg-zinc-300"></div>
          <div className="h-4 w-16 rounded dark:bg-card bg-zinc-300"></div>
        </div>
        <div className="mt-2 flex items-start justify-between">
          <div className="h-8 w-3/4 rounded dark:bg-card bg-zinc-300"></div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="h-4 w-full rounded dark:bg-card bg-zinc-300"></div>
          <div className="h-4 w-5/6 rounded dark:bg-card bg-zinc-300"></div>
        </div>
        <div className="mt-4 flex items-center justify-start">
          <div className="h-6 w-24 rounded dark:bg-card bg-zinc-300"></div>
        </div>
      </div>
    </div>
  );
};

export default EncyclopediaCardSkeleton;
