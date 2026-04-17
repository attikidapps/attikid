import { Music, Play } from "lucide-react";
import { Link } from "wouter";
import type { Mixtape } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface MixtapeCardProps {
  mixtape: Mixtape;
}

export default function MixtapeCard({ mixtape }: MixtapeCardProps) {
  return (
    <Link href={`/mixtapes/${mixtape.id}`}>
      <div
        className="bg-card border border-card-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group cursor-pointer"
        data-testid={`mixtape-card-${mixtape.id}`}
      >
        <div className="relative aspect-square bg-secondary">
          {mixtape.coverUrl ? (
            <img src={mixtape.coverUrl} alt={mixtape.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className={cn("w-16 h-16", "text-primary/30")} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ml-auto">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-sm truncate">{mixtape.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{mixtape.artist}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{mixtape.genre}</span>
            <span className="text-xs text-muted-foreground">{mixtape.songCount} tracks</span>
          </div>
          {mixtape.totalPlays > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{mixtape.totalPlays.toLocaleString()} plays</p>
          )}
        </div>
      </div>
    </Link>
  );
}
