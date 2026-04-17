import { useRoute } from "wouter";
import { useGetMixtape } from "@workspace/api-client-react";
import SongCard from "@/components/SongCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Music, Calendar, Disc } from "lucide-react";
import { Link } from "wouter";

export default function MixtapePage() {
  const [, params] = useRoute("/mixtapes/:id");
  const id = parseInt(params?.id || "0", 10);
  const { data: mixtape, isLoading } = useGetMixtape(id, { query: { enabled: !!id } });
  const { play } = usePlayer();

  function playAll() {
    if (mixtape?.songs && mixtape.songs.length > 0) {
      play(mixtape.songs[0], mixtape.songs);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4 mt-8">
          <div className="h-48 bg-card rounded-xl" />
          <div className="h-6 bg-card rounded w-1/2" />
          <div className="h-4 bg-card rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!mixtape) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Mixtape not found</p>
          <Link href="/library"><span className="text-primary mt-2 inline-block cursor-pointer">Back to Library</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="w-full md:w-48 h-48 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
            {mixtape.coverUrl ? (
              <img src={mixtape.coverUrl} alt={mixtape.title} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-20 h-20 text-primary/30" />
            )}
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-1">Mixtape</p>
            <h1 className="text-3xl md:text-4xl font-black mb-2">{mixtape.title}</h1>
            <p className="text-muted-foreground mb-2">{mixtape.artist}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="bg-secondary px-2 py-0.5 rounded-full">{mixtape.genre}</span>
              {mixtape.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {mixtape.releaseYear}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Disc className="w-3.5 h-3.5" />
                {mixtape.songCount} tracks
              </span>
              <span>{mixtape.totalPlays.toLocaleString()} plays</span>
            </div>
            {mixtape.description && (
              <p className="text-muted-foreground text-sm mb-4 max-w-md">{mixtape.description}</p>
            )}
            <button
              onClick={playAll}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-colors w-fit"
              data-testid="play-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Play All
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">Tracklist</h2>
          {mixtape.songs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tracks yet</p>
          ) : (
            <div className="space-y-1">
              {mixtape.songs?.map((song, i) => (
                <SongCard key={song.id} song={{ ...song, mixtapeTitle: mixtape.title }} queue={mixtape.songs} compact rank={song.trackNumber ?? i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
