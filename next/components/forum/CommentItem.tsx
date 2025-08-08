import React, { useContext, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconMessageCircle,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { PostContext } from "./PostContext";
import { cn } from "@/lib/utils";
import { useVote } from "@/hooks/useVote";

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
  postId?: string; // Add postId prop
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
  postId, // Add postId parameter
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");
  const { setRefresh, user } = useContext(PostContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const rating = useVote({ user });

  useEffect(() => {
    rating.syncVote({
      initialUpvotes: upvotes,
      initialDownvotes: downvotes,
      initialNullvotes: nullvotes,
      id,
      title: content,
      authorId,
      reference: isReply ? "comment" : "discussion",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upvotes, downvotes, nullvotes, id, content, authorId]);

  const handleReplySubmit = async () => {
    if (!user) {
      alert("Please log in to reply.");
      return;
    }
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    const submitted = await supabase
      .from("forums_comments")
      .insert({
        content: replyContent,
        media_url: null,
        comments_ref: isReply ? id : null,
        discussions_ref: isReply ? isReply : id,
      })
      .select(); // Add select to get returned data
    
    if (submitted.error) {
      console.error("Error submitting reply:", submitted.error);
      return;
    }

    // Trigger notification to the author of the comment being replied to via API
    if (submitted.data && submitted.data.length > 0 && postId) {
      try {
        await fetch('/api/v1/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriber: authorId,
            created_by: user.id,
            content_type: 'comments',
            content_uri: `/forum/post/${postId}${isReply ? `#d-${isReply}` : ''}#c-${id}`,
            ref_comments: id,
            ori_discussion: isReply ? isReply : id,
            ori_comments: id
          })
        });
      } catch (error) {
        console.error('Error creating comment reply notification:', error);
        // Don't fail the reply submission if notification fails
      }
    }

    setRefresh((prev) => prev + 1);
    setReplyContent("");
    setShowReplyForm(false);
    setIsLoading(false);
  };

  return (
    <div
      className={`mb-4 ${!isReply ? "border-border bg-card rounded-lg border p-4" : ""}`}
      id={`${!isReply ? "d" : "c"}-${id}`}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={authorImg} />
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap jus items-center gap-2">
            <h4 className="font-medium">{author}</h4>
            <span className="bg-muted-foreground my-auto rounded-full w-1 h-1 hidden md:inline"></span>
            <span className="text-muted-foreground text-xs md:text-sm">{timeAgo}</span>
          </div>
          <p className="my-2 text-sm">{content}</p>

          <div className="flex items-center gap-2">
            {/* Votes */}
            <div className="dark:bg-card bg-input flex items-center justify-between gap-2 rounded-full p-1 pr-4">
              {/* Upvote */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  rating.getUserVote() === "up" &&
                    "text-green-500 dark:text-green-300",
                )}
              >
                <button
                  className={cn(
                    "group rounded-full p-1.5 transition-colors hover:bg-green-500/10",
                    rating.getUserVote() === "up" && "bg-green-500/20",
                  )}
                  onClick={rating.upVote}
                >
                  <IconArrowBigUpLines
                    size={18}
                    className={cn(
                      "group-hover:text-green-500",
                      rating.getUserVote() === "up" &&
                        "text-green-500 dark:text-green-300",
                    )}
                  />
                </button>
                <span className="text-xs">{rating.getUpVoteCount() || 0}</span>
              </div>

              {/* Downvote */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  rating.getUserVote() === "down" &&
                    "text-red-500 dark:text-red-300",
                )}
              >
                <button
                  className={cn(
                    "group rounded-full p-1.5 transition-colors hover:bg-red-500/10",
                    rating.getUserVote() === "down" && "bg-red-500/20",
                  )}
                  onClick={rating.downVote}
                >
                  <IconArrowBigDownLines
                    size={18}
                    className={cn(
                      "group-hover:text-red-500",
                      rating.getUserVote() === "down" &&
                        "text-red-500 dark:text-red-300",
                    )}
                  />
                </button>
                <span className="text-xs">
                  {rating.getDownVoteCount() || 0}
                </span>
              </div>
            </div>

            {/* Reply Button */}
            <button
              className="dark:bg-card bg-input hover:bg-foreground/15 rounded-full px-3 py-[7px] transition-colors"
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
                <Button size="sm" onClick={handleReplySubmit} disabled={isLoading}>
                    {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                    "Kirim"
                    )}
                </Button>
              </div>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4">
              {replies.map((reply) => (
                <CommentItem key={reply.id} {...reply} isReply={id} postId={postId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
