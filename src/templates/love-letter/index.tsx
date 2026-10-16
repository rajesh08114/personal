import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { Heart, Paperclip } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { formatBirthday } from '@/utils/date';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './letter.css';

const script = 'font-t-display';

export default function LoveLetter() {
  const { opened } = useExperience();
  return (
    <div className="ll-room relative min-h-dvh text-[#3a2418]">
      <Petals />
      <AnimatePresence mode="wait">{!opened ? <Envelope key="env" /> : <Letter key="letter" />}</AnimatePresence>
    </div>
  );
}

/** Slow, sparse falling rose petals. */
function Petals() {
  const { reducedMotion } = useExperience();
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className="ll-petal"
          style={{
            left: `${(i * 83) % 100}%`,
            animationDuration: `${14 + (i % 5) * 3}s`,
            animationDelay: `${-i * 2.3}s`,
            transform: `scale(${0.6 + (i % 4) * 0.2})`,
          }}
        />
      ))}
    </div>
  );
}

function Envelope({ folding = false }: { folding?: boolean }) {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  const [stage, setStage] = useState<'sealed' | 'opening'>('sealed');
  const initial = config.birthdayPerson.trim().charAt(0).toUpperCase() || '♥';

  const openLetter = () => {
    if (stage !== 'sealed') return;
    setStage('opening');
    window.setTimeout(open, 2100);
  };

  return (
    <motion.div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5" exit={{ opacity: 0, transition: { duration: 0.6 } }}>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6 }} className={`${script} mb-12 text-center text-5xl text-[var(--bd-primary)] sm:text-6xl`}>
        {config.messages.intro.trim() || 'I wrote something for you…'}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: stage === 'sealed' ? -2 : 0 }}
        transition={{ duration: 1.3, ease: EASE.out }}
        className="relative aspect-[3/2] w-[min(90vw,32rem)]"
        style={{ perspective: 1400 }}
      >
        {/* The folded letter inside */}
        <motion.div
          className="absolute inset-x-[6%] top-[10%] bottom-[6%] origin-bottom rounded-[2px] bg-[#fffaf0] p-5 shadow"
          initial={folding ? { y: '-62%', zIndex: 30 } : false}
          animate={stage === 'opening' ? { y: '-62%', zIndex: 30, rotateX: [0, -8, 0] } : { y: 0, zIndex: 1 }}
          transition={{ delay: stage === 'opening' ? 0.7 : folding ? 0.2 : 0, duration: 1.1, ease: EASE.out }}
        >
          <p className={`${script} text-3xl text-[var(--bd-primary)]`}>Dear {name}…</p>
          <div className="mt-4 space-y-2.5" aria-hidden>
            {[88, 72, 80, 54].map((w, i) => (
              <span key={i} className="block h-1 rounded bg-[#3a2418]/12" style={{ width: `${w}%` }} />
            ))}
          </div>
        </motion.div>
        <div className="paper-grain absolute inset-0 z-10 rounded-[3px] bg-[#efe2cc] shadow-[0_40px_70px_-25px_rgb(80_50_30/0.55)]" style={{ clipPath: 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)' }} />
        <motion.div
          className="absolute inset-x-0 top-0 z-20 h-[56%] origin-top rounded-t-[3px] bg-[#e7d6b9]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', backfaceVisibility: 'hidden' }}
          initial={folding ? { rotateX: 180, zIndex: 0 } : false}
          animate={stage === 'opening' || folding ? { rotateX: folding ? 0 : 180, zIndex: folding ? 25 : 0 } : { rotateX: 0 }}
          transition={{ duration: 0.8, delay: stage === 'opening' ? 0.2 : folding ? 1 : 0, ease: EASE.inOut }}
        />
        <AnimatePresence>
          {stage === 'sealed' && (
            <motion.span
              aria-hidden
              exit={{ scale: 1.5, opacity: 0, rotate: 30, transition: { duration: 0.45 } }}
              className="absolute top-[45%] left-1/2 z-30 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#c24b5a,var(--bd-primary)_60%,#5a1524)] text-3xl text-[#fbe9dc] shadow-[0_6px_14px_rgb(0_0_0/0.35),inset_0_-4px_8px_rgb(0_0_0/0.3)]"
            >
              <span className={script}>{initial}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      {!folding && (
        <motion.button
          type="button"
          onClick={openLetter}
          disabled={stage !== 'sealed'}
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'sealed' ? 1 : 0 }}
          transition={{ delay: 1.4 }}
          className="mt-12 h-13 rounded-full border border-[var(--bd-primary)] px-9 text-sm font-semibold tracking-[0.3em] text-[var(--bd-primary)] uppercase transition-colors hover:bg-[var(--bd-primary)] hover:text-[#fffaf0]"
        >
          Open my letter
        </motion.button>
      )}
    </motion.div>
  );
}

