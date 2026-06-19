import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { BlogPost, BlogStatus } from "@/lib/blog/types";

const slugInput = z.object({ slug: z.string().min(1) });

const postInputSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  tag: z.string().min(1),
  coverImage: z.string().min(1),
  body: z.string().min(1),
  author: z.string().min(1),
  status: z.enum(["draft", "published"]),
});

const adminListInput = z.object({ idToken: z.string().min(1) });
const adminCreateInput = z.object({ idToken: z.string().min(1), post: postInputSchema });
const adminUpdateInput = z.object({
  idToken: z.string().min(1),
  id: z.string().min(1),
  post: postInputSchema,
});
const adminIdInput = z.object({ idToken: z.string().min(1), id: z.string().min(1) });
const adminStatusInput = z.object({
  idToken: z.string().min(1),
  id: z.string().min(1),
  status: z.enum(["draft", "published"]),
});

const fetchPublishedPostsServer = createServerFn({ method: "GET" }).handler(async () => {
  const { listPosts } = await import("@/lib/blog/blog-api.server");
  return listPosts("published");
});

const fetchPostBySlugServer = createServerFn({ method: "GET" })
  .validator(slugInput)
  .handler(async ({ data }) => {
    const { getPostBySlug } = await import("@/lib/blog/blog-api.server");
    return getPostBySlug(data.slug);
  });

const fetchAllPostsAdminServer = createServerFn({ method: "GET" })
  .validator(adminListInput)
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("@/lib/blog/verify-admin.server");
    const { listPosts } = await import("@/lib/blog/blog-api.server");
    await verifyAdmin(data.idToken);
    return listPosts();
  });

const createBlogPostServer = createServerFn({ method: "POST" })
  .validator(adminCreateInput)
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("@/lib/blog/verify-admin.server");
    const { createPost } = await import("@/lib/blog/blog-api.server");
    await verifyAdmin(data.idToken);
    return createPost(data.post);
  });

const updateBlogPostServer = createServerFn({ method: "POST" })
  .validator(adminUpdateInput)
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("@/lib/blog/verify-admin.server");
    const { updatePost } = await import("@/lib/blog/blog-api.server");
    await verifyAdmin(data.idToken);
    return updatePost(data.id, data.post);
  });

const setBlogPostStatusServer = createServerFn({ method: "POST" })
  .validator(adminStatusInput)
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("@/lib/blog/verify-admin.server");
    const { setPostStatus } = await import("@/lib/blog/blog-api.server");
    await verifyAdmin(data.idToken);
    return setPostStatus(data.id, data.status);
  });

const deleteBlogPostServer = createServerFn({ method: "POST" })
  .validator(adminIdInput)
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("@/lib/blog/verify-admin.server");
    const { deletePost } = await import("@/lib/blog/blog-api.server");
    await verifyAdmin(data.idToken);
    await deletePost(data.id);
    return { ok: true };
  });

const getBlogPostByIdAdminServer = createServerFn({ method: "GET" })
  .validator(adminIdInput)
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("@/lib/blog/verify-admin.server");
    const { getPostById } = await import("@/lib/blog/blog-api.server");
    await verifyAdmin(data.idToken);
    return getPostById(data.id);
  });

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  return fetchPublishedPostsServer();
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return fetchPostBySlugServer({ data: { slug } });
}

export async function fetchAllPostsAdmin(idToken: string): Promise<BlogPost[]> {
  return fetchAllPostsAdminServer({ data: { idToken } });
}

export async function fetchBlogPostByIdAdmin(
  idToken: string,
  id: string,
): Promise<BlogPost | undefined> {
  return getBlogPostByIdAdminServer({ data: { idToken, id } });
}

export async function createBlogPost(
  idToken: string,
  post: z.infer<typeof postInputSchema>,
): Promise<BlogPost> {
  return createBlogPostServer({ data: { idToken, post } });
}

export async function updateBlogPost(
  idToken: string,
  id: string,
  post: z.infer<typeof postInputSchema>,
): Promise<BlogPost> {
  return updateBlogPostServer({ data: { idToken, id, post } });
}

export async function setBlogPostStatus(
  idToken: string,
  id: string,
  status: BlogStatus,
): Promise<BlogPost> {
  return setBlogPostStatusServer({ data: { idToken, id, status } });
}

export async function deleteBlogPost(idToken: string, id: string): Promise<void> {
  await deleteBlogPostServer({ data: { idToken, id } });
}
