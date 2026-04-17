import { useState } from "react";
import { useListMixtapes, useUploadSong, getListSongsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/AdminSidebar";
import { Upload, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GENRES = ["Hip-Hop", "Trap", "R&B", "Pop", "Electronic", "Drill", "Lo-Fi", "Other"];

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("WAVSTREAM");
  const [genre, setGenre] = useState("Hip-Hop");
  const [mixtapeId, setMixtapeId] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const { data: mixtapes } = useListMixtapes();
  const uploadSong = useUploadSong();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile || !title) return;

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("genre", genre);
    if (mixtapeId) formData.append("mixtapeId", mixtapeId);
    if (trackNumber) formData.append("trackNumber", trackNumber);

    uploadSong.mutate(
      { data: formData as any },
      {
        onSuccess: (song) => {
          toast({ title: "Song uploaded!", description: `"${song.title}" is now live` });
          setTitle("");
          setArtist("WAVSTREAM");
          setGenre("Hip-Hop");
          setMixtapeId("");
          setTrackNumber("");
          setAudioFile(null);
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Upload failed", description: err?.data?.error || "Something went wrong", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black mb-6">Upload Song</h1>
        <div className="max-w-lg">
          <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Audio File (MP3, WAV) *</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById("audio-input")?.click()}
              >
                {audioFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Music className="w-5 h-5" />
                    <span className="text-sm font-medium">{audioFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to select audio file</p>
                    <p className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG up to 50MB</p>
                  </>
                )}
                <input
                  id="audio-input"
                  type="file"
                  accept=".mp3,.wav,.ogg,.flac,.m4a"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  data-testid="input-audio-file"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Artist</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-artist"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Genre *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="select-genre"
              >
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Mixtape (optional)</label>
                <select
                  value={mixtapeId}
                  onChange={(e) => setMixtapeId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid="select-mixtape"
                >
                  <option value="">-- Single --</option>
                  {(mixtapes || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Track # (optional)</label>
                <input
                  type="number"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  min="1"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid="input-track-number"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!audioFile || !title || !genre || uploadSong.isPending}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              data-testid="button-upload"
            >
              <Upload className="w-4 h-4" />
              {uploadSong.isPending ? "Uploading..." : "Upload Song"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
