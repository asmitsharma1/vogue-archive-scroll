import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { createBlogPost } from "@/services/blog-api";

export const Route = createFileRoute("/admin/journal/new")({
  component: NewPostPage,
});

function NewPostPage() {
  const { user, isAdmin, loading, idToken } = useAdminAuth();
  const navigate = useNavigate();

  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">New Post</h1>
      <BlogPostForm
        submitLabel="Create Post"
        onSubmit={async (input) => {
          if (!idToken) throw new Error("Not signed in.");
          await createBlogPost(idToken, input);
          navigate({ to: "/admin/journal" });
        }}
      />
    </div>
  );
}
