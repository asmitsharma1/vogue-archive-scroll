import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { fetchBlogPostByIdAdmin, updateBlogPost } from "@/services/blog-api";

export const Route = createFileRoute("/admin/journal/$id/edit")({
  component: EditPostPage,
});

function EditPostPage() {
  const { id } = Route.useParams();
  const { user, isAdmin, loading, idToken } = useAdminAuth();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", id, idToken],
    queryFn: () => fetchBlogPostByIdAdmin(idToken!, id),
    enabled: Boolean(isAdmin && idToken),
  });

  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Edit Post</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !post ? (
        <p className="text-sm text-muted-foreground">Post not found.</p>
      ) : (
        <BlogPostForm
          initial={post}
          submitLabel="Save Changes"
          onSubmit={async (input) => {
            if (!idToken) throw new Error("Not signed in.");
            await updateBlogPost(idToken, id, input);
            navigate({ to: "/admin/journal" });
          }}
        />
      )}
    </div>
  );
}
