import React, { useContext } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconMessageCircle,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { PostContext } from "./PostContext";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  isReply?: string;
  id: string;
  author: string;
  authorId: string;
  authorImg: string;
  timeAgo: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  nullvotes: string[];
  replies?: CommentItemProps[];
}

const CommentItem = ({
  isReply = "",
  id,
  author,
  authorId,
  authorImg,
  timeAgo,
  content,
  upvotes,
  downvotes,
  nullvotes,
  replies = [],
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");

    const [upvoteCount, setUpvoteCount] = React.useState(upvotes.length);
    const [downvoteCount, setDownvoteCount] = React.useState(downvotes.length);
    const [userVote, setUserVote] = React.useState<"up" | "down" | null>(null);
    const [userVoted, setUserVoted] = React.useState(false);
    const { user } = useAuth();
    const { setRefresh } = useContext(PostContext);

    React.useEffect(() => {
      if (user) {
        const upvoted = upvotes.includes(user.id);
        const downvoted = downvotes.includes(user.id);
        const nullvoted = nullvotes?.includes(user.id) || false;
        setUserVote(upvoted ? "up" : downvoted ? "down" : null);
        setUserVoted(upvoted || downvoted || nullvoted);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleUpvote = async () => {
      if (!user) {
        alert("Please log in to vote.");
        return;
      }
      const REFERENCE = isReply ? "ref_comments" : "ref_discussions";
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
            .eq(REFERENCE, id)
            .eq("created_by", user.id);
        } else if (userVote === "down") {
          setUpvoteCount((prev) => prev + 1);
          setDownvoteCount((prev) => prev - 1);
          setUserVote("up");
          result = await supabase
            .from("rating")
            .update({ is_upvote: true })
            .eq(REFERENCE, id)
            .eq("created_by", user.id);
        } else {
          setUpvoteCount((prev) => prev + 1);
          setUserVote("up");
          result = await supabase
            .from("rating")
            .update({ is_upvote: true })
            .eq(REFERENCE, id)
            .eq("created_by", user.id);
        }
      } else {
        setUserVote("up");
        setUpvoteCount((prev) => prev + 1);
        result = await supabase
          .from("rating")
          .insert({
            [REFERENCE]: id,
            content: content.length > 30 ? `${content.slice(0, 30)}...` : content,
            content_creator: authorId,
            is_upvote: true,
          });
      }
      if (result.error) {
        console.error("Error upvoting:", result.error);
        setDownvoteCount(downvotes.length);
        setUpvoteCount(upvotes.length);
        return;
      }
      setUserVoted(true);
      setRefresh((prev) => prev + 1);
    };

    const handleDownvote = async () => {
      if (!user) {
        alert("Please log in to vote.");
        return;
      }
      const REFERENCE = isReply ? "ref_comments" : "ref_discussions";
      let result: PostgrestSingleResponse<null> = {
        error: null,
        data: null,
        count: null,
        status: 200,
        statusText: "OK",
      };

      if (userVoted) {
        if (userVote === "down") {
          setDownvoteCount((prev) => prev - 1);
          setUserVote(null);
          result = await supabase
            .from("rating")
            .update({ is_upvote: null })
            .eq(REFERENCE, id)
            .eq("created_by", user.id);
        } else if (userVote === "up") {
          setDownvoteCount((prev) => prev + 1);
          setUpvoteCount((prev) => prev - 1);
          setUserVote("down");
          result = await supabase
            .from("rating")
            .update({ is_upvote: false })
            .eq(REFERENCE, id)
            .eq("created_by", user.id);
        } else {
          setDownvoteCount((prev) => prev + 1);
          setUserVote("down");
          result = await supabase
            .from("rating")
            .update({ is_upvote: false })
            .eq(REFERENCE, id)
            .eq("created_by", user.id);
        }
      } else {
        setUserVote("down");
        setDownvoteCount((prev) => prev + 1);
        const setup = {
          [REFERENCE]: id,
          content: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
          content_creator: authorId,
          is_upvote: false,
        };
        result = await supabase
          .from("rating")
          .insert(setup);
      }
      if (result.error) {
        console.error("Error downvoting:", result.error);
        setDownvoteCount(downvotes.length);
        setUpvoteCount(upvotes.length);
        return;
      }
      setUserVoted(true);
      setRefresh((prev) => prev + 1);
    };

    const handleReplySubmit = async () => {
      if (!user) {
        alert("Please log in to reply.");
        return;
      }
      const submitted = await supabase
        .from("forums_comments")
        .insert({
          content: replyContent,
          media_url: null,
          discussions_ref: isReply || id,
        });
      if (submitted.error) {
        console.error("Error submitting reply:", submitted.error);
        return;
      }
      setRefresh((prev) => prev + 1);
      setReplyContent("");
      setShowReplyForm(false);
    };

  return (
    <div
      className={`mb-4 ${!isReply ? "border-border bg-card rounded-lg border p-4" : ""}`}
      id={`comment-${id}`}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={authorImg} />
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{author}</h4>
            <span className="text-muted-foreground text-sm">{timeAgo}</span>
          </div>
          <p className="my-2 text-sm">{content}</p>

          <div className="flex items-center gap-2">
            {/* Votes */}
            <div className="dark:bg-card bg-input flex items-center justify-between gap-2 rounded-full p-1 pr-4">
              {/* Upvote */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  userVote === "up" && "text-green-500 dark:text-green-300",
                )}
              >
                <button
                  className={cn(
                    "group rounded-full p-1.5 transition-colors hover:bg-green-500/10",
                    userVote === "up" && "bg-green-500/20",
                  )}
                  onClick={handleUpvote}
                >
                  <IconArrowBigUpLines
                    size={18}
                    className={cn(
                      "group-hover:text-green-500",
                      userVote === "up" && "text-green-500 dark:text-green-300",
                    )}
                  />
                </button>
                <span className="text-xs">{upvoteCount || 0}</span>
              </div>

              {/* Downvote */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  userVote === "down" && "text-red-500 dark:text-red-300",
                )}
              >
                <button
                  className={cn(
                    "group rounded-full p-1.5 transition-colors hover:bg-red-500/10",
                    userVote === "down" && "bg-red-500/20",
                  )}
                  onClick={handleDownvote}
                >
                  <IconArrowBigDownLines
                    size={18}
                    className={cn(
                      "group-hover:text-red-500",
                      userVote === "down" && "text-red-500 dark:text-red-300",
                    )}
                  />
                </button>
                <span className="text-xs">{downvoteCount || 0}</span>
              </div>
            </div>

            {/* Reply Button */}
            <button
              className="dark:bg-card bg-input rounded-full px-3 py-[7px] hover:bg-foreground/15 transition-colors"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <div className="flex items-center gap-1">
                <IconMessageCircle size={18} />
                <span className="text-xs">Balas</span>
              </div>
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <textarea
                className="border-border bg-background w-full rounded-lg border p-3 text-sm"
                rows={3}
                placeholder="Tulis balasan Anda..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="mt-1 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Batal
                </Button>
                <Button size="sm" onClick={handleReplySubmit}>
                  Kirim
                </Button>
              </div>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4">
              {replies.map((reply) => (
                <CommentItem key={reply.id} {...reply} isReply={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
