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
  created_at: string; // ⬅ tambah
  content: string;
  upvotes: string[];
  downvotes: string[];
  nullvotes: string[];
  replies?: Comment[];
}


export interface Notification {
  id: string;
  timeAgo: string; //createdAt
  is_read: boolean;
  created_at: string;
  replyContent: string;
  content_type: "forums" | "discussions" | "comments" | "upvotes" | "downvotes";
  content_uri: string;
  author: {
    id: string;
    name: string;
    profile_picture: string;
  };
  subscriber: {
    id: string;
    name: string;
    profile_picture: string;
  };
  ref_forums?: {
    id: string;
    content: string;
    contents: string;
    media_url?: string;
  };
  ref_discussions?: {
    id: string;
    content: string;
    media_url?: string;
  };
  ref_comments?: {
    id: string;
    content: string;
    media_url?: string;
  };
  ori_discussions? : {
    id: string;
    content: string;
    media_url?: string;
  }
  ori_comments? : {
    id: string;
    content: string;
    media_url?: string;
  }
}
