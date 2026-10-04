import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { cn } from '@/utils/cn';

const fancy = 'font-t-display';
const lined = 'bg-[repeating-linear-gradient(#fdfbf4_0_2.05rem,#c9d8ea_2.05rem_2.12rem)]';

interface Entry {
  id: string;
  date?: string;
  title: string;
  text: string;
  image?: string;
  place?: string;
  secret?: string;
}

function useEntries(): Entry[] {
  const { config } = useExperience();
  const paras = splitParagraphs(config.messages.main);
  const pool = [...getTimeline(config), ...getMemories(config).filter((m) => m.hasTitle || m.image)].slice(0, 8);
  return pool.map((m, i) => ({
    id: m.id,
    date: m.date,
    title: m.titleText,
    text: m.captionText,
    image: m.image,
    place: m.place,
    secret: i % 2 === 1 ? (paras[Math.floor(i / 2)] ?? undefined) : undefined,
  }));
}

export default function HandwrittenJournal() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#3b4a5a] text-[#1f2a36]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgb(255_240_210/0.18),transparent_60%),repeating-linear-gradient(90deg,rgb(0_0_0/0.05)_0_2px,transparent_2px_120px)]" />
      <AnimatePresence>{!opened && <Cover key="c" />}</AnimatePresence>
      {opened && <Journal />}
    </div>
  );
}

function Cover() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3b4a5a] px-4" exit={{ rotateY: -95, opacity: 0, transition: { duration: 1 } }} style={{ transformOrigin: 'left center', perspective: 1400 }}>
      <button type="button" onClick={open} aria-label="Open our journal" className="relative aspect-[3/4] w-[min(80vw,24rem)] rounded-r-2xl bg-[#2f5d8a] p-8 text-left shadow-[12px_16px_40px_rgb(0_0_0/0.5)] transition-transform hover:-rotate-1">
        <span aria-hidden className="absolute inset-y-0 left-6 w-1.5 bg-[#24496d]" />
        <span aria-hidden className="absolute inset-y-6 right-0 w-3 rounded-l bg-[#d9534f]" />
        <span className="relative mt-10 block rounded bg-[#fdfbf4] px-5 py-4 shadow">
          <span className="block text-xs tracking-[0.3em] uppercase opacity-60">private</span>
          <span className={`${fancy} mt-3 block text-xl leading-loose`}>
            <Fill value={config.birthdayPerson} placeholder="[NAME]" /> & <Fill value={config.senderName} placeholder="[YOU]" />
          </span>
        </span>
        <span className="absolute bottom-8 left-10 text-lg text-[#fdfbf4]/85">{config.messages.intro.trim() || 'everything I never want to forget…'}</span>
      </button>
    </motion.div>
  );
}

