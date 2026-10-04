import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './vinyl.css';

const retro = 'font-t-display';
const TRACK_SECONDS = 9;
const TRACKS = ['The Beginning', 'Falling For You', 'Our Memories', 'My Favorite Person', 'Forever'];

export default function VinylLove() {
  const { opened } = useExperience();
  return (
    <div className="film-grain relative min-h-dvh bg-[#1f130b] text-[#f0d9b5]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgb(255_170_90/0.28),transparent_55%),radial-gradient(ellipse_at_90%_90%,rgb(196_85_47/0.18),transparent_50%)]" />
      <AnimatePresence>{!opened && <Intro key="i" />}</AnimatePresence>
      {opened && <Player />}
    </div>
  );
}

function Record({ spinning, size = 'min(80vw, 26rem)' }: { spinning: boolean; size?: string }) {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <div className={cn('vl-record relative aspect-square rounded-full shadow-[0_30px_60px_-20px_black]', spinning && 'is-spinning')} style={{ width: size }}>
      <span aria-hidden className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#0d0d0d_0_2px,#1a1a1a_2px_3.5px)]" />
      <span aria-hidden className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent,rgb(255_255_255/0.08),transparent_30%,transparent_55%,rgb(255_255_255/0.06),transparent_80%)]" />
      <div className="absolute inset-[30%] overflow-hidden rounded-full border-4 border-[var(--bd-primary)] bg-[var(--bd-primary)]">
        <PhotoSlot src={config.heroImage} alt={`Record label: ${name}`} label="Photo" className="h-full w-full rounded-full" imgClassName="sepia-[0.3]" />
      </div>
      <span aria-hidden className="absolute inset-[48.5%] rounded-full bg-[#1f130b]" />
    </div>
  );
}

function Tonearm({ down }: { down: boolean }) {
  return (
    <motion.div aria-hidden className="pointer-events-none absolute top-[2%] right-[2%] h-[62%] w-4 origin-top" animate={{ rotate: down ? 24 : 2 }} transition={{ duration: 1.2, ease: EASE.inOut }}>
      <span className="absolute -top-3 left-1/2 size-9 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#e6dccb] to-[#9a8f80] shadow-lg" />
      <span className="absolute top-3 left-1/2 h-full w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e6dccb] to-[#b5aa9a]" />
      <span className="absolute -bottom-2 left-1/2 h-6 w-4 -translate-x-1/2 rounded-sm bg-[#2b2b2b]" />
    </motion.div>
  );
}

function Intro() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1f130b] px-6 text-center" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <div className="relative">
        <Record spinning size="min(70vw, 20rem)" />
        <Tonearm down={false} />
      </div>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1.4 }} className={`${retro} mt-10 text-4xl sm:text-5xl`}>
        {config.messages.intro.trim() || 'Our soundtrack…'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className={`${retro} mt-10 inline-flex h-13 items-center gap-3 rounded-full bg-[var(--bd-primary)] px-8 text-lg text-[#1f130b] shadow-[0_10px_30px_-10px_var(--bd-primary)]`}>
        <Play className="size-5 fill-current" aria-hidden /> Put the record on
      </motion.button>
    </motion.div>
  );
}

function Sleeve({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('bg-[#f0d9b5] p-2 text-[#1f130b] shadow-[0_20px_40px_-18px_black]', className)}>{children}</div>;
}

