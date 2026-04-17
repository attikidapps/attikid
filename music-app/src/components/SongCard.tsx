import { Play, Music, BarChart2 } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SongLike {
  id: number;
  title: string;
  artist: string;
  genre: string;
  audioUrl: string;
  duration?: number | null;
  mixtapeId?: number | null;
  mixtapeTitle?: string | null;
  mixtapeCoverUrl?: string | null;
  totalPlays: number;
  createdAt: string;
}

interface SongCardProps {
  song: SongLike;
  queue?: SongLike[];
  compact?: boolean;
  rank?: number;
}

export default function SongCard({ song, queue, compact = false, rank }: SongCardProps) {
  const { play, currentSong, isPlaying } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    play(song, queue);
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group",
          isCurrentSong && "bg-primary/10 border border-primary/20"
        )}
        data-testid={`song-card-${song.id}`}
      >
        {rank != null && (
          <span className="text-sm font-bold text-muted-foreground w-5 text-center shrink-0">{rank}</span>
        )}
        <button
          onClick={handlePlay}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
            isCurrentSong && isPlaying
              ? "bg-primary text-white"
              : "bg-secondary group-hover:bg-primary/80 text-muted-foreground group-hover:text-white"
          )}
          data-testid={`play-song-${song.id}`}
        >
          {isCurrentSong && isPlaying ? (
            <BarChart2 className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <Link href={`/songs/${song.id}`}>
            <p className={cn("text-sm font-medium truncate hover:text-primary transition-colors cursor-pointer", isCurrentSong && "text-primary")}>
              {song.title}
            </p>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{song.genre}</p>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">{song.totalPlays.toLocaleString()} plays</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card border border-card-border rounded-xl p-4 hover:border-primary/30 transition-all group cursor-pointer",
        isCurrentSong && "border-primary/40 bg-primary/5"
      )}
      data-testid={`song-card-${song.id}`}
    >
      <div className="relative mb-3 aspect-square rounded-lg bg-secondary overflow-hidden">
        {(song as any).mixtapeCoverUrl ? (
          <img src={(song as any).mixtapeCoverUrl} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          data-testid={`play-song-${song.id}`}
        >
          {isCurrentSong && isPlaying ? (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-white animate-pulse" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          )}
        </button>
      </div>
      <Link href={`/songs/${song.id}`}>
        <p className="font-semibold text-sm truncate hover:text-primary transition-colors">{song.title}</p>
      </Link>
      <p className="text-xs text-muted-foreground mt-0.5">{song.genre}</p>
      <p className="text-xs text-muted-foreground mt-1">{song.totalPlays.toLocaleString()} plays</p>
    </div>
  );
}
