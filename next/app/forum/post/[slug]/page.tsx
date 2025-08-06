import { PostContextProvider } from "@/components/forum/PostContext";
import PostPage from "@/components/forum/PostPage";

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
      <PostPage slug={slug} />
    </PostContextProvider>
  );
}