function Corner({ secret }: { secret: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fold the corner back' : 'Unfold the corner to read a secret'}
        aria-expanded={open}
        className="absolute right-0 bottom-0 z-20 size-14 bg-[linear-gradient(135deg,transparent_50%,#e8dfcc_50%)] shadow-[-3px_-3px_6px_rgb(0_0_0/0.12)] transition-transform hover:scale-110"
      />
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.4, x: 20, y: 20 }} animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute right-4 bottom-16 z-20 max-w-[85%] rotate-[-2deg] bg-[#fff6a8] p-4 text-lg leading-snug shadow-lg" role="note" style={{ transformOrigin: 'bottom right' }}>
            <span className="block text-xs tracking-widest text-[var(--bd-accent)] uppercase">secret</span>
            {secret}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PageFace({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(lined, 'absolute inset-0 overflow-hidden px-6 pt-8 pb-10 sm:px-8', className)}>{children}</div>;
}

function EntryPage({ e, index }: { e: Entry; index: number }) {
  return (
    <PageFace>
      <span aria-hidden className="absolute inset-y-0 left-10 w-px bg-[#e8a3a3]" />
      <div className="pl-6">
        <p className="text-sm tracking-widest text-[var(--bd-primary)] uppercase">{e.date ?? `page ${index + 1}`}</p>
        <h3 className="mt-1 text-3xl leading-tight font-bold">{e.title}</h3>
        <div className="relative mx-auto mt-4 w-[78%] rotate-[-2deg] bg-white p-2 pb-3 shadow-md">
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-3" aria-hidden />
          <PhotoSlot src={e.image} alt={e.title} label="Tape a photo here" tone="light" className="aspect-[4/3] w-full" />
        </div>
        <p className="mt-4 text-xl leading-[2.12rem]">{e.text}</p>
        {e.place && <p className="text-base text-[#1f2a36]/60">— {e.place}</p>}
        <svg viewBox="0 0 80 30" className="mt-2 h-8 w-20 text-[var(--bd-accent)]" aria-hidden>
          <path d="M5 20 C 15 0, 25 30, 35 12 S 55 2, 75 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      {e.secret && <Corner secret={e.secret} />}
    </PageFace>
  );
}

function Journal() {
  const { config, fx, restart, reducedMotion } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const desktop = useMediaQuery('(min-width: 900px)');
  const entries = useEntries();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [p, setP] = useState(0);
  const [wrote, setWrote] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setP(v);
    if (v > 0.97 && !wrote) {
      setWrote(true);
      window.setTimeout(() => fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2, shape: 'heart', colors, count: 24, size: 14, speed: 300 }), 3200);
    }
  });
  const n = entries.length;
  const pos = p * n;

  const finalPage = (
    <PageFace>
      <div className="flex h-full flex-col items-center justify-center text-center">
        {wrote || reducedMotion ? (
          <>
            <motion.p initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 2.4, ease: 'easeInOut' }} className={`${fancy} text-xl leading-loose sm:text-2xl`}>
              There’s still so much more to write…
            </motion.p>
            <motion.p initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ delay: 2.4, duration: 1.4, ease: 'easeInOut' }} className={`${fancy} mt-6 text-2xl text-[var(--bd-accent)] sm:text-3xl`}>
              Happy Birthday ♥
            </motion.p>
          </>
        ) : (
          <p className="text-lg text-[#1f2a36]/40">(a blank page…)</p>
        )}
      </div>
    </PageFace>
  );

  if (reducedMotion) {
    return (
      <main className="mx-auto max-w-xl space-y-8 px-4 py-14">
        {entries.map((e, i) => (
          <div key={e.id} className="relative aspect-[3/4] shadow-xl">
            <EntryPage e={e} index={i} />
          </div>
        ))}
        <div className="relative aspect-[3/4] shadow-xl">{finalPage}</div>
        <Tail />
      </main>
    );
  }

  return (
    <main>
      <header className="px-5 pt-14 pb-6 text-center text-[#fdfbf4]">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </h1>
        <p className="mt-2 text-lg opacity-75">Scroll to turn the pages. Folded corners hide secrets.</p>
      </header>
      <div ref={ref} style={{ height: `${(n + 1) * 95}vh` }} className="relative">
        <div className="sticky top-0 flex h-dvh items-center justify-center px-3">
          <div className={cn('relative', desktop ? 'aspect-[3/2] w-[min(94vw,62rem)]' : 'aspect-[3/4] w-[min(92vw,28rem)]')} style={{ perspective: 2200 }}>
            {desktop && (
              <div className={cn(lined, 'absolute inset-y-0 left-0 w-1/2 rounded-l-md shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]')}>
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="w-[70%] rotate-2 bg-white p-2 pb-6 shadow-md">
                    <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden />
                    <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" className="aspect-square w-full" />
                  </div>
                  <p className={`${fancy} mt-6 text-base`}>this journal belongs to us</p>
                </div>
              </div>
            )}
            <div className={cn('absolute inset-y-0 right-0 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]', desktop ? 'w-1/2' : 'w-full')}>
              <div className="absolute inset-0 rounded-r-md">{finalPage}</div>
              {entries.map((e, i) => {
                const f = Math.min(1, Math.max(0, pos - i));
                const flipped = f > 0.5;
                const angle = -180 * f;
                if (!desktop && f >= 1) return null;
                return (
                  <div
                    key={e.id}
                    className="absolute inset-0 origin-left"
                    style={{ transform: `rotateY(${desktop ? angle : angle * 0.6}deg)`, transformStyle: 'preserve-3d', zIndex: flipped ? i + 1 : n - i + 1, opacity: !desktop && f > 0.85 ? (1 - f) / 0.15 : 1 }}
                    aria-hidden={flipped}
                  >
                    <div className="absolute inset-0 rounded-r-md" style={{ backfaceVisibility: 'hidden' }}>
                      <EntryPage e={e} index={i} />
                      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/0 to-black/10" style={{ opacity: f }} />
                    </div>
                    <div className="absolute inset-0 rounded-l-md" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <PageFace>
                        <div className="flex h-full items-center justify-center">
                          <p className="rotate-[-4deg] text-2xl text-[var(--bd-primary)]/70">♡ {i + 1} ♡</p>
                        </div>
                      </PageFace>
                    </div>
                  </div>
                );
              })}
            </div>
            {desktop && <span aria-hidden className="absolute inset-y-0 left-1/2 z-[60] w-2 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/5 to-black/25" />}
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-[#fdfbf4]/60" aria-live="polite">
            page {Math.min(n + 1, Math.floor(pos) + 1)} of {n + 1}
          </p>
        </div>
      </div>
      <Tail onRestart={restart} />
    </main>
  );
}

function Tail({ onRestart }: { onRestart?: () => void }) {
  const { config } = useExperience();
  return (
    <section aria-label="A last note" className="px-5 py-20 text-center text-[#fdfbf4]">
      <p className="mx-auto max-w-xl text-2xl leading-relaxed">
        <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
      </p>
      <p className={`${fancy} mt-6 text-lg`}>— <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} /></p>
      {onRestart && (
        <button type="button" onClick={onRestart} className="mt-10 h-11 text-lg underline underline-offset-4 opacity-70 hover:opacity-100">
          close the journal
        </button>
      )}
    </section>
  );
}
