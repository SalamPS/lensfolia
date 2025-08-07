"use client";

import React, { useContext, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconMessageCircle,
  IconEye,
  IconPaperclip,
} from "@tabler/icons-react";
import CommentItem from "./CommentItem";
import {
  ForumCommentConverter,
  ForumConverter,
  ForumDetailQuery,
} from "./ForumQueryUtils";
import { Comment, ForumPost } from "./MockData";
import { notFound } from "next/navigation";
import { PostContext } from "./PostContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useVote } from "../../hooks/useVote";

const PostPage = ({ slug }: { slug: string }) => {
  const [post, setPost] = React.useState<ForumPost | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentContent, setCommentContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const { refresh, setRefresh } = useContext(PostContext);
  const { user } = useAuth();
  const rating = useVote({ user })

  useEffect(() => {
    (async () => {
      const response = await ForumDetailQuery(slug.split("#")[0]);
      if (!response) {
        setIsLoading(false);
        return;
      }
      const response_post = ForumConverter(response[0]);
      const response_comments = ForumCommentConverter(response[0]);
      setPost(response_post);
      setComments(response_comments);
      setIsLoading(false);
      rating.syncVote({
        initialUpvotes: response_post.upvotes as string[],
        initialDownvotes: response_post.downvotes as string[],
        initialNullvotes: response_post.nullvotes as string[],
        id: response_post.id,
        title: response_post.title,
        authorId: response_post.authorId,
        reference: "forum",
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refresh, slug]);

  const handleCommentSubmit = async () => {
    if (!user) {
      alert("Please log in to reply.");
      return;
    }
    if (!post) {
      console.error("Post not found");
      return;
    }
    const submitted = await supabase.from("forums_discussions").insert({
      content: commentContent,
      media_url: null,
      forums_ref: post.id,
    });
    if (submitted.error) {
      console.error("Error submitting reply:", submitted.error);
      return;
    }
    setRefresh((prev) => prev + 1);
    setCommentContent("");
  };

  if (!isLoading && !post) return notFound();

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto mt-16 max-w-4xl">
        <Link href="/forum">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        {/* Post Header */}
        <div className="mt-4 mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Avatar>
              <AvatarImage src={post?.authorImg} />
            </Avatar>
            <div>
              <p className="font-medium">{post?.author}</p>
              <p className="text-muted-foreground text-sm">{post?.timeAgo}</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold">{post?.title}</h1>

          <div className="my-4">
            <p className="text-muted-foreground">{post?.content}</p>
          </div>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap gap-1">
            {post?.tags.map((tag, index) => (
              <span
                key={index}
                className="dark:bg-muted bg-input text-foreground/70 rounded px-3 py-1 text-xs font-semibold uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Post Stats */}
          <div className="flex items-center gap-2">
            {/* votes */}
            <div className="dark:bg-card bg-input flex items-center justify-between gap-2 rounded-full p-1 pr-4">
              {/* up */}
              <div className="flex items-center gap-1">
                <div className="group rounded-full p-2 transition-colors hover:bg-green-500/10"
                  onClick={() => rating.upVote()}>
                  <IconArrowBigUpLines
                    size={18}
                    className="group-hover:text-green-500"
                  />
                </div>
                <span className="text-sm">{rating.getUpVoteCount()}</span>
              </div>

              {/* down */}
              <div className="flex items-center gap-1">
                <div className="group rounded-full p-2 transition-colors hover:bg-red-500/10"
                  onClick={() => rating.downVote()}>
                  <IconArrowBigDownLines
                    size={18}
                    className="group-hover:text-red-500"
                  />
                </div>
                <span className="text-sm">{rating.getDownVoteCount()}</span>
              </div>
            </div>

            {/* comments */}
            <div className="dark:bg-card bg-input rounded-full px-3 py-3">
              <div className="flex items-center gap-1">
                <IconMessageCircle size={18} />
                <span className="text-sm">
                  {post?.comments.length}{" "}
                  <span className="hidden md:inline">Komentar</span>
                </span>
              </div>
            </div>

            {/* views */}
            <div className="dark:bg-card bg-input rounded-full px-3 py-3">
              <div className="flex items-center gap-1">
                <IconEye size={18} />
                <span className="text-sm">
                  {post?.views}{" "}
                  <span className="hidden md:inline">Dilihat</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Tambah Komentar</h3>
          <div className="flex flex-col gap-2">
            {/* Textarea komentar */}
            <Textarea
              className="mb-1"
              rows={4}
              placeholder="Tulis komentar Anda..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />

            {/* Baris tombol */}
            <div className="flex items-center justify-between">
              {/* Tombol upload file */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2 rounded-full"
                  size="icon"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <IconPaperclip size={20} />
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        console.log("File selected:", e.target.files[0]);
                        // Handle file upload logic here
                      }
                    }}
                  />
                </Button>
              </div>

              {/* Tombol kirim */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCommentContent("");
                    //  setSelectedFile(null);
                  }}
                  disabled={!commentContent.trim()} //&& !selectedFile
                >
                  Batal
                </Button>
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!commentContent.trim()}
                >
                  Kirim
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            {comments.length} Komentar
          </h3>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                return (
                  <CommentItem key={comment.id} {...comment} />
                );
              })}
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
