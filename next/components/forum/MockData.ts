import { PostType } from "./ForumCard";

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorImg: string;
  author: string;
  timeAgo: string;
  type: PostType;
  tags: string[];
  imageUrl?: string[];
  commentCount: number;
  upvoteCount: number;
  downvoteCount: number;
  viewsCount: number;
}

export interface Comment {
  id: string;
  author: string;
  authorImg: string;
  timeAgo: string;
  content: string;
  upvoteCount: number;
  downvoteCount: number;
  replies?: Comment[];
}

export const forumPosts: ForumPost[] = [
  {
    id: "1",
    title: "White spots on my tomato leaves - is this powdery mildew?",
    content:
      "I noticed white powdery spots appearing on my tomato leaves. They started on the lower leaves and seem to be spreading upward. Is this powdery mildew? What should I do?",
    authorImg: "/github-icon-2.svg",
    author: "Alexandro Ujang",
    timeAgo: "2 hours ago",
    type: "pests",
    tags: ["tomatoes", "Fungal Disease", "Plant Care"],
    commentCount: 5,
    upvoteCount: 12,
    downvoteCount: 12,
    viewsCount: 12,
  },
  {
    id: "2",
    title: "White spots on my tomato leaves - is this powdery mildew?",
    content:
      "I noticed white powdery spots appearing on my tomato leaves. They started on the lower leaves and seem to be spreading upward. Is this powdery mildew? What should I do?",
    authorImg: "/github-icon-2.svg",
    author: "Alexandro Ujang",
    timeAgo: "2 hours ago",
    type: "diseases",
    tags: ["tomatoes", "Fungal Disease", "Plant Care"],
    commentCount: 5,
    upvoteCount: 12,
    downvoteCount: 12,
    viewsCount: 12,
  },
  {
    id: "3",
    title: "White spots on my tomato leaves - is this powdery mildew?",
    content:
      "I noticed white powdery spots appearing on my tomato leaves. They started on the lower leaves and seem to be spreading upward. Is this powdery mildew? What should I do?",
    authorImg: "/github-icon-2.svg",
    author: "Alexandro Ujang",
    timeAgo: "2 hours ago",
    type: "general",
    tags: ["tomatoes", "Fungal Disease", "Plant Care"],
    commentCount: 5,
    upvoteCount: 12,
    downvoteCount: 12,
    viewsCount: 12,
  },
  {
    id: "4",
    title: "White spots on my tomato leaves - is this powdery mildew?",
    content:
      "I noticed white powdery spots appearing on my tomato leaves. They started on the lower leaves and seem to be spreading upward. Is this powdery mildew? What should I do?",
    authorImg: "/github-icon-2.svg",
    author: "Alexandro Ujang",
    timeAgo: "2 hours ago",
    type: "pests",
    tags: ["tomatoes", "Fungal Disease", "Plant Care"],
    commentCount: 5,
    upvoteCount: 12,
    downvoteCount: 12,
    viewsCount: 12,
  },
  {
    id: "5",
    title: "White spots on my tomato leaves - is this powdery mildew?",
    content:
      "I noticed white powdery spots appearing on my tomato leaves. They started on the lower leaves and seem to be spreading upward. Is this powdery mildew? What should I do?",
    authorImg: "/github-icon-2.svg",
    author: "Alexandro Ujang",
    timeAgo: "2 hours ago",
    type: "pests",
    tags: ["tomatoes", "Fungal Disease", "Plant Care"],
    commentCount: 5,
    upvoteCount: 12,
    downvoteCount: 12,
    viewsCount: 12,
  },
];

export const getPostDetail = (id: string): ForumPost | undefined => {
  return forumPosts.find((post) => post.id === id);
};

export const getPostComments = (postId: string): Comment[] => {
  const commentsDatabase: Record<string, Comment[]> = {
    "1": [
      {
        id: "1",
        author: "Thomas Alfa Edi Sound",
        authorImg: "/github-icon-2.svg",
        timeAgo: "1 day ago",
        content:
          "Those are definitely aphids! I recommend spraying them off with water first, then applying insecticidal soap. Ladybugs are also great natural predators if you can attract them to your garden.",
        upvoteCount: 12,
        downvoteCount: 12,
        replies: [],
      },
      {
        id: "2",
        author: "Prabowe Superman Sublanto",
        authorImg: "/github-icon-2.svg",
        timeAgo: "1 day ago",
        content:
          "I had the same issue last season. In addition to the baking soda, try planting some marigolds nearby - they help naturally deter fungal diseases!",
        upvoteCount: 12,
        downvoteCount: 12,
        replies: [
          {
            id: "3",
            author: "Bunda Teddy seyang Wowo",
            authorImg: "/github-icon-2.svg",
            timeAgo: "1 day ago",
            content:
              "I had the same issue last season. In addition to the baking soda, try planting some marigolds nearby - they help naturally deter fungal diseases!",
            upvoteCount: 12,
            downvoteCount: 12,
            replies: [],
          },
        ],
      },
    ],
    "2": [
      {
        id: "4",
        author: "User Lain",
        authorImg: "/github-icon-2.svg",
        timeAgo: "3 hours ago",
        content: "Ini adalah contoh komentar untuk post berbeda",
        upvoteCount: 5,
        downvoteCount: 2,
        replies: [],
      },
    ],
  };

  return commentsDatabase[postId] || [];
};