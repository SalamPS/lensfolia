// components/encyclopedia/EncyclopediaDetail.tsx
import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { EncyclopediaEntry } from "../types/encyclopedia";
import Navbar from "../home/Navbar";
import ReactMarkdown from "react-markdown";

interface EncyclopediaDetailProps {
  data: EncyclopediaEntry;
}

const EncyclopediaDetail: React.FC<EncyclopediaDetailProps> = ({ data }) => {
  return (
    <>
      <Navbar />
      <section className="bg-background">
        <div className="container mt-12 mx-auto max-w-4xl px-4 py-8">
          {/* Tombol Kembali */}
          <div className="mb-6">
            <Link href="/encyclopedia">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>

          {/* Header Artikel */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant={data.type === "pests" ? "destructive" : data.type === "diseases" ? "warning" : "default"}>
                {data.type}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {new Date(data.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {data.description}
            </p>
          </div>

          {/* Gambar Utama */}
          <div className="relative mx-auto mb-8 aspect-video w-3/4 overflow-hidden rounded-lg">
            <Image
              src={data.imageUrl}
              alt={data.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Konten Artikel */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {/* Render MD */}
            <section className="mb-8 text-justify">
              {data.content ? (
                <ReactMarkdown>
                  {
                    data.content
                      .replace(/\\n/g, "\n")
                      .split("\n")
                      .slice(1)
                      .join("\n")
                  }
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">
                  Tidak ada konten tambahan tersedia.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </>
  );
};

export default EncyclopediaDetail;
