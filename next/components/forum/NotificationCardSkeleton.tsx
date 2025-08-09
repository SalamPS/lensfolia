import React from "react";

const NotificationCardSkeleton = () => {
  return (
    <div className="dark:bg-card/20 rounded-xl bg-zinc-300/20 p-4 transition-all">
      <div className="flex animate-pulse gap-3">
        {/* Avatar */}
        <div className="dark:bg-card h-12 w-12 rounded-full bg-zinc-300" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Title and time */}
          <div className="flex items-start justify-between">
            <div className="dark:bg-card h-4 w-2/3 rounded bg-zinc-300" />
            <div className="dark:bg-card h-3 w-16 rounded bg-zinc-300" />
          </div>
          
          {/* Message content */}
          <div className="space-y-1">
            <div className="dark:bg-card h-4 w-full rounded bg-zinc-300" />
            <div className="dark:bg-card h-4 w-5/6 rounded bg-zinc-300" />
          </div>
          
          {/* Post title */}
          <div className="dark:bg-card h-3 w-3/4 rounded bg-zinc-300" />
        </div>
      </div>
    </div>
  );
};

export default NotificationCardSkeleton;
