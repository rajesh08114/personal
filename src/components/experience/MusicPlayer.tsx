import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { AudioController } from '@/hooks/useAudioController';
import { cn } from '@/utils/cn';

/** Small floating music control. Only rendered when a song is configured and enabled. */
export function MusicPlayer({ audio, tone, songName }: { audio: AudioController; tone: 'dark' | 'light'; songName?: string }) {
  const [expanded, setExpanded] = useState(false);
  const sliderId = useId();
  const dark = tone === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className={cn(
        'fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[80] flex items-center gap-1 rounded-full p-1.5 shadow-xl backdrop-blur-xl sm:right-5 sm:bottom-5',
        dark ? 'border border-white/15 bg-black/45 text-white' : 'border border-black/10 bg-white/80 text-ink-900',
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false);
      }}
    >
      <button
        type="button"
        onClick={audio.toggle}
        aria-label={audio.playing ? 'Pause music' : 'Play music'}
        className={cn(
          'relative inline-flex size-11 items-center justify-center rounded-full transition-colors',
          dark ? 'bg-white/15 hover:bg-white/25' : 'bg-ink-900 text-white hover:bg-ink-700',
        )}
      >
        {audio.playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 translate-x-px" aria-hidden />}
        {audio.playing && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-current opacity-20" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex items-center gap-1 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => audio.setMuted(!audio.muted)}
              aria-label={audio.muted ? 'Unmute music' : 'Mute music'}
              aria-pressed={audio.muted}
              className={cn('inline-flex size-11 items-center justify-center rounded-full', dark ? 'hover:bg-white/10' : 'hover:bg-black/5')}
            >
              {audio.muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
            </button>
            <label htmlFor={sliderId} className="sr-only">
              Music volume
            </label>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.muted ? 0 : audio.volume}
              onChange={(e) => {
                audio.setVolume(Number(e.target.value));
                if (audio.muted) audio.setMuted(false);
              }}
              className="mr-3 h-1 w-20 accent-current sm:w-24"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex h-11 items-center gap-1.5 pr-3 pl-1 text-xs font-medium opacity-80"
          aria-label="Show volume controls"
        >
          <Music className="size-3.5" aria-hidden />
          <span className="max-w-[7rem] truncate max-sm:hidden">{audio.error ?? songName ?? 'Music'}</span>
        </button>
      )}
    </motion.div>
  );
}
