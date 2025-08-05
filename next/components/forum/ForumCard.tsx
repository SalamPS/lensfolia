import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconEye,
  IconMessageCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

export type PostType = "diseases" | "pests" | "general";

interface ForumCardProps {
  id: string;
  title: string;
  content: string;
  authorImg: string;
  author: string;
  timeAgo: string;
  type: PostType;
  tags: string[];
  commentCount: number;
  upvoteCount: number;
  downvoteCount: number;
  viewsCount: number;
}

const typeStyles: Record<
  PostType,
  { bg: string; text: string; border: string }
> = {
  diseases: {
    bg: "bg-blue-500/20",
    text: "text-blue-500 dark:text-blue-300",
    border: "border-blue-500 dark:border-blue-300",
  },
  pests: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-500 dark:text-yellow-300",
    border: "border-yellow-500 dark:border-yellow-300",
  },
  general: {
    bg: "bg-green-500/20",
    text: "text-green-500 dark:text-green-300",
    border: "border-green-500 dark:border-green-300",
  },
};

const ForumCard = ({
  id,
  title,
  content,
  authorImg,
  author,
  timeAgo,
  type,
  tags,
  commentCount,
  upvoteCount: initialUpvoteCount,
  downvoteCount: initialDownvoteCount,
  viewsCount,
}: ForumCardProps) => {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const handleUpvote = () => {
    if (userVote === "up") {
      setUpvoteCount((prev) => prev - 1);
      setUserVote(null);
    } else if (userVote === "down") {
      setUpvoteCount((prev) => prev + 1);
      setDownvoteCount((prev) => prev - 1);
      setUserVote("up");
    } else {
      setUpvoteCount((prev) => prev + 1);
      setUserVote("up");
    }
  };

  const handleDownvote = () => {
    if (userVote === "down") {
      setDownvoteCount((prev) => prev - 1);
      setUserVote(null);
    } else if (userVote === "up") {
      setDownvoteCount((prev) => prev + 1);
      setUpvoteCount((prev) => prev - 1);
      setUserVote("down");
    } else {
      setDownvoteCount((prev) => prev + 1);
      setUserVote("down");
    }
  };


  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={authorImg} />
            </Avatar>
            <div>
              <p className="font-medium">{author}</p>
              <p className="text-muted-foreground text-sm">{timeAgo}</p>
            </div>
          </div>
          <div
            className={cn(
              "flex h-fit w-fit items-center justify-center rounded-full px-4 py-2 font-mono text-sm font-bold uppercase",
              typeStyles[type].bg,
              typeStyles[type].text,
              typeStyles[type].border,
              "border",
            )}
          >
            {type}
          </div>
        </div>

        {/* Konten postingan */}
        <Link href={`/forum/post/${id}`}>
          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold hover:underline">
              {title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {content}
            </p>
          </div>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="dark:bg-card bg-input text-foreground rounded px-3 py-2 text-sm"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 font-mono">
          <div
            className={cn(
              "hover:bg-input text-foreground hover:text-accent-foreground dark:hover:bg-accent/50 inline-flex items-center justify-center gap-2",
              userVote === "up" &&
                "bg-green-500/20 text-green-500 dark:text-green-300",
            )}
            onClick={handleUpvote}
          >
            <IconArrowBigUpLines size={16} />
            <span>{upvoteCount}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2",
              userVote === "down" &&
                "bg-red-500/20 text-red-500 dark:text-red-300",
            )}
            onClick={handleDownvote}
          >
            <IconArrowBigDownLines size={16} />
            <span>{downvoteCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <IconMessageCircle size={16} />
            <span>{commentCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <IconEye size={16} />
            <span>{viewsCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
