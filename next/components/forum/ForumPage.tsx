"use client";

import React from "react";
import StaticBG from "../StaticBG";
import { Button } from "../ui/button";
import { IconBell, IconMessage2Share, IconPlus } from "@tabler/icons-react";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import ForumCard from "./ForumCard";
import ForumCardSkeleton from "./ForumCardSkeleton";
import Image from "next/image";
import { ForumPost } from "./MockData";
import { ForumConverter, ForumQuery } from "./ForumQueryUtils";
import Link from "next/link";

const ForumPage = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<
    "all" | "general" | "diseases" | "pests"
  >("all");
  const [loading, setLoading] = React.useState(true);
  const [forumPosts, setForumPosts] = React.useState<ForumPost[]>([]);

  const postsPerPage = 5;

  // Simulasi skeleton
  React.useEffect(() => {
    (async () => {
      const response = await ForumQuery();
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalForm: ForumPost[] = response.map((post: any) => ForumConverter(post));
        setForumPosts(finalForm);
      }
      setLoading(false);
    })();
  }, []);

  const filteredByTab =
    activeTab === "all"
      ? forumPosts
      : forumPosts.filter((post) => post.type === activeTab);

  const filteredPosts = filteredByTab.filter((post) => {
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  return (
    <>
      <StaticBG>
        <div className="justify-centerp-4 z-10 mx-auto flex w-full items-center p-4">
          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex w-full items-center gap-2">
              <div className="flex flex-col items-start justify-center gap-2 md:gap-4">
                <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
                  Forum LensFolia
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm text-pretty">
                  Terhubung bersama, berbagi pengalaman, dan mendapatkan saran.
                </p>
              </div>
            </div>
            <div className="flex w-full items-center justify-start gap-2 md:justify-end">
              <div className="flex flex-col items-start gap-2 md:flex-row md:justify-end">
                <Button variant="outline">
                  <IconMessage2Share />
                  Postingan Saya
                </Button>
                <Button variant="outline">
                  <IconBell />
                  Notifikasi Balasan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </StaticBG>

      {/* forum section */}
      <section className="bg-background min-h-screen p-4">
        <div className="mx-auto flex w-full flex-col gap-4 md:max-w-7xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col-reverse gap-2 lg:flex-row lg:items-center lg:justify-between">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={(val) =>
                  setActiveTab(val as "all" | "general" | "diseases" | "pests")
                }
              >
                <TabsList className="w-full shrink-0 flex-wrap">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="general">Umum</TabsTrigger>
                  <TabsTrigger value="diseases">Penyakit</TabsTrigger>
                  <TabsTrigger value="pests">Hama</TabsTrigger>
                </TabsList>
              </Tabs>

              <form
                className="flex w-full items-center justify-end gap-2 lg:w-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  placeholder="Cari postingan, topik atau tag..."
                  className="w-full md:w-96"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link href="/forum/new-post">
                  <Button variant="default" className="gap-2 shadow-lg">
                    <IconPlus size={16} />
                    Buat postingan
                  </Button>
                </Link>
              </form>
            </div>

            {/* Daftar Postingan */}
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                Array.from({ length: postsPerPage }).map((_, index) => (
                  <ForumCardSkeleton key={index} />
                ))
              ) : currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <ForumCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    authorImg={post.authorImg}
                    authorId={post.authorId}
                    author={post.author}
                    timeAgo={post.timeAgo}
                    type={post.type}
                    tags={post.tags}
                    comments={post.comments}
                    upvotes={post.upvotes}
                    downvotes={post.downvotes}
                    nullvotes={post.nullvotes}
                    views={post.views}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                  <Image
                    src="/not-found-404.svg"
                    alt="Not found"
                    width={200}
                    height={200}
                    className="rounded-2xl"
                  />
                  <h3 className="text-xl font-semibold">
                    Data tidak ditemukan
                  </h3>
                  <p className="text-muted-foreground max-w-md text-center">
                    Tidak ada entri yang cocok dengan pencarian atau filter
                    Anda. Coba gunakan kata kunci lain atau atur ulang.
                  </p>
                </div>
              )}
            </div>

            <Pagination className="my-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages || totalPages === 0
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForumPage;