/** A line of handwriting: revealed left-to-right like ink flowing from a pen. */
function InkLine({ children, className, delay = 0, inView = true }: { children: ReactNode; className?: string; delay?: number; inView?: boolean }) {
  const trigger = inView ? { whileInView: { clipPath: 'inset(0 0% 0 0)', opacity: 1 }, viewport: { once: true, amount: 0.6 } } : { animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 } };
  return (
    <motion.div className={className} initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0.4 }} {...trigger} transition={{ duration: 2.2, ease: 'easeInOut', delay }}>
      {children}
    </motion.div>
  );
}

/**
 * Text written out word by word in reading order, so it follows the line breaks the way a pen
 * would. Each word is uncovered left to right, then the ink darkens as it soaks into the paper.
 */
function Handwriting({ text, className }: { text: string; className?: string }) {
  const words = text.split(/(\s+)/);
  let t = 0;
  const timings = words.map((w) => {
    if (/^\s+$/.test(w)) return 0;
    const start = t;
    t += Math.min(0.55, 0.06 + w.length * 0.04);
    return start;
  });
  return (
    <motion.p className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block"
            custom={timings[i]}
            variants={{
              hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0.45 },
              show: (d: number) => ({
                clipPath: 'inset(0 0% 0 0)',
                opacity: [0.45, 0.75, 1],
                transition: {
                  clipPath: { delay: d, duration: Math.min(0.5, 0.05 + w.length * 0.04), ease: 'linear' },
                  opacity: { delay: d, duration: 1.4, ease: 'easeOut' },
                },
              }),
            }}
          >
            {w}
          </motion.span>
        ),
      )}
    </motion.p>
  );
}