function TrackContent({ track }: { track: number }) {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const timeline = getTimeline(config);
  const memories = getMemories(config);
  const paras = splitParagraphs(config.messages.main);
  const lyric = 'text-2xl leading-relaxed italic sm:text-3xl';

  switch (track) {
    case 0: {
      const t = timeline[0];
      return (
        <div className="grid items-center gap-6 sm:grid-cols-[14rem_1fr]">
          <Sleeve className="-rotate-2">
            <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" tone="light" className="aspect-square w-full" imgClassName="sepia-[0.25]" />
          </Sleeve>
          <div>
            <p className={lyric}>{t.captionText}</p>
            {(t.date || t.place) && <p className="mt-3 text-sm tracking-[0.3em] uppercase opacity-60">{[t.date, t.place].filter(Boolean).join(' · ')}</p>}
          </div>
        </div>
      );
    }
    case 1:
      return (
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_14rem]">
          <p className={lyric}>{paras[0] ?? <Fill value="" placeholder={PLACEHOLDER.message} />}</p>
          <Sleeve className="rotate-2">
            <PhotoSlot src={memories[0]?.image} alt={memories[0]?.titleText ?? 'Memory'} label="Add a photo" tone="light" className="aspect-square w-full" imgClassName="sepia-[0.25]" />
          </Sleeve>
        </div>
      );
    case 2:
      return (
        <ul className="grid grid-cols-3 gap-3">
          {memories.slice(0, 6).map((m, i) => (
            <motion.li key={m.id} initial={{ opacity: 0, y: 20, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: (i % 3) - 1 }} transition={{ delay: i * 0.25 }}>
              <Sleeve>
                <PhotoSlot src={m.image} alt={m.titleText} label="+" tone="light" className="aspect-square w-full" imgClassName="sepia-[0.2]" />
                <p className="mt-1 truncate text-xs">{m.titleText}</p>
              </Sleeve>
            </motion.li>
          ))}
        </ul>
      );
    case 3:
      return (
        <div className="grid items-center gap-6 sm:grid-cols-[14rem_1fr]">
          <Sleeve className="-rotate-1">
            <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`Portrait of ${name}`} label="Add a photo" tone="light" className="aspect-[4/5] w-full" />
          </Sleeve>
          <div className="space-y-4">
            {(paras.slice(1).length ? paras.slice(1) : [paras[0] ?? PLACEHOLDER.message]).map((p, i) => (
              <p key={i} className="text-xl leading-relaxed italic sm:text-2xl">
                {p}
              </p>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <p className="text-3xl leading-relaxed italic sm:text-4xl">
          <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
        </p>
      );
  }
}

function Player() {
  const { config, audio, fx, restart, reducedMotion } = useExperience();
  const colors = useThemeColors(['#ffffff']);
  // The opening click already started the song, so the needle drops straight away.
  const [playing, setPlaying] = useState(true);
  const [track, setTrack] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!playing || ended) return;
    const id = window.setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => window.clearInterval(id);
  }, [playing, ended]);

  useEffect(() => {
    if (elapsed < TRACK_SECONDS || ended) return;
    if (track < TRACKS.length - 1) {
      setTrack((t) => t + 1);
      setElapsed(0);
    } else {
      setEnded(true);
      setPlaying(false);
      audio.pause();
      window.setTimeout(() => fx.confetti({ x: 0.5, y: 0.4, colors, count: 120, spread: 160, angle: 270, velocity: 300, shapes: ['circle'] }), 1400);
    }
  }, [elapsed, track, ended, audio, fx, colors]);

  const toggle = () => {
    if (ended) return;
    if (playing) {
      setPlaying(false);
      audio.pause();
    } else {
      setPlaying(true);
      audio.play();
    }
  };

  const select = (i: number) => {
    setEnded(false);
    setTrack(i);
    setElapsed(0);
    if (!playing) {
      setPlaying(true);
      audio.play();
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-6xl px-5 py-16">
      <header className="text-center">
        <p className="text-sm tracking-[0.4em] uppercase opacity-70">Side A</p>
        <h1 className={`${retro} mt-2 text-4xl sm:text-6xl`}>
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> & <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </h1>
        <p className="mt-2 text-lg italic opacity-75">Happy birthday — this one’s for you.</p>
      </header>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[auto_1fr]">
        <div className="lg:sticky lg:top-10">
          <div className="relative mx-auto w-fit rounded-3xl bg-gradient-to-br from-[#5a3a22] to-[#2c1a0e] p-6 shadow-[0_40px_80px_-30px_black] ring-1 ring-[#f0d9b5]/10">
            <button type="button" onClick={toggle} aria-label={playing ? 'Stop the record' : 'Play the record'} aria-pressed={playing} className="block rounded-full">
              <Record spinning={playing && !reducedMotion} size="min(72vw, 22rem)" />
            </button>
            <Tonearm down={playing} />
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={toggle} disabled={ended} className={`${retro} inline-flex h-11 items-center gap-2 rounded-full bg-[var(--bd-primary)] px-5 text-[#1f130b] disabled:opacity-40`}>
                {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 fill-current" aria-hidden />}
                {playing ? 'Pause' : ended ? 'The end' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => setElapsed(TRACK_SECONDS)}
                disabled={ended || !playing}
                aria-label="Next track"
                className="inline-flex size-11 items-center justify-center rounded-full border border-[#f0d9b5]/30 disabled:opacity-30"
              >
                <SkipForward className="size-4" aria-hidden />
              </button>
            </div>
            {!audio.available && <p className="mt-3 max-w-[22rem] text-xs opacity-60">Add a song in the studio and it will play while the record spins.</p>}
          </div>
        </div>

        <div>
          <ol className="divide-y divide-[#f0d9b5]/15 border-y border-[#f0d9b5]/15">
            {TRACKS.map((t, i) => (
              <li key={t}>
                <button type="button" onClick={() => select(i)} aria-current={track === i ? 'true' : undefined} className={cn('flex w-full items-center gap-4 py-4 text-left transition-colors', track === i ? 'text-[var(--bd-primary)]' : 'opacity-70 hover:opacity-100')}>
                  <span className={`${retro} w-20 text-sm tracking-widest`}>TRACK {String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-xl">{t}</span>
                  {track === i && playing && (
                    <span className="vl-eq flex h-4 items-end gap-0.5" aria-hidden>
                      {[0, 1, 2].map((b) => (
                        <span key={b} className="w-1 bg-current" style={{ animationDelay: `${b * 0.2}s` }} />
                      ))}
                    </span>
                  )}
                </button>
                {track === i && (
                  <div className="h-0.5 bg-[#f0d9b5]/10" aria-hidden>
                    <div className="h-full bg-[var(--bd-primary)]" style={{ width: `${Math.min(100, (elapsed / TRACK_SECONDS) * 100)}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ol>

          <section aria-live="polite" aria-label={`Now playing: ${TRACKS[track]}`} className="mt-10 min-h-[22rem]">
            <AnimatePresence mode="wait">
              {ended ? (
                <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.6 }} className="text-center lg:text-left">
                  <p className={`${retro} text-4xl sm:text-5xl`}>I’d play this song forever.</p>
                  <p className="mt-4 text-2xl italic">
                    Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />.
                  </p>
                  <p className="mt-2 opacity-75">{config.messages.final}</p>
                  <button type="button" onClick={restart} className={`${retro} mt-8 h-11 rounded-full border border-[#f0d9b5]/40 px-6`}>
                    Flip to side B (play again)
                  </button>
                </motion.div>
              ) : playing || elapsed > 0 ? (
                <motion.div key={track} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8 }}>
                  <p className={`${retro} mb-6 text-sm tracking-widest text-[var(--bd-primary)]`}>
                    NOW PLAYING · {TRACKS[track].toUpperCase()}
                  </p>
                  <TrackContent track={track} />
                </motion.div>
              ) : (
                <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl italic opacity-70">
                  Press play — or tap the record — to drop the needle.
                </motion.p>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}
