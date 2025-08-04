import PostPage from '@/components/forum/PostPage';
import { notFound } from 'next/navigation';
import { getPostDetail } from '@/components/forum/MockData';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostDetail(resolvedParams.slug);
  console.log("Post Detail:", post);

  if (!post) {
    return notFound();
  }

  return <PostPage params={resolvedParams} />;
}
