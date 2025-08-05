"use client"

import React, { useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconMessageCircle,
  IconEye,
} from "@tabler/icons-react";
import CommentItem from "./CommentItem";
import { ForumCommentConverter, ForumConverter } from "./ForumQueryUtils";
import { supabase } from "@/lib/supabase";
import { Comment, ForumPost } from "./MockData";

const PostPage = ({slug}: {slug:string}) => {

  const [post, setPost] = React.useState<ForumPost | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentContent, setCommentContent] = React.useState("");
  
  useEffect(() => {
    (async () => {
      const response = await supabase
        .from("forums")
        .select(`*,
          user_profiles (
            name,
            profile_picture
          ),
          diagnoses(*),
          ratings(*),
          forums_discussions(*,
            user_profiles (
              name,
              profile_picture
            ),
            ratings(*),
            forums_comments(*,
              user_profiles (
                name,
                profile_picture
              ),
              ratings(*)
            )
          )
        `)
        .eq("id", slug.split("#")[0]);
      if (!response.data) {
        return
      }
      const response_post = ForumConverter(response.data[0]);
      const response_comments = ForumCommentConverter(response.data[0])
      setPost(response_post);
      setComments(response_comments);
      console.log(response_post, response_comments);
    })();
  }, [slug]);

  if (!post) return null;

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Post Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Avatar>
              <AvatarImage src={post.authorImg} />
            </Avatar>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-muted-foreground text-sm">{post.timeAgo}</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold">{post.title}</h1>

          <div className="my-4">
            <p className="text-muted-foreground">{post.content}</p>
          </div>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Post Stats */}
          <div className="flex items-center gap-4 border-t border-b py-3">
            <div className="flex items-center gap-1">
              <IconArrowBigUpLines size={18} />
              <span>{post.upvotes.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconArrowBigDownLines size={18} />
              <span>{post.downvotes.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconMessageCircle size={18} />
              <span>{post.comments.length} Komentar</span>
            </div>
            <div className="flex items-center gap-1">
              <IconEye size={18} />
              <span>{post.views} Dilihat</span>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Tambah Komentar</h3>
          <Textarea
            className="mb-3"
            rows={4}
            placeholder="Tulis komentar Anda..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button>Kirim</Button>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            {comments.length} Komentar
          </h3>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} {...comment} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              Belum ada komentar. Jadilah yang pertama berkomentar!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
