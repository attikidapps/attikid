import { useGetTrending } from "@workspace/api-client-react";
import SongCard from "@/components/SongCard";
import { TrendingUp } from "lucide-react";

export default function TrendingPage() {
  const { data: trending, isLoading } = useGetTrending();

  return (
    <div className="min-h-screen pb-32 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-black">Trending This Week</h1>
        </div>
        <p className="text-muted-foreground mb-8">Top 10 most played tracks in the last 7 days</p>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-14 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (trending || []).length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No trending data yet. Start listening!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {(trending || []).map((song, i) => (
              <div key={song.id} className="flex items-center gap-2">
                <SongCard song={song} queue={trending || []} compact rank={i + 1} />
                <div className="shrink-0 text-xs text-primary font-semibold">{song.weekPlays} this week</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
