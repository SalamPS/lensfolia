
import EncyclopediaDetail from "@/components/encyclopedia/EncyclopediaDetail";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mapEncyclopediaEntryDBToEntry } from "@/components/types/encyclopedia";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EncyclopediaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const { data, error } = await supabase
    .from("encyclopedia")
    .select("*")
    .eq("id", slug)
    .single();

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const entry = mapEncyclopediaEntryDBToEntry(data);
  if (!entry) {
    return notFound();
  }

  return <EncyclopediaDetail data={entry} />;
}

export async function generateStaticParams() {
  const { data: supabaseData, error } = await supabase
    .from("encyclopedia")
    .select("id");

  if (error) {
    return [];
  }

  return supabaseData.map((entry) => ({
    slug: entry.id.toString(),
  }));
}
