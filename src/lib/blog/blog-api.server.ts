import process from "node:process";

import { MongoClient, ObjectId, type Collection, type Document } from "mongodb";

import { getServerConfig } from "@/lib/config.server";

import type { BlogPost, BlogPostInput, BlogStatus } from "./types";

let clientPromise: Promise<MongoClient> | undefined;

async function getCollection(): Promise<Collection<Document>> {
  const { mongodbUri, mongodbDbName } = getServerConfig();
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is not set — add it to .env to enable the blog panel.");
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(mongodbUri).connect();
  }
  const client = await clientPromise;
  return client.db(mongodbDbName).collection("blog_posts");
}

function toBlogPost(doc: Document): BlogPost {
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    tag: doc.tag,
    coverImage: doc.coverImage,
    body: doc.body,
    author: doc.author,
    status: doc.status,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(collection: Collection<Document>, title: string, excludeId?: string) {
  const base = slugify(title) || "post";
  let slug = base;
  let attempt = 1;
  while (
    await collection.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: new ObjectId(excludeId) } } : {}),
    })
  ) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

export async function listPosts(status?: BlogStatus): Promise<BlogPost[]> {
  const collection = await getCollection();
  const docs = await collection
    .find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toBlogPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const collection = await getCollection();
  const doc = await collection.findOne({ slug, status: "published" });
  return doc ? toBlogPost(doc) : undefined;
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toBlogPost(doc) : undefined;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const collection = await getCollection();
  const slug = await uniqueSlug(collection, input.title);
  const now = new Date();
  const { insertedId } = await collection.insertOne({
    ...input,
    slug,
    createdAt: now,
    updatedAt: now,
  });
  const doc = await collection.findOne({ _id: insertedId });
  if (!doc) throw new Error("Failed to load post after creation.");
  return toBlogPost(doc);
}

export async function updatePost(id: string, input: BlogPostInput): Promise<BlogPost> {
  const collection = await getCollection();
  const slug = await uniqueSlug(collection, input.title, id);
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...input, slug, updatedAt: new Date() } },
  );
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error("Post not found.");
  return toBlogPost(doc);
}

export async function setPostStatus(id: string, status: BlogStatus): Promise<BlogPost> {
  const collection = await getCollection();
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error("Post not found.");
  return toBlogPost(doc);
}

export async function deletePost(id: string): Promise<void> {
  const collection = await getCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}

export function getAdminEmails(): string[] {
  return (process.env.VITE_FIREBASE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
