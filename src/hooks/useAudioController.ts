import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicSettings } from '@/types/birthday';

const PREFS_KEY = 'bd-audio-prefs';

function readPrefs(): { muted: boolean; volume?: number } {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as { muted: boolean; volume?: number }) : { muted: false };
  } catch {
    return { muted: false };
  }
}

function writePrefs(prefs: { muted: boolean; volume: number }) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable — preference just won't persist */
  }
}

export interface AudioController {
  available: boolean;
  playing: boolean;
  muted: boolean;
  volume: number;
  error: string | null;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  setMuted: (m: boolean) => void;
  setVolume: (v: number) => void;
  getLevels: (out: Uint8Array) => boolean;
}

/**
 * Owns one <audio> element for the experience. Never autoplays on load —
 * `play()` is called from a user gesture (the opening interaction or the player).
 */
export function useAudioController(music: MusicSettings): AudioController {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMutedState] = useState(() => readPrefs().muted);
  const [volume, setVolumeState] = useState(() => readPrefs().volume ?? music.volume);
  const available = Boolean(music.enabled && music.url);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      audio.addEventListener('play', () => setPlaying(true));
      audio.addEventListener('pause', () => setPlaying(false));
      audio.addEventListener('error', () => {
        if (audio.getAttribute('src')) setError('This song couldn’t be loaded.');
        setPlaying(false);
      });
      audioRef.current = audio;
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    if (available && music.url) {
      if (audio.src !== music.url) audio.src = music.url;
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }, [available, music.url]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    writePrefs({ muted, volume });
  }, [volume, muted]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    try {
      await ctxRef.current?.resume();
      await audio.play();
    } catch {
      // Autoplay blocked or decode failure — the floating player lets them retry.
      setPlaying(false);
    }
  }, [available]);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const toggle = useCallback(() => {
    if (audioRef.current?.paused) void play();
    else pause();
  }, [play, pause]);

  const getLevels = useCallback(
    (out: Uint8Array) => {
      const audio = audioRef.current;
      if (!audio || audio.paused || !available) return false;
      try {
        if (!analyserRef.current) {
          const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new Ctx();
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.82;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          ctxRef.current = ctx;
          analyserRef.current = analyser;
          void ctx.resume();
        }
        analyserRef.current.getByteFrequencyData(out as Uint8Array<ArrayBuffer>);
        return true;
      } catch {
        return false;
      }
    },
    [available],
  );

  return {
    available,
    playing,
    muted,
    volume,
    error,
    play,
    pause,
    toggle,
    setMuted: setMutedState,
    setVolume: setVolumeState,
    getLevels,
  };
}
