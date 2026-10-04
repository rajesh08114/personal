import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Mail, Star } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline, type ResolvedMemory } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const marker = 'font-t-display';

export default function Scrapbook() {
  const { opened } = useExperience();
  return (
    <div className="paper-grain relative min-h-dvh overflow-hidden bg-[#c9a57a] text-[#3a2f28]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(60_40_20/0.35))]" />
      <AnimatePresence mode="wait">{!opened ? <Cover key="cover" /> : <Book key="book" />}</AnimatePresence>
    </div>
  );
}

function Cover() {
  const { config, open } = useExperience();
  return (
    <motion.div
      className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10"
      exit={{ rotateY: -100, opacity: 0, transition: { duration: 0.9, ease: EASE.inOut } }}
      style={{ transformOrigin: 'left center', perspective: 1400 }}
    >
      <motion.button
        type="button"
        onClick={open}
        aria-label="Open the birthday scrapbook"
        initial={{ y: 40, opacity: 0, rotate: -3 }}
        animate={{ y: 0, opacity: 1, rotate: -1.5 }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        className="relative aspect-[3/4] w-[min(86vw,26rem)] rounded-r-2xl rounded-l-md bg-[#b5523b] p-8 text-left shadow-[10px_12px_0_#8f3f2d,18px_24px_40px_rgb(0_0_0/0.35)]"
      >
        <span className="absolute inset-y-0 left-0 w-5 rounded-l-md bg-[#8f3f2d]" aria-hidden />
        <span className="absolute inset-4 left-9 rounded-xl border-2 border-dashed border-[#f7efe2]/40" aria-hidden />
        <span className="relative mt-6 block -rotate-2 bg-[#f7efe2] px-5 py-4 shadow-md">
          <span className={`${marker} block text-3xl leading-tight text-[#b5523b]`}>
            <Fill value={config.birthdayPerson} placeholder="[NAME]" />’s
          </span>
          <span className={`${marker} block text-4xl leading-tight text-[#3a2f28]`}>Birthday Book</span>
        </span>
        <span className="absolute right-6 bottom-28 inline-flex size-16 rotate-12 items-center justify-center rounded-full bg-[#ffd166] shadow-md">
          <Star className="size-8 fill-[#b5523b] text-[#b5523b]" aria-hidden />
        </span>
        <span className="absolute bottom-8 left-12 -rotate-6 rounded-md bg-[#3d5a80] px-3 py-1 text-lg text-white shadow">
          {config.messages.intro.trim() || 'open me!'}
        </span>
      </motion.button>
      <p className="mt-8 text-xl text-[#3a2f28]/80">Tap the cover to open</p>
    </motion.div>
  );
}

function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('paper-grain absolute inset-0 overflow-y-auto rounded-r-2xl rounded-l-sm bg-[#fbf5ea] p-6 sm:p-8', className)}
      style={{ backgroundImage: 'radial-gradient(circle at 0 50%, rgb(0 0 0 / 0.08), transparent 6%)' }}
    >
      {children}
    </div>
  );
}

function Taped({ children, rotate = -2, className }: { children: ReactNode; rotate?: number; className?: string }) {
  return (
    <div className={cn('relative bg-white p-2 pb-3 shadow-[0_8px_18px_-8px_rgb(0_0_0/0.4)]', className)} style={{ transform: `rotate(${rotate}deg)` }}>
      <span className="tape -top-3 left-1/2 z-10 -translate-x-1/2 rotate-[-5deg]" aria-hidden />
      {children}
    </div>
  );
}

