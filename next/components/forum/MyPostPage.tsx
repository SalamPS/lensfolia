import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { IconPlus } from "@tabler/icons-react";
import { PostType } from "./ForumCard";
import MyPostCard from "./MyPostCard";
import Image from "next/image";

const MyPostPage = () => {
  // Mock data untuk postingan user
  const mockMyPosts = [
    {
      id: "1",
      title: "Masalah pada daun jagung menguning",
      content:
        "Tanaman jagung saya mengalami masalah dengan daun yang menguning dan layu. Sudah saya beri pupuk tapi tidak membaik. Ada yang tahu solusinya?",
      timeAgo: "2 jam yang lalu",
      type: "diseases" as PostType,
      tags: ["jagung", "penyakit", "daun"],
      comments: ["c1", "c2"],
      upvotes: ["u1", "u2", "u3"],
      downvotes: ["d1"],
      nullvotes: [],
      views: 124,
    },
    {
      id: "2",
      title: "Hama ulat pada tanaman tomat",
      content:
        "Saya menemukan banyak ulat kecil di tanaman tomat saya. Bagaimana cara mengatasinya secara organik?",
      timeAgo: "1 hari yang lalu",
      type: "pests" as PostType,
      tags: ["tomat", "hama", "ulat", "organik"],
      comments: ["c3", "c4", "c5"],
      upvotes: ["u4", "u5"],
      downvotes: [],
      nullvotes: ["n1"],
      views: 89,
    },
    {
      id: "3",
      title: "Tips merawat tanaman cabai di musim hujan",
      content:
        "Bagaimana cara merawat tanaman cabai agar tidak busuk akar saat musim hujan? Berbagi pengalaman saya selama 3 tahun bertani cabai.",
      timeAgo: "3 hari yang lalu",
      type: "general" as PostType,
      tags: ["cabai", "musim hujan", "perawatan"],
      imageUrl: ["/images/pepper1.jpg"],
      comments: ["c6", "c7", "c8", "c9"],
      upvotes: ["u6", "u7", "u8", "u9", "u10"],
      downvotes: ["d2"],
      nullvotes: [],
      views: 256,
    },
    {
      id: "4",
      title: "Pertanyaan tentang hidroponik untuk pemula",
      content:
        "Saya ingin mencoba hidroponik untuk pertama kalinya. Apa saja yang perlu dipersiapkan dan tanaman apa yang cocok untuk pemula?",
      timeAgo: "1 minggu yang lalu",
      type: "general" as PostType,
      tags: ["hidroponik", "pemula"],
      comments: ["c10"],
      upvotes: ["u11"],
      downvotes: [],
      nullvotes: [],
      views: 72,
    },
  ];

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

            {mockMyPosts.length > 0 ? (
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
                        <span>{mockMyPosts.length}</span> postingan
                      </p>
                    </div>
                  </div>
                </div>

                {/* filtering and my post cards container */}
                <div className="flex w-full flex-col">
                  {/* filtering */}
                  <div className="flex flex-col-reverse gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs defaultValue="all">
                      <TabsList className="w-full shrink-0 flex-wrap">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="general">Umum</TabsTrigger>
                        <TabsTrigger value="diseases">Penyakit</TabsTrigger>
                        <TabsTrigger value="pests">Hama</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <form className="flex w-full items-center justify-end gap-2 lg:w-auto">
                      <Input
                        placeholder="Cari postingan, topik atau tag..."
                        className="w-full md:w-96"
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
                    {mockMyPosts.map((post) => (
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
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Tampilan ketika tidak ada postingan */}
                <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
                  <Image
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
