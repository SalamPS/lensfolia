import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconMessageCircle,
} from "@tabler/icons-react";

interface CommentItemProps {
  id: string;
  author: string;
  authorImg: string;
  timeAgo: string;
  content: string;
  upvoteCount: number;
  downvoteCount: number;
  replies?: CommentItemProps[];
}

const CommentItem = ({
  id,
  author,
  authorImg,
  timeAgo,
  content,
  upvoteCount,
  downvoteCount,
  replies = [],
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");


    const handleUpvote = () => {
      console.log(`Upvoting comment ${id}`);
      
    };

    const handleDownvote = () => {
      console.log(`Downvoting comment ${id}`);
      
    };

    const handleReplySubmit = () => {
      console.log(`Replying to comment ${id} with:`, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    };

  return (
    <div
      className="border-border mb-4 rounded-lg border p-4"
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

          <div className="flex items-center gap-4">
            <Button
              onClick={handleUpvote}
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              <IconArrowBigUpLines size={16} />
              <span>{upvoteCount}</span>
            </Button>
            <Button
              onClick={handleDownvote}
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              <IconArrowBigDownLines size={16} />
              <span>{downvoteCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <IconMessageCircle size={16} />
              <span>Balas</span>
            </Button>
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
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
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
            <div className="mt-4 border-l-2 pl-4">
              {replies.map((reply) => (
                <CommentItem key={reply.id} {...reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