function Sticker({ children, className, color }: { children: ReactNode; className: string; color: string }) {
  const constraints = useRef<HTMLElement | null>(null);
  return (
    <motion.span
      ref={(el) => {
        constraints.current = el?.closest('[data-page]') as HTMLElement | null;
      }}
      drag
      dragConstraints={constraints}
      dragMomentum={false}
      whileDrag={{ scale: 1.2, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      aria-hidden
      className={cn('absolute z-20 inline-flex cursor-grab touch-none items-center justify-center rounded-full shadow-md active:cursor-grabbing', className)}
      style={{ background: color }}
    >
      {children}
    </motion.span>
  );
}

function StickyNote({ memory }: { memory: ResolvedMemory }) {
  const [lifted, setLifted] = useState(false);
  return (
    <div className="relative mt-3 min-h-16">
      <p className="px-2 text-lg leading-snug">{memory.captionText}</p>
      <motion.button
        type="button"
        onClick={() => setLifted(true)}
        aria-label={`Lift the sticky note to read about ${memory.titleText}`}
        aria-expanded={lifted}
        animate={lifted ? { rotate: -35, y: -40, x: 90, opacity: 0 } : { rotate: 2 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className={cn('absolute inset-0 bg-[#ffe66d] px-3 py-2 text-left text-base shadow-md', lifted && 'pointer-events-none')}
        style={{ transformOrigin: 'top left' }}
      >
        lift me ↗
      </motion.button>
    </div>
  );
}

function Book() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffd166', '#ffffff']);
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [finalTurned, setFinalTurned] = useState(false);

  const memoryPages: ResolvedMemory[][] = [];
  for (let i = 0; i < memories.length; i += 2) memoryPages.push(memories.slice(i, i + 2));

  const pages: Array<{ label: string; node: ReactNode }> = [
    {
      label: 'Happy birthday',
      node: (
        <Page>
          <p className={`${marker} text-center text-4xl leading-tight text-[var(--bd-primary)] sm:text-5xl`}>
            Happy Birthday,
            <br />
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />!
          </p>
          <Taped rotate={-3} className="mx-auto mt-8 w-[78%]">
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" className="aspect-square w-full" />
          </Taped>
          <p className="mt-6 text-center text-xl">this whole book is about you ♡</p>
          <Sticker className="top-6 right-5 size-14 rotate-12 text-2xl" color="#ffd166">
            ★
          </Sticker>
          <Sticker className="bottom-16 left-4 size-12 -rotate-6 text-xl text-white" color="#ef476f">
            ♥
          </Sticker>
          <Sticker className="bottom-6 right-8 size-11 text-lg text-white" color="#3d5a80">
            ☺
          </Sticker>
        </Page>
      ),
    },
    {
      label: 'A message',
      node: (
        <Page className="bg-[repeating-linear-gradient(#fbf5ea_0_2.1rem,rgb(61_90_128/0.25)_2.1rem_2.18rem)]">
          <p className={`${marker} text-3xl text-[var(--bd-secondary)]`}>Dear <Fill value={config.birthdayPerson} placeholder="[NAME]" />,</p>
          <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-3 space-y-[2.18rem] text-[1.35rem] leading-[2.18rem]" />
          <p className="mt-[2.18rem] text-right text-2xl">
            xoxo, <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </Page>
      ),
    },
    ...memoryPages.map((pair, p) => ({
      label: `Memories ${p + 1}`,
      node: (
        <Page>
          <p className={`${marker} text-2xl text-[var(--bd-primary)]`}>{p === 0 ? 'Some moments worth remembering…' : 'More of us…'}</p>
          <div className="mt-6 space-y-8">
            {pair.map((m, i) => (
              <div key={m.id} className={cn('w-[82%]', i % 2 ? 'ml-auto' : '')}>
                <Taped rotate={i % 2 ? 3 : -3}>
                  <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} tone="light" className="aspect-[4/3] w-full" />
                  <p className={`${marker} mt-2 text-center text-lg`}>{m.titleText}</p>
                </Taped>
                {i === 0 ? <StickyNote memory={m} /> : <p className="mt-3 px-2 text-lg leading-snug">{m.captionText}</p>}
              </div>
            ))}
          </div>
        </Page>
      ),
    })),
    {
      label: 'Our story',
      node: (
        <Page>
          <p className={`${marker} text-3xl text-[var(--bd-secondary)]`}>Our little story…</p>
          <ol className="relative mt-6 space-y-6 border-l-[3px] border-dashed border-[var(--bd-primary)]/50 pl-6">
            {timeline.map((t, i) => (
              <li key={t.id} className="relative">
                <span className="absolute top-1 -left-[2.15rem] inline-flex size-7 items-center justify-center rounded-full bg-[var(--bd-accent)] text-sm font-bold shadow" aria-hidden>
                  {i + 1}
                </span>
                <div className="flex gap-3">
                  <div className="w-24 shrink-0 rotate-[-2deg] bg-white p-1 shadow">
                    <PhotoSlot src={t.image} alt={t.titleText} label="Photo" tone="light" className="aspect-square w-full" />
                  </div>
                  <div>
                    <p className={`${marker} text-lg`}>{t.titleText}</p>
                    <p className="text-lg leading-snug">{t.captionText}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Page>
      ),
    },
    {
      label: 'An envelope',
      node: (
        <Page className="flex flex-col items-center">
          <p className={`${marker} text-center text-3xl`}>Something tucked inside…</p>
          <div className="relative mt-auto mb-6 h-[22rem] w-[90%]" style={{ perspective: 900 }}>
            <motion.div
              className="absolute inset-x-[7%] bottom-4 bg-white p-5 shadow-md"
              initial={false}
              animate={envelopeOpen ? { y: -150, zIndex: 40 } : { y: 0, zIndex: 10 }}
              transition={{ delay: envelopeOpen ? 0.45 : 0, type: 'spring', stiffness: 80, damping: 14 }}
            >
              <p className="text-lg leading-snug">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <Heart className="mt-2 size-5 fill-[var(--bd-primary)] text-[var(--bd-primary)]" aria-hidden />
            </motion.div>
            <div aria-hidden className="absolute inset-x-0 bottom-0 z-[5] h-40 rounded-md bg-[#d9b383]" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 rounded-b-md bg-[#e9c9a0] shadow-lg"
              style={{ clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)' }}
            />
            {!envelopeOpen && (
              <button
                type="button"
                onClick={() => setEnvelopeOpen(true)}
                aria-label="Open the envelope"
                className="absolute inset-x-0 bottom-0 z-50 h-64 rounded-md"
              />
            )}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-40 z-30 h-24 origin-bottom bg-[#dcb88a]"
              style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}
              initial={false}
              animate={envelopeOpen ? { rotateX: 0, opacity: 1 } : { rotateX: 180, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {!envelopeOpen && (
              <span className="pointer-events-none absolute bottom-12 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[var(--bd-primary)] px-3 py-1 text-white">
                <Mail className="size-4" aria-hidden /> open me
              </span>
            )}
          </div>
        </Page>
      ),
    },
    {
      label: 'The last page',
      node: (
        <Page className="flex flex-col items-center justify-center text-center">
          {!finalTurned ? (
            <>
              <p className={`${marker} text-3xl`}>One more page to write…</p>
              <button
                type="button"
                onClick={() => {
                  setFinalTurned(true);
                  fx.cannons({ colors, count: 200 });
                }}
                className="mt-8 h-12 rounded-full bg-[var(--bd-primary)] px-6 text-xl text-white shadow-md transition-transform hover:-rotate-2"
              >
                write it together →
              </button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
              <p className={`${marker} text-5xl leading-tight text-[var(--bd-primary)]`}>
                Happy Birthday
                <br />
                <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
              </p>
              <Taped rotate={2} className="mx-auto mt-6 w-[70%]">
                <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo for ${name}`} label="Add a final photo" tone="light" className="aspect-[4/3] w-full" />
              </Taped>
              <p className="mt-5 text-xl">{config.messages.final}</p>
              <button type="button" onClick={restart} className="mt-4 h-11 text-lg underline underline-offset-4">
                close the book
              </button>
            </motion.div>
          )}
        </Page>
      ),
    },
  ];

  return <FlipBook pages={pages} />;
}

function FlipBook({ pages }: { pages: Array<{ label: string; node: ReactNode }> }) {
  const { reducedMotion } = useExperience();
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<{ index: number; dir: 1 | -1 } | null>(null);
  const total = pages.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (flip) return;
      const target = page + dir;
      if (target < 0 || target >= total) return;
      if (!reducedMotion) setFlip({ index: dir === 1 ? page : target, dir });
      setPage(target);
    },
    [flip, page, total, reducedMotion],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  const under = flip?.dir === -1 ? flip.index + 1 : page;

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-3 py-16"
      aria-roledescription="scrapbook"
    >
      <div className="relative aspect-[3/4] max-h-[78dvh] w-[min(92vw,30rem)]" style={{ perspective: 1800 }}>
        <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rounded-r-2xl bg-[#e6d8c3] shadow-[8px_10px_30px_rgb(0_0_0/0.35)]" />
        <div aria-hidden className="absolute inset-0 translate-x-1 translate-y-1 rounded-r-2xl bg-[#efe4d2]" />
        <div aria-hidden className="absolute inset-y-0 -left-3 w-3 rounded-l-md bg-[#b5523b] shadow" />
        <motion.div
          key={under}
          data-page
          className="absolute inset-0"
          drag={flip ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={onDragEnd}
          role="group"
          aria-label={`Page ${under + 1} of ${total}: ${pages[under].label}`}
        >
          {pages[under].node}
        </motion.div>
        <AnimatePresence>
          {flip && (
            <motion.div
              key={`flip-${flip.index}-${flip.dir}`}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
              initial={{ rotateY: flip.dir === 1 ? 0 : -180 }}
              animate={{ rotateY: flip.dir === 1 ? -180 : 0 }}
              transition={{ duration: 0.85, ease: EASE.inOut }}
              onAnimationComplete={() => setFlip(null)}
            >
              {pages[flip.index].node}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav aria-label="Scrapbook pages" className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={page === 0}
          aria-label="Previous page"
          className="inline-flex size-12 items-center justify-center rounded-full bg-[#fbf5ea] shadow-md transition-transform hover:-translate-x-0.5 disabled:opacity-40"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <span className="min-w-20 text-center text-xl" aria-live="polite">
          {page + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={page === total - 1}
          aria-label="Next page"
          className="inline-flex size-12 items-center justify-center rounded-full bg-[#fbf5ea] shadow-md transition-transform hover:translate-x-0.5 disabled:opacity-40"
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </nav>
      <p className="mt-3 text-base text-[#3a2f28]/70">Swipe, use the arrows or your keyboard to turn the page</p>
    </motion.main>
  );
}
