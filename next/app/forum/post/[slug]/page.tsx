

import { PostContextProvider } from "@/components/forum/PostContext";
import PostPage from "@/components/forum/PostPage";
import Navbar from "@/components/home/Navbar";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  return <PostWithContext slug={slug} />;
}

const PostWithContext = ({slug}: {slug: string}) => {
  return (
    <PostContextProvider>
      <Navbar />
      <PostPage slug={slug} />
    </PostContextProvider>
  );
}