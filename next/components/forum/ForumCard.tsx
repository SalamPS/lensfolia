import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

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
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes.length);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvotes.length);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [userVoted, setUserVoted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const upvoted = initialUpvotes.includes(user.id);
      const downvoted = initialDownvotes.includes(user.id);
      const nullvoted = initialNullvotes?.includes(user.id) || false;
      setUserVote(upvoted ? "up" : downvoted ? "down" : null);
      setUserVoted(upvoted || downvoted || nullvoted);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleUpvote = async () => {
    if (!user) {
      alert("Please log in to vote.");
      return;
    }
    let result: PostgrestSingleResponse<null> = {
      error: null,
      data: null,
      count: null,
      status: 200,
      statusText: "OK",
    };
    if (userVoted) {
      if (userVote === "up") {
        setUpvoteCount((prev) => prev - 1);
        setUserVote(null);
        result = await supabase
          .from("rating")
          .update({ is_upvote: null })
          .eq("ref_forums", id)
          .eq("created_by", user.id);
      } else if (userVote === "down") {
        setUpvoteCount((prev) => prev + 1);
        setDownvoteCount((prev) => prev - 1);
        setUserVote("up");
        result = await supabase
          .from("rating")
          .update({ is_upvote: true })
          .eq("ref_forums", id)
          .eq("created_by", user.id);
      } else {
        setUpvoteCount((prev) => prev + 1);
        setUserVote("up");
        result = await supabase
          .from("rating")
          .update({ is_upvote: true })
          .eq("ref_forums", id)
          .eq("created_by", user.id);
      }
    } else {
      setUpvoteCount((prev) => prev + 1);
      result = await supabase
        .from("rating")
        .insert({
          ref_forums: id,
          content: title.length > 30 ? `${title.slice(0, 30)}...` : title,
          content_creator: authorId,
          is_upvote: true,
        });
      if (result.error) {
        console.error("Error upvoting:", result.error);
        return;
      }
    }
    if (result.error) {
      console.error("Error upvoting:", result.error);
      setDownvoteCount(initialDownvotes.length);
      setUpvoteCount(initialUpvotes.length);
      return;
    }
    setUserVoted(true);
  };

  const handleDownvote = async () => {
    if (!user) {
      alert("Please log in to vote.");
      return;
    }
    let result: PostgrestSingleResponse<null> = {
      error: null,
      data: null,
      count: null,
      status: 200,
      statusText: "OK",
    };
    if (userVoted) {
      console.log(user);
      if (userVote === "down") {
        setDownvoteCount((prev) => prev - 1);
        setUserVote(null);
        result = await supabase
          .from("rating")
          .update({ is_upvote: null })
          .eq("ref_forums", id)
          .eq("created_by", user.id);
      } else if (userVote === "up") {
        setDownvoteCount((prev) => prev + 1);
        setUpvoteCount((prev) => prev - 1);
        setUserVote("down");
        result = await supabase
          .from("rating")
          .update({ is_upvote: false })
          .eq("ref_forums", id)
          .eq("created_by", user.id);
      } else {
        setDownvoteCount((prev) => prev + 1);
        setUserVote("down");
        result = await supabase
          .from("rating")
          .update({ is_upvote: false })
          .eq("ref_forums", id)
          .eq("created_by", user.id);
      }
    } else {
      setDownvoteCount((prev) => prev + 1);
      result = await supabase
        .from("rating")
        .insert({
          ref_forums: id,
          content: title.length > 30 ? `${title.slice(0, 30)}...` : title,
          content_creator: authorId,
          is_upvote: false,
        });
      if (result.error) {
        console.error("Error downvoting:", result.error);
        return;
      }
    }
    if (result.error) {
      console.error("Error downvoting:", result.error);
      setDownvoteCount(initialDownvotes.length);
      setUpvoteCount(initialUpvotes.length);
      return;
    }
    setUserVoted(true);
  };

  const goToPostHandler = async (cid?: string) => {
    const { error } = await supabase.rpc('insert_if_not_exists_forums_views', {
      forum_id: id,
      user_id: user?.id || null,
      anon_id: null
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
