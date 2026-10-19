import { useEffect, useRef, useState } from 'react';
import { FolderOpen, LoaderCircle, Music, Pause, Play, Trash2, TriangleAlert, Upload } from 'lucide-react';
import type { MusicSettings } from '@/types/birthday';
import { Switch } from '@/components/ui/Field';
import { Button, IconButton } from '@/components/ui/Button';
import { AUDIO_ACCEPT, errorMessage, readAudioFile } from '@/utils/media';
import { useAuth } from '@/store/AuthProvider';
import { LibraryPicker, useLibraryEnabled } from './LibraryPicker';

interface MusicUploaderProps {
  music: MusicSettings;
  onChange: (music: MusicSettings) => void;
}

export function MusicUploader({ music, onChange }: MusicUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const auth = useAuth();
  const hasLibrary = useLibraryEnabled();
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  }, [music.url]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      // Signed in, the song goes straight to the user's library and the work keeps only a reference.
      const url = await auth.storeMedia(await readAudioFile(file), file.name);
      onChange({ ...music, url, name: file.name.replace(/\.[^.]+$/, ''), enabled: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const togglePreview = async () => {
    if (!music.url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => setPlaying(false));
    }
    const audio = audioRef.current;
    if (audio.src !== music.url) audio.src = music.url;
    audio.volume = music.volume;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setError('Your browser couldn’t play this file.');
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

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
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-paper p-3">
          <IconButton label={playing ? 'Pause preview' : 'Play preview'} variant="primary" onClick={() => void togglePreview()}>
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </IconButton>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{music.name ?? 'Your song'}</p>
            <p className="text-xs text-ink-500">Plays after they open their surprise</p>
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
            onClick={() => onChange({ ...music, url: undefined, name: undefined })}
          >
            <Trash2 className="size-4" aria-hidden />
          </IconButton>
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
            <span className="block text-xs text-ink-500">MP3 or WAV, up to 12 MB</span>
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
            onChange({ ...music, url: item.url, name: item.name.replace(/\.[^.]+$/, ''), enabled: true });
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
