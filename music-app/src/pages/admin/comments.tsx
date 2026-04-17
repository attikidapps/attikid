import { useListAllComments, useDeleteComment, getListAllCommentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/AdminSidebar";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCommentsPage() {
  const { data: comments, isLoading } = useListAllComments();
  const deleteComment = useDeleteComment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function handleDelete(id: number) {
    if (!confirm("Delete this comment?")) return;
    deleteComment.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAllCommentsQueryKey() });
          toast({ title: "Comment deleted" });
        },
      }
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black mb-6">Comment Moderation</h1>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Author</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Comment</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Song</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(comments || []).map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors" data-testid={`comment-row-${c.id}`}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{c.text}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{c.songTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-comment-${c.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!comments?.length && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No comments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
