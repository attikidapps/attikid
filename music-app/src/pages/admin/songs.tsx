import { useState } from "react";
import { useListSongs, useDeleteSong, useUpdateSong, useListMixtapes, getListSongsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/AdminSidebar";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSongsPage() {
  const { data: songs, isLoading } = useListSongs();
  const { data: mixtapes } = useListMixtapes();
  const deleteSong = useDeleteSong();
  const updateSong = useUpdateSong();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", genre: "", mixtapeId: "" });

  function startEdit(song: any) {
    setEditingId(song.id);
    setEditForm({ title: song.title, genre: song.genre, mixtapeId: song.mixtapeId?.toString() ?? "" });
  }

  function saveEdit(id: number) {
    updateSong.mutate(
      {
        id,
        data: {
          title: editForm.title || undefined,
          genre: editForm.genre || undefined,
          mixtapeId: editForm.mixtapeId ? parseInt(editForm.mixtapeId, 10) : null,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
          toast({ title: "Song updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    deleteSong.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
          toast({ title: "Song deleted" });
        },
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black mb-6">Manage Songs</h1>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Mixtape</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Genre</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Plays</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(songs || []).map((song) => (
                  <tr key={song.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors" data-testid={`song-row-${song.id}`}>
                    <td className="px-4 py-3">
                      {editingId === song.id ? (
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="bg-secondary border border-border rounded px-2 py-1 text-sm w-full"
                          data-testid="input-edit-title"
                        />
                      ) : (
                        <span className="font-medium">{song.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {editingId === song.id ? (
                        <select
                          value={editForm.mixtapeId}
                          onChange={(e) => setEditForm({ ...editForm, mixtapeId: e.target.value })}
                          className="bg-secondary border border-border rounded px-2 py-1 text-sm"
                        >
                          <option value="">-- Single --</option>
                          {(mixtapes || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                      ) : (
                        song.mixtapeTitle || <span className="italic text-muted-foreground/60">Single</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {editingId === song.id ? (
                        <input
                          value={editForm.genre}
                          onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                          className="bg-secondary border border-border rounded px-2 py-1 text-sm w-24"
                        />
                      ) : (
                        song.genre
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{song.totalPlays.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === song.id ? (
                          <>
                            <button onClick={() => saveEdit(song.id)} className="text-green-500 hover:text-green-400" data-testid={`button-save-${song.id}`}>
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(song)} className="text-muted-foreground hover:text-primary transition-colors" data-testid={`button-edit-${song.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(song.id, song.title)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-${song.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!songs?.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No songs yet. Upload some!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
