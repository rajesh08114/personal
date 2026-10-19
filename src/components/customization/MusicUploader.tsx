'use client';

import { useEffect, useRef, useState } from 'react';
import { FolderOpen, LoaderCircle, Music, Pause, Play, Scissors, Trash2, TriangleAlert, Upload } from 'lucide-react';
import type { MusicSettings } from '@/types/birthday';
import { Switch } from '@/components/ui/Field';
import { Button, IconButton } from '@/components/ui/Button';
import { AUDIO_ACCEPT, errorMessage, readAudioFile } from '@/utils/media';
import { useAuth } from '@/store/AuthProvider';
import { LibraryPicker, useLibraryEnabled } from './LibraryPicker';
import { cn } from '@/utils/cn';

interface MusicUploaderProps {
  music: MusicSettings;
  onChange: (music: MusicSettings) => void;
}

const formatSeconds = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const DURATION_PRESETS: Array<{ label: string; value: number | undefined }> = [
  { label: 'Full track', value: undefined },
  { label: '30s clip', value: 30 },
  { label: '45s highlight', value: 45 },
  { label: '60s feature', value: 60 },
];

export function MusicUploader({ music, onChange }: MusicUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [trackDuration, setTrackDuration] = useState<number>(180);
  const auth = useAuth();
  const hasLibrary = useLibraryEnabled();
  const [picking, setPicking] = useState(false);
  const [trimmingOpen, setTrimmingOpen] = useState(Boolean(music.startSec || music.duration));

  // Sync audio element with URL and track duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  }, [music.url]);

  useEffect(() => {
    if (!music.url) return;
    const a = new Audio(music.url);
    const onMeta = () => {
      if (a.duration && Number.isFinite(a.duration)) {
        setTrackDuration(Math.round(a.duration));
      }
    };
    a.addEventListener('loadedmetadata', onMeta);
    return () => a.removeEventListener('loadedmetadata', onMeta);
  }, [music.url]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await auth.storeMedia(await readAudioFile(file), file.name);
      onChange({
        ...music,
        url,
        name: file.name.replace(/\.[^.]+$/, ''),
        enabled: true,
        startSec: undefined,
        duration: undefined,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const togglePreview = async (fromStart = false) => {
    if (!music.url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => setPlaying(false));
    }
    const audio = audioRef.current;
    if (audio.src !== music.url) audio.src = music.url;
    audio.volume = music.volume;

    const startSec = music.startSec ?? 0;
    const duration = music.duration;

    if (fromStart || audio.paused) {
      try {
        audio.currentTime = startSec;
        await audio.play();
        setPlaying(true);
      } catch {
        setError('Your browser couldn’t play this file.');
      }
    } else {
      audio.pause();
      setPlaying(false);
    }

    const onTimeUpdate = () => {
      if (duration && audio.currentTime >= startSec + duration) {
        audio.pause();
        audio.currentTime = startSec;
        setPlaying(false);
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.removeEventListener('timeupdate', onTimeUpdate);
    if (duration) {
      audio.addEventListener('timeupdate', onTimeUpdate);
    }
  };

  const currentStart = music.startSec ?? 0;
  const maxStart = Math.max(0, trackDuration - 5);

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {music.url ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-paper p-3">
            <IconButton label={playing ? 'Pause preview' : 'Play preview'} variant="primary" onClick={() => void togglePreview()}>
              {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            </IconButton>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{music.name ?? 'Your song'}</p>
              <p className="text-xs text-ink-500">
                {music.startSec || music.duration
                  ? `Starts at ${formatSeconds(currentStart)} · ${music.duration ? `${music.duration}s clip` : 'Full song'}`
                  : 'Plays after they open their surprise'}
              </p>
            </div>
            {hasLibrary && (
              <IconButton size="sm" label="Choose music from your library" onClick={() => setPicking(true)}>
                <FolderOpen className="size-4" aria-hidden />
              </IconButton>
            )}
            <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <IconButton
              size="sm"
              label="Remove music"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => onChange({ ...music, url: undefined, name: undefined, startSec: undefined, duration: undefined })}
            >
              <Trash2 className="size-4" aria-hidden />
            </IconButton>
          </div>

          {/* Audio Trimming & Start Point Section */}
          <div className="rounded-2xl border border-ink-200/80 bg-paper-2/40 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Scissors className="size-4 text-brand" aria-hidden />
                <span>Audio Trimming & Timing</span>
              </div>
              <button
                type="button"
                onClick={() => setTrimmingOpen(!trimmingOpen)}
                className="text-xs font-semibold text-brand underline"
              >
                {trimmingOpen ? 'Hide options' : 'Adjust timing & trim'}
              </button>
            </div>

            {trimmingOpen && (
              <div className="space-y-4 pt-1 border-t border-ink-100">
                {/* Start Offset Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-ink-700">
                    <span>Start playing at (skip intro)</span>
                    <span className="font-mono font-bold text-ink-900">{formatSeconds(currentStart)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxStart}
                    step={1}
                    value={currentStart}
                    onChange={(e) => {
                      const sec = Number(e.target.value);
                      onChange({ ...music, startSec: sec > 0 ? sec : undefined });
                    }}
                    className="w-full accent-brand h-1.5 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[0, 15, 30, 45, 60].filter((s) => s <= maxStart).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => onChange({ ...music, startSec: sec > 0 ? sec : undefined })}
                        className={cn(
                          'rounded-md px-2 py-0.5 text-xs font-mono transition-colors',
                          currentStart === sec ? 'bg-brand text-white' : 'bg-paper text-ink-600 hover:bg-ink-100',
                        )}
                      >
                        {formatSeconds(sec)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Limit Options */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-ink-700">
                    <span>Clip Duration</span>
                    <span className="font-mono font-bold text-ink-900">
                      {music.duration ? `${music.duration}s` : 'Full track'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => onChange({ ...music, duration: p.value })}
                        className={cn(
                          'rounded-xl border py-1.5 px-2 text-center text-xs font-medium transition-colors',
                          music.duration === p.value
                            ? 'border-brand bg-brand text-white shadow-xs'
                            : 'border-ink-200 bg-paper text-ink-700 hover:border-brand/40 hover:bg-brand-soft/30',
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Trimmed Clip */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs text-ink-500">
                    Preview: {formatSeconds(currentStart)} to {music.duration ? formatSeconds(currentStart + music.duration) : 'End'}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void togglePreview(true)}
                    icon={playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  >
                    {playing ? 'Pause' : 'Test trimmed clip'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-ink-200 bg-paper-2/60 p-4 text-left transition-colors hover:border-brand/50 hover:bg-brand-soft/50"
        >
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-sm">
            {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Music className="size-5" aria-hidden />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-800">{busy ? 'Checking your song…' : 'Upload music'}</span>
            <span className="block text-xs text-ink-500">MP3 or WAV, up to 12 MB · With clip trimming</span>
          </span>
          <Upload className="ml-auto size-4 text-ink-400" aria-hidden />
        </button>
      )}

      {!music.url && hasLibrary && (
        <Button size="sm" variant="ghost" icon={<FolderOpen className="size-4" aria-hidden />} onClick={() => setPicking(true)}>
          Choose from your library
        </Button>
      )}

      {hasLibrary && (
        <LibraryPicker
          open={picking}
          kind="audio"
          onClose={() => setPicking(false)}
          onPick={(item) => {
            onChange({
              ...music,
              url: item.url,
              name: item.name.replace(/\.[^.]+$/, ''),
              enabled: true,
              startSec: undefined,
              duration: undefined,
            });
            setError(null);
            setPicking(false);
          }}
        />
      )}

      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-xs font-medium text-rose-700">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      )}

      <Switch
        label="Play background music"
        description="Music never autoplays — it starts when they open the surprise."
        checked={music.enabled}
        onChange={(enabled) => onChange({ ...music, enabled })}
      />

      <div className="flex items-center gap-3">
        <label htmlFor="music-volume" className="text-sm font-semibold text-ink-800">
          Volume
        </label>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={music.volume}
          onChange={(e) => {
            const volume = Number(e.target.value);
            if (audioRef.current) audioRef.current.volume = volume;
            onChange({ ...music, volume });
          }}
          className="flex-1 accent-brand"
        />
        <span className="w-10 text-right text-xs tabular-nums text-ink-500">{Math.round(music.volume * 100)}%</span>
      </div>
    </div>
  );
}
