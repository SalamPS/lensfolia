
import EncyclopediaDetail from "@/components/encyclopedia/EncyclopediaDetail";
import { mockEncyclopediaData } from "@/components/encyclopedia/MockData";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function EncyclopediaDetailPage({ params }: PageProps) {
  // Cari data berdasarkan slug (ID)
  const entry = mockEncyclopediaData.find((item) => item.id === params.slug);

  // Jika tidak ditemukan, tampilkan 404
  if (!entry) {
    return notFound();
  }

  return <EncyclopediaDetail data={entry} />;
}

export async function generateStaticParams() {
  return mockEncyclopediaData.map((entry) => ({
    slug: entry.id,
  }));
}
