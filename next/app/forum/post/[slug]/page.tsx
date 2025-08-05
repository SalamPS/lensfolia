import PostPage from "@/components/forum/PostPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  return <PostPage slug={slug}/>;
}
