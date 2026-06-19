import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { deleteBlogPost, fetchAllPostsAdmin, setBlogPostStatus } from "@/services/blog-api";

export const Route = createFileRoute("/admin/journal")({
  component: AdminJournalPage,
});

function AdminJournalPage() {
  const { user, isAdmin, loading, idToken, signOut } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts", idToken],
    queryFn: () => fetchAllPostsAdmin(idToken!),
    enabled: Boolean(isAdmin && idToken),
  });

  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/admin/login" replace />;
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] });

  const togglePublish = async (id: string, status: "draft" | "published") => {
    if (!idToken) return;
    await setBlogPostStatus(idToken, id, status === "published" ? "draft" : "published");
    invalidate();
  };

  const remove = async (id: string) => {
    if (!idToken) return;
    if (!window.confirm("Delete this post permanently?")) return;
    await deleteBlogPost(idToken, id);
    invalidate();
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">The Journal</h1>
          <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link to="/journal">View public page</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/journal/new">New Post</Link>
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : !posts || posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.tag}</TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => togglePublish(post.id, post.status)}>
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/journal/$id/edit" params={{ id: post.id }}>
                      Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(post.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
