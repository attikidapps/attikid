import { useListMixtapes, useGetTrending, useListSongs } from "@workspace/api-client-react";
import MixtapeCard from "@/components/MixtapeCard";
import SongCard from "@/components/SongCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { data: mixtapes, isLoading: mixtapesLoading } = useListMixtapes();
  const { data: trending, isLoading: trendingLoading } = useGetTrending();
  const { play } = usePlayer();

  function playAll() {
    if (trending && trending.length > 0) {
      play(trending[0], trending);
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="relative bg-gradient-to-b from-primary/20 to-background pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Independent Music</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            WAVSTREAM
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mb-8">
            Stream exclusive music straight from the source. No algorithms. No ads. Just the art.
          </p>
          <button
            onClick={playAll}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            data-testid="play-trending"
          >
            <Play className="w-5 h-5 fill-white" />
            Play Trending
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Trending This Week</h2>
          </div>
          <Link href="/trending">
            <span className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer">See all</span>
          </Link>
        </div>
        {trendingLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {(trending || []).slice(0, 5).map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                queue={trending || []}
                compact
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Mixtapes & Albums</h2>
          <Link href="/library">
            <span className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer">Browse all</span>
          </Link>
        </div>
        {mixtapesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(mixtapes || []).map((m) => (
              <MixtapeCard key={m.id} mixtape={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
