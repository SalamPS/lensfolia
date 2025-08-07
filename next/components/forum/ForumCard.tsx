import React, { useContext, useEffect } from "react";
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
import { useVote } from "@/hooks/useVote";
import { PostContext } from "./PostContext";

export type PostType = "diseases" | "pests" | "general";

interface ForumCardProps {
  id: string;
  title: string;
  content: string;
  authorImg: string;
  authorId: string;
  author: string;
  timeAgo: string;
  type: PostType;
  tags: string[];
  comments: string[];
  upvotes: string[];
  downvotes: string[];
  nullvotes: string[];
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
  authorId,
  author,
  timeAgo,
  type,
  tags,
  comments,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  nullvotes: initialNullvotes,
  views,
}: ForumCardProps) => {
  const { user, anonUser } = useContext(PostContext);
  const router = useRouter();
  const rating = useVote({ user });

  useEffect(() => {
    rating.syncVote({
      initialUpvotes: initialUpvotes,
      initialDownvotes: initialDownvotes,
      initialNullvotes: initialNullvotes,
      id,
      title,
      authorId,
      reference: "forum",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, title, authorId, initialUpvotes, initialDownvotes, initialNullvotes]);

  const goToPostHandler = async (cid?: string) => {
    const { error } = await supabase.rpc('insert_if_not_exists_forums_views', {
      forum_id: id,
      user_id: user?.id || null,
      anon_id: anonUser?.id || null,
    });
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
        <div
          onClick={() => {
            goToPostHandler();
          }}
          className="cursor-pointer"
        >
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
              className="dark:bg-muted bg-input text-foreground/70 rounded px-3 py-1 text-xs font-semibold uppercase"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Votes */}
          <div className="dark:bg-card bg-input flex items-center justify-between gap-2 rounded-full p-1 pr-4">
            {/* Upvote */}
            <div
              className={cn(
                "flex items-center gap-1",
                rating.getUserVote() === "up" && "text-green-500 dark:text-green-300",
              )}
            >
              <button
                className={cn(
                  "group cursor-pointer rounded-full p-1.5 transition-colors hover:bg-green-500/10",
                  rating.getUserVote() === "up" && "bg-green-500/20",
                )}
                onClick={rating.upVote}
              >
                <IconArrowBigUpLines
                  size={18}
                  className={cn(
                    "text-xs group-hover:text-green-500",
                    rating.getUserVote() === "up" && "text-green-500 dark:text-green-300",
                  )}
                />
              </button>
              <span className="text-xs">{rating.getUpVoteCount() || 0}</span>
            </div>

            {/* Downvote */}
            <div
              className={cn(
                "flex items-center gap-1",
                rating.getUserVote() === "down" && "text-red-500 dark:text-red-300",
              )}
            >
              <button
                className={cn(
                  "group cursor-pointer rounded-full p-1.5 transition-colors hover:bg-red-500/10",
                  rating.getUserVote() === "down" && "bg-red-500/20",
                )}
                onClick={rating.downVote}
              >
                <IconArrowBigDownLines
                  size={18}
                  className={cn(
                    "group-hover:text-red-500",
                    rating.getUserVote() === "down" && "text-red-500 dark:text-red-300",
                  )}
                />
              </button>
              <span className="text-xs">{rating.getDownVoteCount() || 0}</span>
            </div>
          </div>

          {/* Comments */}
          <button
            className="dark:bg-card bg-input cursor-pointer rounded-full px-3 py-[10px] hover:bg-foreground/15 transition-colors"
            onClick={() => {
              goToPostHandler(comments[comments.length - 1]);
            }}
          >
            <div className="flex items-center gap-1">
              <IconMessageCircle size={18} />
              <span className="text-xs">
                {comments.length}{" "}
                <span className="hidden md:inline">Komentar</span>
              </span>
            </div>
          </button>

          {/* Views */}
          <div className="dark:bg-card bg-input rounded-full px-3 py-[10px]">
            <div className="flex items-center gap-1">
              <IconEye size={18} />
              <span className="text-xs">
                {views} <span className="hidden md:inline">Dilihat</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
