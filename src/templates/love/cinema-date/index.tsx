import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Play } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './cinema.css';

const lime = 'font-t-display';
const CHAPTERS = ['How We Met', 'First Memories', 'Best Moments', 'Things I Love About You', 'Our Future'];
const SCENE_SECONDS = 8;

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .filter(Boolean);
}

export default function CinemaDate() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#0a0506] text-[#e8e2d6]">
      <AnimatePresence>{!opened && <Lobby key="l" />}</AnimatePresence>
      {opened && <Theater />}
    </div>
  );
}

function Lobby() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0506] px-6 text-center" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <div className="cd-ticket relative w-[min(90vw,26rem)] rounded-xl bg-[#e2b250] p-6 text-[#1a0d0e]">
        <p className="text-xs font-semibold tracking-[0.4em]">ADMIT TWO · PRIVATE SCREENING</p>
        <p className={`${lime} mt-3 text-4xl`}>The Story of Us</p>
        <p className="mt-2 text-sm">
          Reserved for <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> · Row L, seats 1 & 2
        </p>
      </div>
      <p className="mt-8 max-w-md text-lg text-[#e8e2d6]/75">{config.messages.intro.trim() || 'I booked the whole theatre. Just for us.'}</p>
      <button type="button" onClick={open} className={`${lime} mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-[#7a0f1c] px-8 text-lg shadow-[0_10px_30px_-10px_#7a0f1c]`}>
        <Play className="size-4 fill-current" aria-hidden /> Take your seats
      </button>
    </motion.div>
  );
}

