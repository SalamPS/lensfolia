"use client";

import React, { useState } from "react";
import {
  IconArrowBigDownLines,
  IconArrowBigUpLines,
  IconEye,
  IconMessageCircle,
  IconEdit,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PostType } from "./ForumCard";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface MyPostCardProps {
  id: string;
  title: string;
  content: string;
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

const MyPostCard = ({
  id,
  title,
  content,
  timeAgo,
  type,
  tags,
  comments,
  upvotes,
  downvotes,
  //   nullvotes,
  views,
}: MyPostCardProps) => {
 const [isDeleting, setIsDeleting] = useState(false); 

 const handleDelete = async () => {
   setIsDeleting(true);
   try {
     console.log(`Menghapus postingan dengan ID: ${id}`);
     // Simulasi proses penghapusan
     await new Promise((resolve) => setTimeout(resolve, 1000));
     // Logika penghapusan 
   } catch (error) {
     console.error("Gagal menghapus postingan:", error);
   } finally {
     setIsDeleting(false);
   }
 };

  return (
    <div className="bg-background border-border rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex w-full justify-between items-center">
          <div>
            <p className="text-muted-foreground text-sm">{timeAgo}</p>
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
          <div className="cursor-pointer space-y-2">
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
              className="dark:bg-muted bg-input text-foreground/70 rounded px-3 py-1 text-xs font-semibold uppercase"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Stats */}
          <div className="flex items-center gap-2">
            {/* Votes */}
            <div className="dark:bg-card bg-input flex items-center justify-between gap-2 rounded-full p-1 pr-4">
              {/* Upvote */}
              <div className="flex items-center gap-1">
                <div className="rounded-full p-1.5">
                  <IconArrowBigUpLines size={18} />
                </div>
                <span className="text-xs">{upvotes.length || 0}</span>
              </div>

              {/* Downvote */}
              <div className="flex items-center gap-1">
                <div className="rounded-full p-1.5">
                  <IconArrowBigDownLines size={18} />
                </div>
                <span className="text-xs">{downvotes.length || 0}</span>
              </div>
            </div>

            {/* Comments */}
            <div className="dark:bg-card bg-input rounded-full px-3 py-[10px]">
              <div className="flex items-center gap-1">
                <IconMessageCircle size={18} />
                <span className="text-xs">
                  {comments.length}{" "}
                  <span className="hidden md:inline">Komentar</span>
                </span>
              </div>
            </div>

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

          {/* Edit Button */}
          {/* page desainnya sama kaya yang create ceritanya */}
          <div className="flex w-full items-center justify-end gap-2 md:w-fit">
            <Link href={`/forum/edit-post/${id}`}>
              <Button variant="outline" className="gap-2">
                <IconEdit size={16} />
                Edit
              </Button>
            </Link>

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Aksi ini tidak dapat dibatalkan. Postingan{" "}
                    <span className="text-foreground font-bold">{title}</span> akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPostCard;
