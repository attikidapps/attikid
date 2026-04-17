import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

export interface PlayableSong {
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

interface PlayerState {
  currentSong: PlayableSong | null;
  queue: PlayableSong[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

interface PlayerContextValue extends PlayerState {
  play: (song: PlayableSong, queue?: PlayableSong[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  playNext: () => void;
  playPrev: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function getSessionId(): string {
  let id = localStorage.getItem("wavstream_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("wavstream_session_id", id);
  }
  return id;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<PlayableSong | null>(null);
  const [queue, setQueue] = useState<PlayableSong[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const playStartRef = useRef<number>(0);
  const playCountedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      playNext();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    const audio = audioRef.current;
    audio.src = currentSong.audioUrl;
    audio.load();
    playStartRef.current = Date.now();
    playCountedRef.current = false;
    audio.play().catch(() => setIsPlaying(false));
  }, [currentSong]);

  useEffect(() => {
    if (!currentSong || playCountedRef.current) return;
    const elapsed = currentTime;
    const total = duration;
    const meetsThreshold = elapsed >= 15 || (total > 0 && elapsed / total >= 0.5);
    if (meetsThreshold) {
      playCountedRef.current = true;
      const sessionId = getSessionId();
      fetch(`/api/songs/${currentSong.id}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          durationListened: Math.round(elapsed),
          totalDuration: Math.round(total),
        }),
      }).catch(() => {});
    }
  }, [currentTime, duration, currentSong]);

  const play = useCallback((song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s.id === song.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      setQueue([song]);
      setQueueIndex(0);
    }
    setCurrentSong(song);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else resume();
  }, [isPlaying, pause, resume]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const playNext = useCallback(() => {
    setQueue((q) => {
      setQueueIndex((idx) => {
        const next = idx + 1;
        if (next < q.length) {
          setCurrentSong(q[next]);
          return next;
        }
        return idx;
      });
      return q;
    });
  }, []);

  const playPrev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    setQueue((q) => {
      setQueueIndex((idx) => {
        const prev = idx - 1;
        if (prev >= 0) {
          setCurrentSong(q[prev]);
          return prev;
        }
        return idx;
      });
      return q;
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        queueIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        play,
        pause,
        resume,
        togglePlay,
        seek,
        setVolume,
        playNext,
        playPrev,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
