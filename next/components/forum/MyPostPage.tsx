"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useContext } from "react";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { IconPlus } from "@tabler/icons-react";
import MyPostCard from "./MyPostCard";
import { ForumPost } from "./MockData";
import { ForumConverter, ForumQueryWithID } from "./ForumQueryUtils";
import ForumCardSkeleton from "./ForumCardSkeleton";
import { PostContext } from "./PostContext";

const MyPostPage = () => {
  const [forumPosts, setForumPosts] = React.useState<ForumPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const {user, refresh} = useContext(PostContext)

  // Filter dan search logic
  const filteredPosts = React.useMemo(() => {
    let filtered = forumPosts;

    // Filter by type
    if (activeFilter !== "all") {
      filtered = filtered.filter(post => post.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [forumPosts, activeFilter, searchQuery]);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const response = await ForumQueryWithID(user.id);
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalForm: ForumPost[] = response.map((post: any) =>
          ForumConverter(post),
        );
        setForumPosts(finalForm);
      }
      setLoading(false);
    })();
  }, [user, refresh]);

  if (loading) {
    return (
      <section className="bg-background flex min-h-screen w-full justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col justify-center gap-6">
            <Link href="/forum">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>

            {/* Skeleton Header */}
            <div className="my-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-card animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-32 rounded bg-zinc-300 dark:bg-card animate-pulse" />
                <div className="h-4 w-20 rounded bg-zinc-300 dark:bg-card animate-pulse" />
              </div>
            </div>

            {/* Skeleton Filtering */}
            <div className="flex flex-col-reverse gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="h-10 w-80 rounded bg-zinc-300 dark:bg-card animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 w-80 rounded bg-zinc-300 dark:bg-card animate-pulse" />
                <div className="h-10 w-32 rounded bg-zinc-300 dark:bg-card animate-pulse" />
              </div>
            </div>

            {/* Skeleton Cards */}
            <div className="mt-6 grid gap-4">
              {[...Array(3)].map((_, index) => (
                <ForumCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-background flex min-h-screen w-full justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-7xl">
          {/* header container */}
          <div className="flex flex-col justify-center gap-6">
            <Link href="/forum">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>

            {forumPosts.length > 0 ? (
              <>
                {/* Tampilan ketika ada postingan */}
                <div className="my-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/globe.svg" alt="User Avatar" />
                  </Avatar>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">Postingan Saya</h1>
                    <div className="text-muted-foreground text-sm">
                      <p>
                        <span>{forumPosts.length}</span> postingan • <span>{filteredPosts.length}</span> ditampilkan
                      </p>
                    </div>
                  </div>
                </div>

                {/* filtering and my post cards container */}
                <div className="flex w-full flex-col">
                  {/* filtering */}
                  <div className="flex flex-col-reverse gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                      <TabsList className="w-full shrink-0 flex-wrap">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="general">Umum</TabsTrigger>
                        <TabsTrigger value="diseases">Penyakit</TabsTrigger>
                        <TabsTrigger value="pests">Hama</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <form className="flex w-full items-center justify-end gap-2 lg:w-auto" onSubmit={(e) => e.preventDefault()}>
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

                  {/* my post cards */}
                  <div className="mt-6 grid gap-4">
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <MyPostCard
                          key={post.id}
                          id={post.id}
                          title={post.title}
                          content={post.content}
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
                      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
                        <img
                          src="/not-found.svg"
                          alt="No posts found"
                          width={200}
                          height={200}
                          className="opacity-70"
                        />
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">
                            Tidak Ada Postingan Ditemukan
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            Tidak ada postingan yang sesuai dengan filter atau pencarian Anda.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setActiveFilter("all");
                          }}
                        >
                          Reset Filter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Tampilan ketika tidak ada postingan */}
                <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
                  <img
                    src="/not-found-404.svg"
                    alt="No posts found"
                    width={300}
                    height={300}
                    className="opacity-70"
                  />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">
                      Belum Ada Postingan
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                      Anda belum membuat postingan apapun. Mulai berbagi
                      pengetahuan atau pengalaman Anda dengan komunitas kami!
                    </p>
                  </div>
                  <Link href="/forum/new-post">
                    <Button className="gap-2">
                      <IconPlus size={16} />
                      Buat Postingan Pertama
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default MyPostPage;
