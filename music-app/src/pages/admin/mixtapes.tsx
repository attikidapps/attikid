import { useState } from "react";
import { useListMixtapes, useCreateMixtape, useUpdateMixtape, useDeleteMixtape, useUploadCover, getListMixtapesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2, X, Check, ImagePlus, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMixtapesPage() {
  const { data: mixtapes, isLoading } = useListMixtapes();
  const createMixtape = useCreateMixtape();
  const updateMixtape = useUpdateMixtape();
  const deleteMixtape = useDeleteMixtape();
  const uploadCover = useUploadCover();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", artist: "WAVSTREAM", genre: "Hip-Hop", description: "", releaseYear: "" });
  const [editForm, setEditForm] = useState({ title: "", artist: "", genre: "", description: "", releaseYear: "" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMixtape.mutate(
      { data: { title: form.title, artist: form.artist, genre: form.genre, description: form.description || null, releaseYear: form.releaseYear ? parseInt(form.releaseYear, 10) : null } },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ title: "", artist: "WAVSTREAM", genre: "Hip-Hop", description: "", releaseYear: "" });
          queryClient.invalidateQueries({ queryKey: getListMixtapesQueryKey() });
          toast({ title: "Mixtape created!" });
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      }
    );
  }

  function saveEdit(id: number) {
    updateMixtape.mutate(
      { id, data: { title: editForm.title || null, artist: editForm.artist || null, genre: editForm.genre || null, description: editForm.description || null, releaseYear: editForm.releaseYear ? parseInt(editForm.releaseYear, 10) : null } },
      {
        onSuccess: () => {
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListMixtapesQueryKey() });
          toast({ title: "Mixtape updated" });
        },
      }
    );
  }

  function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}" and all its songs?`)) return;
    deleteMixtape.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMixtapesQueryKey() });
        toast({ title: "Mixtape deleted" });
      },
    });
  }

  function handleCoverUpload(mixtapeId: number, file: File) {
    const formData = new FormData();
    formData.append("cover", file);
    formData.append("mixtapeId", mixtapeId.toString());
    uploadCover.mutate({ data: formData as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMixtapesQueryKey() });
        toast({ title: "Cover uploaded!" });
      },
      onError: () => toast({ title: "Cover upload failed", variant: "destructive" }),
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Manage Mixtapes</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="button-create-mixtape"
          >
            <Plus className="w-4 h-4" /> New Mixtape
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="bg-card border border-card-border rounded-xl p-5 mb-6 space-y-3">
            <h2 className="font-bold">Create New Mixtape</h2>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" data-testid="input-create-title" />
              <input type="text" placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="text" placeholder="Genre *" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="number" placeholder="Release Year" value={form.releaseYear} onChange={(e) => setForm({ ...form, releaseYear: e.target.value })} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            <div className="flex gap-2">
              <button type="submit" disabled={createMixtape.isPending} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors" data-testid="button-save-create">
                {createMixtape.isPending ? "Creating..." : "Create"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm hover:bg-secondary/80 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />)
          ) : (
            (mixtapes || []).map((m) => (
              <div key={m.id} className="bg-card border border-card-border rounded-xl overflow-hidden" data-testid={`mixtape-row-${m.id}`}>
                <div className="relative h-32 bg-secondary">
                  {m.coverUrl ? (
                    <img src={m.coverUrl} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 bg-black/60 rounded-lg p-1.5 cursor-pointer hover:bg-black/80 transition-colors">
                    <ImagePlus className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(m.id, f); }} />
                  </label>
                </div>
                <div className="p-4">
                  {editingId === m.id ? (
                    <div className="space-y-2">
                      <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm" />
                      <input value={editForm.genre} onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })} className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(m.id)} className="text-green-500 hover:text-green-400" data-testid={`button-save-${m.id}`}><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm truncate">{m.title}</h3>
                          <p className="text-xs text-muted-foreground">{m.genre} · {m.songCount} tracks</p>
                        </div>
                        <div className="flex gap-2 ml-2 shrink-0">
                          <button onClick={() => { setEditingId(m.id); setEditForm({ title: m.title, artist: m.artist, genre: m.genre, description: m.description || "", releaseYear: m.releaseYear?.toString() || "" }); }} className="text-muted-foreground hover:text-primary transition-colors" data-testid={`button-edit-${m.id}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(m.id, m.title)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-${m.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{m.totalPlays.toLocaleString()} plays</p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
