import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconEye,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  comments: string[];
  upvotes: string[];
  downvotes: string[];
  views: number;
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
  comments,
  upvotes: initialUpvoteCount,
  downvotes: initialDownvoteCount,
  views,
}: ForumCardProps) => {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount.length);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount.length);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const router = useRouter();

  const handleUpvote = () => {
    if (userVote === "up") {
      // setUpvoteCount((prev) => prev - 1);
      setUserVote(null);
    } else if (userVote === "down") {
      // setUpvoteCount((prev) => prev + 1);
      // setDownvoteCount((prev) => prev - 1);
      setUserVote("up");
    } else {
      // setUpvoteCount((prev) => prev + 1);
      setUserVote("up");
    }
  };

  const handleDownvote = () => {
    if (userVote === "down") {
      // setDownvoteCount((prev) => prev - 1);
      setUserVote(null);
    } else if (userVote === "up") {
      // setDownvoteCount((prev) => prev + 1);
      // setUpvoteCount((prev) => prev - 1);
      setUserVote("down");
    } else {
      // setDownvoteCount((prev) => prev + 1);
      setUserVote("down");
    }
  };

  const goToPostHandler = async (cid?: string) => {
    const { error } = await supabase
      .from('forums')
      .update({ views: views + 1 })
      .eq('id', id);
    if (error) {
      console.error("Error updating views:", error);
      return;
    }
    router.push(`/forum/post/${id}${cid ? `#d-${cid}` : ""}`);
  }

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
        <div onClick={() => {goToPostHandler();}} className="cursor-pointer">
          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold hover:underline">
              {title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {content}
            </p>
          </div>
        </div>

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
        <div className="flex flex-wrap items-center pt-2 font-mono">
            <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2",
              userVote === "up" &&
              "bg-green-500/20 text-green-500 dark:text-green-300",
            )}
            onClick={handleUpvote}
            >
            <IconArrowBigUpLines size={16} />
            <span>{upvoteCount || 0}</span>
            </Button>
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
            <span>{downvoteCount || 0}</span>
          </Button>
          <Button onClick={() => {goToPostHandler(comments[comments.length-1]);}} variant="ghost" size="sm" className="gap-2">
            <IconMessageCircle size={16} />
            <span>{comments.length}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <IconEye size={16} />
            <span>{views}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
