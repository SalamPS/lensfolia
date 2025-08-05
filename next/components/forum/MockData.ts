import { PostType } from "./ForumCard";

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorImg: string;
  authorId: string;
  author: string;
  timeAgo: string;
  type: PostType;
  tags: string[];
  imageUrl?: string[];
  comments: string[];
  upvotes: string[];
  downvotes: string[];
  nullvotes: string[];
  views: number;
}

export interface ForumPostDetail {
  id: string;
  title: string;
  content: string;
  authorImg: string;
  authorId: string;
  author: string;
  timeAgo: string;
  type: PostType;
  tags: string[];
  imageUrl?: string[];
  comments: Comment[];
  upvotes: string[];
  downvotes: string[];
  nullvotes: string[];
  views: number;
}

export interface Comment {
  id: string;
  author: string;
  authorImg: string;
  authorId: string;
  timeAgo: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  nullvotes: string[];
  replies?: Comment[];
}