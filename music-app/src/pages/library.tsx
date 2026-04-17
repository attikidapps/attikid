import { useState } from "react";
import { useListMixtapes, useListSongs } from "@workspace/api-client-react";
import MixtapeCard from "@/components/MixtapeCard";
import SongCard from "@/components/SongCard";
import { Search } from "lucide-react";

const GENRES = ["All", "Hip-Hop", "Trap", "R&B", "Pop", "Electronic", "Drill"];

export default function LibraryPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"mixtapes" | "songs">("mixtapes");

  const { data: mixtapes, isLoading: mixtapesLoading } = useListMixtapes();
  const { data: songs, isLoading: songsLoading } = useListSongs(
    search ? { search } : undefined
  );

  const filteredMixtapes = (mixtapes || []).filter((m) =>
    selectedGenre === "All" ? true : m.genre === selectedGenre
  );

  const filteredSongs = (songs || []).filter((s) =>
    selectedGenre === "All" ? true : s.genre === selectedGenre
  );

  return (
    <div className="min-h-screen pb-32 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-6">Music Library</h1>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-card-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="input-search"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`filter-genre-${g}`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("mixtapes")}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "mixtapes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-mixtapes"
          >
            Mixtapes & Albums
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "songs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-songs"
          >
            All Songs
          </button>
        </div>

        {activeTab === "mixtapes" && (
          mixtapesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredMixtapes.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No mixtapes found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMixtapes.map((m) => (
                <MixtapeCard key={m.id} mixtape={m} />
              ))}
            </div>
          )
        )}

        {activeTab === "songs" && (
          songsLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No songs found</p>
          ) : (
            <div className="space-y-1">
              {filteredSongs.map((s, i) => (
                <SongCard key={s.id} song={s} queue={filteredSongs} compact rank={i + 1} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
