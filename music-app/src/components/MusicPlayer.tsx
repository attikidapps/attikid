import { usePlayer } from "@/contexts/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import { Link } from "wouter";

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const { currentSong, isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume, playNext, playPrev } = usePlayer();

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[hsl(0,0%,6%)] border-t border-border flex items-center justify-center z-50">
        <p className="text-muted-foreground text-sm">No track playing — click a song to start</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(0,0%,6%)] border-t border-border px-4 py-2" data-testid="music-player">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3 w-[220px] min-w-0 shrink-0">
          <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <Link href={`/songs/${currentSong.id}`}>
              <p className="text-sm font-semibold truncate hover:text-primary transition-colors cursor-pointer" data-testid="player-song-title">
                {currentSong.title}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={playPrev}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="player-prev"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              data-testid="player-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-white" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="player-next"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground w-8 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={([v]) => seek(v)}
              className="flex-1"
              data-testid="player-seekbar"
            />
            <span className="text-xs text-muted-foreground w-8">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-[140px] justify-end shrink-0">
          <button
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="player-mute"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v / 100)}
            className="w-24"
            data-testid="player-volume"
          />
        </div>
      </div>
    </div>
  );
}