function Letter() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#f4b6c2']);
  const fine = useFinePointer();
  const paragraphs = splitParagraphs(config.messages.main);
  const memories = getMemories(config);
  const moments = getTimeline(config);
  const [index, setIndex] = useState<number | null>(null);
  const [stage, setStage] = useState<'reading' | 'folding' | 'done'>('reading');
  const lx = useSpring(useMotionValue(50), { stiffness: 60, damping: 20 });
  const ly = useSpring(useMotionValue(30), { stiffness: 60, damping: 20 });
  const date = formatBirthday(config.birthdayDate) ?? new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  const lamp = useLamp(lx, ly);

  useEffect(() => {
    if (stage !== 'folding') return;
    const t = window.setTimeout(() => {
      setStage('done');
      fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2, shape: 'heart', count: 30, colors, speed: 320, size: 16 });
    }, 2600);
    return () => window.clearTimeout(t);
  }, [stage, fx, colors]);

  const paras = paragraphs.length ? paragraphs : [''];
  const photoAfter = (i: number) => memories.filter((_, k) => k % paras.length === i).slice(0, 2);

  if (stage !== 'reading') {
    return (
      <motion.section key="fold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 text-center" aria-live="polite">
        {stage === 'folding' ? (
          <motion.div
            className="relative aspect-[3/4] w-[min(80vw,22rem)] bg-[#fffaf0] shadow-xl"
            initial={{ scaleY: 1, rotateX: 0 }}
            animate={{ scaleY: [1, 0.5, 0.25], rotateX: [0, 60, 0], y: [0, 0, 40], opacity: [1, 1, 0] }}
            transition={{ duration: 2.4, ease: EASE.inOut, times: [0, 0.5, 1] }}
            style={{ transformPerspective: 1000 }}
          >
            <p className={`${script} p-8 text-left text-3xl text-[var(--bd-primary)]`}>Dear {name}…</p>
          </motion.div>
        ) : (
          <>
            <Envelope folding />
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.4 }} className={`${script} -mt-24 text-6xl text-[var(--bd-primary)] sm:text-7xl`}>
              Happy Birthday, My Love <Heart className="inline size-10 fill-[var(--bd-accent)] text-[var(--bd-accent)]" aria-hidden />
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-4 text-xl italic">
              {config.messages.final}
            </motion.p>
            <button type="button" onClick={restart} className="mt-8 h-11 text-lg italic text-[#3a2418]/60 underline underline-offset-4 hover:text-[#3a2418]">
              Read it again
            </button>
          </>
        )}
      </motion.section>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, scaleY: 0.3, y: 120 }}
      animate={{ opacity: 1, scaleY: 1, y: 0 }}
      transition={{ duration: 1.4, ease: EASE.out }}
      style={{ transformOrigin: 'top center' }}
      className="relative z-10 px-3 py-14 sm:px-6 sm:py-20"
    >
      <article
        className="paper-grain relative mx-auto max-w-3xl overflow-hidden rounded-[2px] bg-[#fffaf0] px-6 pt-14 pb-20 shadow-[0_50px_100px_-40px_rgb(80_50_30/0.55)] sm:px-16"
        onPointerMove={(e) => {
          if (!fine) return;
          const r = e.currentTarget.getBoundingClientRect();
          lx.set(((e.clientX - r.left) / r.width) * 100);
          ly.set(((e.clientY - r.top) / r.height) * 100);
        }}
      >
        {/* Cursor-controlled lamp light */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: lamp }}
        />
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-[#3a2418]/5" />
        <span aria-hidden className="absolute inset-x-0 top-1/3 h-px bg-[#3a2418]/5" />

        <p className="relative text-right text-sm tracking-[0.3em] text-[#3a2418]/60 uppercase">{date}</p>
        <InkLine inView={false} delay={0.8} className="relative mt-8">
          <h1 className={`${script} text-6xl text-[var(--bd-primary)] sm:text-7xl`}>
            Dear <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />…
          </h1>
        </InkLine>

        <div className="relative mt-10 space-y-8 text-[1.45rem] leading-[1.8] sm:text-[1.6rem]">
          {paras.map((p, i) => (
            <div key={i}>
              {p ? (
                <Handwriting text={p} />
              ) : (
                <InkLine>
                  <p>
                    <Fill value="" placeholder={PLACEHOLDER.message} />
                  </p>
                </InkLine>
              )}
              {photoAfter(i).map((m, k) => (
                <motion.figure
                  key={m.id}
                  initial={{ opacity: 0, x: k % 2 ? 160 : -160, rotate: k % 2 ? 14 : -14 }}
                  whileInView={{ opacity: 1, x: 0, rotate: k % 2 ? 3 : -3 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ type: 'spring', stiffness: 60, damping: 14 }}
                  className={cn('relative my-8 w-56 bg-white p-2 pb-3 shadow-[0_14px_30px_-12px_rgb(80_50_30/0.5)] sm:w-64', k % 2 ? 'ml-auto' : '')}
                >
                  <Paperclip className="absolute -top-4 left-5 size-8 -rotate-12 text-[#a39c94]" aria-hidden />
                  <button type="button" onClick={() => setIndex(m.index)} className="block w-full" aria-label={`Look closer at ${m.titleText}`}>
                    <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="aspect-[4/5] w-full" imgClassName="sepia-[0.18] saturate-[0.9]" />
                  </button>
                  <figcaption className={`${script} mt-2 text-center text-2xl`}>{m.titleText}</figcaption>
                  {(m.date || m.place) && <p className="text-center text-xs tracking-widest text-[#3a2418]/50 uppercase">{[m.date, m.place].filter(Boolean).join(' · ')}</p>}
                </motion.figure>
              ))}
            </div>
          ))}
        </div>

        <section aria-labelledby="ll-moments" className="relative mt-14">
          <InkLine>
            <h2 id="ll-moments" className={`${script} text-4xl text-[var(--bd-primary)]`}>
              The moments I keep closest…
            </h2>
          </InkLine>
          <ol className="mt-6 space-y-5">
            {moments.map((t) => (
              <li key={t.id} className="flex gap-4 border-b border-dashed border-[#3a2418]/15 pb-5">
                <span className="w-24 shrink-0 text-sm tracking-wider text-[#3a2418]/55 uppercase">{t.date ?? '—'}</span>
                <span>
                  <span className="block text-xl font-semibold">{t.titleText}</span>
                  <span className="block text-lg italic text-[#3a2418]/75">{t.captionText}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="relative mt-16">
          <InkLine>
            <p className="text-2xl leading-relaxed italic">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
          </InkLine>
          <InkLine delay={0.4} className="mt-10">
            <p className="text-xl italic">Forever yours,</p>
            <p className={`${script} mt-1 text-6xl text-[var(--bd-primary)]`}>
              <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
            </p>
          </InkLine>
        </div>
      </article>

      <div className="mt-14 text-center">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStage('folding');
          }}
          className="h-13 rounded-full bg-[var(--bd-primary)] px-9 text-sm font-semibold tracking-[0.25em] text-[#fffaf0] uppercase shadow-lg"
        >
          Fold the letter
        </button>
      </div>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={`${script} text-3xl`} />
    </motion.main>
  );
}

function useLamp(x: ReturnType<typeof useSpring>, y: ReturnType<typeof useSpring>) {
  const bg = useMotionValue('');
  useEffect(() => {
    const update = () => bg.set(`radial-gradient(circle at ${x.get()}% ${y.get()}%, rgb(255 214 150 / 0.75), transparent 45%)`);
    update();
    const a = x.on('change', update);
    const b = y.on('change', update);
    return () => {
      a();
      b();
    };
  }, [x, y, bg]);
  return bg;
}
