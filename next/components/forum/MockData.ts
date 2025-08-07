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
  diagnoses_ref?: string | null;
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
  diagnoses_ref?: string | null;
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

export interface Notification {
  id: string;
  type: "reply" | "mention"; // 'reply' buat balasan post, 'mention' buat mention di komentar
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timeAgo: string; //createdAt
  post: {
    id: string;
    title: string;
  };
  comment?: {
    id: string;
    content: string;
    isYourComment?: boolean; 
  };
  replyContent: string;
  isRead: boolean;
}
