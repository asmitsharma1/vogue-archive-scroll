export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  coverImage: string;
  body: string;
  author: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  excerpt: string;
  tag: string;
  coverImage: string;
  body: string;
  author: string;
  status: BlogStatus;
}
