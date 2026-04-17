import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useGetSong, useCreateComment, useGetComments, getGetSongQueryKey, getGetCommentsQueryKey } from "@workspace/api-client-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Music, Share2, MessageSquare, BarChart2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function SongPage() {
  const [, params] = useRoute("/songs/:id");
  const id = parseInt(params?.id || "0", 10);
  const { data: song, isLoading } = useGetSong(id, { query: { enabled: !!id } });
  const { data: comments } = useGetComments(id, { query: { enabled: !!id } });
  const { play, currentSong, isPlaying, togglePlay } = usePlayer();
  const queryClient = useQueryClient();
  const createComment = useCreateComment();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a + b };
  }, []);

  const isCurrentSong = currentSong?.id === id;

  function handlePlay() {
    if (isCurrentSong) {
      togglePlay();
    } else if (song) {
      play(song as any);
    }
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied!", description: "Share this track with your crew" });
    });
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    if (parseInt(captchaAnswer, 10) !== captcha.answer) {
      toast({ title: "Wrong answer", description: "Please solve the math question correctly", variant: "destructive" });
      return;
    }

    createComment.mutate(
      { id, data: { name: name.trim() || "Anonymous", text: text.trim(), captchaToken: captchaAnswer } },
      {
        onSuccess: () => {
          setText("");
          setName("");
          setCaptchaAnswer("");
          queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetSongQueryKey(id) });
          toast({ title: "Comment posted!" });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err?.data?.error || "Failed to post comment", variant: "destructive" });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-2xl mx-auto mt-8 space-y-4 animate-pulse">
          <div className="h-48 bg-card rounded-xl" />
          <div className="h-8 bg-card rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Song not found</p>
          <Link href="/"><span className="text-primary mt-2 inline-block cursor-pointer">Go home</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
              {song.mixtapeCoverUrl ? (
                <img src={song.mixtapeCoverUrl} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-10 h-10 text-primary/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black truncate">{song.title}</h1>
              <p className="text-muted-foreground">{song.artist}</p>
              {song.mixtapeTitle && (
                <Link href={`/mixtapes/${song.mixtapeId}`}>
                  <p className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer mt-0.5">
                    {song.mixtapeTitle}
                    {song.trackNumber != null && ` · Track ${song.trackNumber}`}
                  </p>
                </Link>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{song.genre}</span>
                <span className="text-xs text-muted-foreground">{song.totalPlays.toLocaleString()} plays</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-colors"
              data-testid="button-play-song"
            >
              {isCurrentSong && isPlaying ? (
                <><Pause className="w-4 h-4 fill-white" /> Pause</>
              ) : (
                <><Play className="w-4 h-4 fill-white ml-0.5" /> Play</>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2.5 rounded-full font-medium hover:bg-secondary/80 transition-colors"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Comments</h2>
            <span className="text-sm text-muted-foreground">({(comments ?? song.comments ?? []).length})</span>
          </div>

          <form onSubmit={handleComment} className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="input-comment-name"
            />
            <textarea
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              data-testid="input-comment-text"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                What is {captcha.a} + {captcha.b}?
              </label>
              <input
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-captcha"
              />
              <button
                type="submit"
                disabled={!text.trim() || createComment.isPending}
                className="ml-auto bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="button-submit-comment"
              >
                {createComment.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {(comments || song.comments || []).length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-sm">No comments yet. Be the first!</p>
            ) : (
              [...(comments || song.comments || [])].reverse().map((c) => (
                <div key={c.id} className="border-t border-border pt-4" data-testid={`comment-${c.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-primary">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
