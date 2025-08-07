import React from "react";

const BookmarkCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse bg-secondary border border-border rounded-2xl p-2">
      {/* Image skeleton */}
      <div className="w-full h-40 rounded-lg mb-3 dark:bg-card bg-zinc-300"></div>
      
      <div className="pl-2">
        <div className="flex items-center">
          {/* Title skeleton */}
          <div className="grow">
            <div className="h-6 w-3/4 rounded dark:bg-card bg-zinc-300"></div>
          </div>
          {/* Dropdown skeleton */}
          <div className="h-6 w-6 rounded dark:bg-card bg-zinc-300"></div>
        </div>
        {/* Date skeleton */}
        <div className="mt-2 h-4 w-1/3 rounded dark:bg-card bg-zinc-300 pb-1"></div>
      </div>
    </div>
  );
};

export default BookmarkCardSkeleton;
