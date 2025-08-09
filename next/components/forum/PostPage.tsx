/* eslint-disable @next/next/no-img-element */
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
  IconExternalLink,
} from "@tabler/icons-react";
import CommentItem from "./CommentItem";
import PostPageSkeleton from "./PostPageSkeleton";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const PostPage = ({ slug }: { slug: string }) => {
  const [post, setPost] = React.useState<ForumPost | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentContent, setCommentContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const { refresh, setRefresh } = useContext(PostContext);
  const { user } = useAuth();
  const rating = useVote({ user })
  const [selectedTab, setSelectedTab] = React.useState<"terbaru" | "terbaik">(
    "terbaru",
  );

const sortedComments = React.useMemo(() => {
  if (selectedTab === "terbaru") {
    return [...comments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  if (selectedTab === "terbaik") {
    return [...comments].sort((a, b) => b.upvotes.length - a.upvotes.length);
  }
  return comments;
}, [selectedTab, comments]);
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
    }).select();
    
    if (submitted.error) {
      console.error("Error submitting reply:", submitted.error);
      return;
    }

    // Trigger notification to post author via API
    if (submitted.data && submitted.data.length > 0) {
      try {
        await fetch('/api/v1/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriber: post.authorId,
            created_by: user.id,
            content_type: 'discussions',
            content_uri: `/forum/post/${post.id}#d-${submitted.data[0].id}`,
            ref_forums: post.id,
            ref_discussions: submitted.data[0].id
          })
        });
      } catch (error) {
        console.error('Error creating reply notification:', error);
        // Don't fail the comment submission if notification fails
      }
    }

    setRefresh((prev) => prev + 1);
    setCommentContent("");
  };

  if (!isLoading && !post) return notFound();

  if (isLoading) {
    return <PostPageSkeleton />;
  }

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

          {/* Post Image */}
          {post?.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post Image"
              className="w-full rounded-lg object-cover"
            />
          )}
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
          <div className="flex gap-4 justify-between flex-col md:flex-row">
            <div className="flex items-center gap-2">
              {/* votes */}
              <div className="dark:bg-card bg-input flex items-center justify-between gap-2 rounded-full p-1 pr-4">
                {/* up */}
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "group rounded-full p-2 transition-colors hover:bg-green-500/10",
                      rating.getUserVote() === "up" && "bg-green-500/20",
                    )}
                    onClick={() => rating.upVote()}
                  >
                    <IconArrowBigUpLines
                      size={18}
                      className="group-hover:text-green-500"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      rating.getUserVote() === "up" &&
                        "text-green-500 dark:text-green-300",
                    )}
                  >
                    {rating.getUpVoteCount()}
                  </span>
                </div>

                {/* down */}
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "group rounded-full p-2 transition-colors hover:bg-red-500/10",
                      rating.getUserVote() === "down" && "bg-red-500/20",
                    )}
                    onClick={() => rating.downVote()}
                  >
                    <IconArrowBigDownLines
                      size={18}
                      className="group-hover:text-red-500"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      rating.getUserVote() === "down" &&
                        "text-red-500 dark:text-red-300",
                    )}
                  >
                    {rating.getDownVoteCount()}
                  </span>
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
            {/* Diagnoses */}
            { post?.diagnoses_ref && (
            <div className="dark:bg-card bg-input rounded-full px-6 py-3 text-sm w-fit">
              <Link href={`/result/${post?.diagnoses_ref}`} className="flex gap-3">
                <span>
                  Diagnosa Terkait
                </span>
                <IconExternalLink size={18} className="inline-block"/>
              </Link>
            </div>)}
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
          <div className="mb-4 flex w-full items-center justify-between">
            <h3 className="text-lg font-semibold">
              {comments.length} Komentar
            </h3>
            <Tabs
              value={selectedTab}
              onValueChange={(val) =>
                setSelectedTab(val as "terbaru" | "terbaik")
              }
            >
              <TabsList className="w-full shrink-0 flex-wrap">
                <TabsTrigger value="terbaru">Terbaru</TabsTrigger>
                <TabsTrigger value="terbaik">Terbaik</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {sortedComments.length > 0 ? (
            <div className="space-y-4">
              {sortedComments.map((comment) => (
                <CommentItem key={comment.id} {...comment} postId={post?.id} />
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