function Scene({ chapter }: { chapter: number }) {
  const { config } = useExperience();
  const timeline = getTimeline(config);
  const memories = getMemories(config);
  const lines = useMemo(() => sentences(config.messages.main), [config.messages.main]);
  const [still, setStill] = useState(0);

  useEffect(() => {
    setStill(0);
    const t = window.setInterval(() => setStill((s) => s + 1), 2600);
    return () => window.clearInterval(t);
  }, [chapter]);

  if (chapter === 0) {
    const t = timeline[0];
    return (
      <div className="relative h-full w-full">
        <PhotoSlot src={t?.image} alt={t?.titleText ?? 'How we met'} label="Add a photo" className="h-full w-full" imgClassName="cd-kenburns" />
        <p className="absolute inset-x-4 bottom-4 mx-auto max-w-xl bg-black/70 px-3 py-1.5 text-center text-lg">{t?.captionText}</p>
      </div>
    );
  }
  if (chapter === 1 || chapter === 2) {
    const set = (chapter === 1 ? memories.slice(0, 3) : memories.slice(3, 6)).filter(Boolean);
    const list = set.length ? set : memories.slice(0, 3);
    const m = list[still % list.length];
    return (
      <div className="relative h-full w-full">
        <AnimatePresence mode="popLayout">
          <motion.div key={m.id + still} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
            <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>
        <p className="absolute inset-x-4 bottom-4 mx-auto max-w-xl bg-black/70 px-3 py-1.5 text-center text-lg">
          {m.titleText} — {m.captionText}
        </p>
      </div>
    );
  }
  if (chapter === 3) {
    const list = lines.length ? lines : [PLACEHOLDER.message];
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p key={still % list.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={`${lime} max-w-2xl text-2xl leading-snug sm:text-4xl`}>
            {list[still % list.length]}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }
  return (
    <div className="relative h-full w-full">
      <PhotoSlot src={config.finalImage ?? config.heroImage} alt="Our future" label="Add a final photo" className="h-full w-full" imgClassName="cd-kenburns" />
      <p className={`${lime} absolute inset-x-4 bottom-4 text-center text-2xl drop-shadow`}>To be continued… together.</p>
    </div>
  );
}

function Credits() {
  const { config, fx } = useExperience();
  const { name, sender } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const [end, setEnd] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-center">
      {!end ? (
        <motion.div
          className="absolute inset-x-0 space-y-8 py-10"
          initial={{ y: '100%' }}
          animate={{ y: '-100%' }}
          transition={{ duration: 16, ease: 'linear' }}
          onAnimationComplete={() => {
            setEnd(true);
            fx.rain({ colors, shapes: ['heart'], count: 60, size: 12, duration: 4 });
          }}
        >
          {[
            ['Written by', 'Life'],
            ['Directed by', 'Fate'],
            ['Starring', `${name} & ${sender}`],
            ['Filmed on location', 'Everywhere we’ve been'],
            ['Special thanks', 'Every coffee, every late night, every “one more episode”'],
          ].map(([role, who]) => (
            <div key={role}>
              <p className="text-xs tracking-[0.4em] text-[#e8e2d6]/60 uppercase">{role}</p>
              <p className={`${lime} mt-1 text-2xl sm:text-3xl`}>{who}</p>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="flex h-full flex-col items-center justify-center p-6" role="status">
          <p className={`${lime} text-4xl text-[#e2b250] sm:text-6xl`}>
            HAPPY BIRTHDAY <Heart className="inline size-8 fill-current sm:size-12" aria-hidden />
          </p>
          <p className="mt-4 max-w-lg text-lg">
            <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
          </p>
        </motion.div>
      )}
      <button type="button" onClick={() => setEnd(true)} className={cn('absolute right-3 bottom-3 h-9 rounded px-3 text-xs tracking-widest text-[#e8e2d6]/50 uppercase hover:text-[#e8e2d6]', end && 'hidden')}>
        Skip credits
      </button>
    </div>
  );
}

function Theater() {
  const { config, restart, reducedMotion } = useExperience();
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [chapter, setChapter] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [burn, setBurn] = useState(0);
  const [credits, setCredits] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setCurtainsOpen(true), reducedMotion ? 0 : 600);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (!playing || chapter === null) return;
    const t = window.setTimeout(() => {
      if (chapter < CHAPTERS.length - 1) {
        setChapter(chapter + 1);
        setBurn((b) => b + 1);
      } else {
        setPlaying(false);
        setCredits(true);
        setBurn((b) => b + 1);
      }
    }, SCENE_SECONDS * 1000);
    return () => window.clearTimeout(t);
  }, [playing, chapter]);

  const choose = (i: number) => {
    setCredits(false);
    setChapter(i);
    setBurn((b) => b + 1);
  };

  return (
    <main className="relative z-10">
      <section aria-label="The screening room" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-3 pt-10 pb-6">
        <div aria-hidden className="cd-beam pointer-events-none absolute bottom-0 left-1/2 h-[85%] w-[120%] -translate-x-1/2" />
        <div className="relative w-full max-w-5xl">
          <div className="cd-screen relative aspect-video w-full overflow-hidden bg-[#141011]">
            <AnimatePresence mode="wait">
              {credits ? (
                <motion.div key="credits" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Credits />
                </motion.div>
              ) : chapter === null ? (
                <motion.div key="title" className="absolute inset-0 flex flex-col items-center justify-center bg-[#e8e2d6] text-center text-[#1a0d0e]" initial={{ opacity: 0 }} animate={{ opacity: curtainsOpen ? 1 : 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, delay: 1.6 }}>
                  <p className="text-xs font-semibold tracking-[0.5em] sm:text-sm">TONIGHT’S FEATURE</p>
                  <p className={`${lime} mt-2 text-4xl sm:text-7xl`}>The Story of Us</p>
                  <p className="mt-3 text-sm sm:text-base">
                    starring <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> & <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
                  </p>
                </motion.div>
              ) : (
                <motion.div key={`ch${chapter}`} className="cd-flicker absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                  <Scene chapter={chapter} />
                  <p className={`${lime} absolute top-3 left-4 text-sm tracking-widest text-[#e2b250] drop-shadow sm:text-base`}>
                    Chapter {chapter + 1} · {CHAPTERS[chapter]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {burn > 0 && !reducedMotion && <motion.span key={burn} aria-hidden className="cd-burn pointer-events-none absolute inset-0" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} />}
            </AnimatePresence>
          </div>
          <motion.div aria-hidden className="cd-curtain absolute inset-y-[-6%] left-[-4%] z-10 w-[56%] origin-left" initial={{ scaleX: 1 }} animate={{ scaleX: curtainsOpen ? 0.12 : 1 }} transition={{ duration: 2.6, ease: EASE.inOut }} />
          <motion.div aria-hidden className="cd-curtain absolute inset-y-[-6%] right-[-4%] z-10 w-[56%] origin-right" initial={{ scaleX: 1 }} animate={{ scaleX: curtainsOpen ? 0.12 : 1 }} transition={{ duration: 2.6, ease: EASE.inOut }} />
          <div aria-hidden className="absolute inset-x-[-4%] -top-[8%] z-20 h-[10%] rounded-b-[40%] bg-gradient-to-b from-[#5a0a14] to-[#7a0f1c] shadow-xl" />
        </div>

        <nav aria-label="Scene selection" className="relative z-20 mt-8 w-full max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPlaying(true);
                choose(chapter === null || credits ? 0 : chapter);
              }}
              className={`${lime} inline-flex h-11 items-center gap-2 rounded-full bg-[#e2b250] px-5 text-[#1a0d0e]`}
            >
              <Play className="size-4 fill-current" aria-hidden /> {playing ? 'Playing…' : 'Play the feature'}
            </button>
            {CHAPTERS.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  choose(i);
                }}
                aria-current={chapter === i && !credits ? 'true' : undefined}
                className={cn('h-11 rounded-full border px-4 text-sm transition-colors', chapter === i && !credits ? 'border-[#e2b250] text-[#e2b250]' : 'border-[#e8e2d6]/20 text-[#e8e2d6]/70 hover:text-[#e8e2d6]')}
              >
                {i + 1}. {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setCredits(true);
                setBurn((b) => b + 1);
              }}
              className="h-11 rounded-full border border-[#e8e2d6]/20 px-4 text-sm text-[#e8e2d6]/70 hover:text-[#e8e2d6]"
            >
              Roll credits
            </button>
          </div>
        </nav>

        <div aria-hidden className="relative z-20 mt-10 flex w-full max-w-4xl justify-center gap-2 sm:gap-3">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={cn('h-10 w-[8%] rounded-t-2xl bg-[#2a1214] sm:h-14', (i === 4 || i === 5) && 'bg-[#7a0f1c]')} />
          ))}
        </div>
        <button type="button" onClick={restart} className="relative z-20 mt-6 h-11 text-xs tracking-[0.3em] text-[#e8e2d6]/40 uppercase hover:text-[#e8e2d6]">
          Back to the lobby
        </button>
      </section>
    </main>
  );
}
