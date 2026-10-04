import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Gift, Heart } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './gift.css';

const script = 'font-t-display';

/** A real CSS 3D cube with a liftable lid. */
function GiftCube({ size = 180, color = 'var(--bd-primary)', ribbon = 'var(--bd-accent)', open = false, spinning = true }: { size?: number; color?: string; ribbon?: string; open?: boolean; spinning?: boolean }) {
  const half = size / 2;
  const face = (transform: string, extra = '') => (
    <span className={cn('gb-face absolute inset-0', extra)} style={{ transform, background: color }}>
      <span className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2" style={{ background: ribbon }} />
    </span>
  );
  return (
    <div className="relative" style={{ width: size, height: size, perspective: size * 5 }} aria-hidden>
      <div className={cn('gb-cube relative h-full w-full', spinning && 'is-spinning')} style={{ transformStyle: 'preserve-3d' }}>
        {face(`translateZ(${half}px)`)}
        {face(`rotateY(180deg) translateZ(${half}px)`)}
        {face(`rotateY(90deg) translateZ(${half}px)`)}
        {face(`rotateY(-90deg) translateZ(${half}px)`)}
        <span className="gb-face absolute inset-0" style={{ transform: `rotateX(-90deg) translateZ(${half}px)`, background: color, filter: 'brightness(0.7)' }} />
        <motion.span className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transformOrigin: `50% 0 ${-half}px` }} animate={open ? { rotateX: 110, y: -size * 0.4, opacity: 0 } : { rotateX: 0 }} transition={{ duration: 1, ease: EASE.out }}>
          <span className="gb-face absolute inset-0" style={{ transform: `rotateX(90deg) translateZ(${half}px)`, background: color, filter: 'brightness(1.12)' }}>
            <span className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2" style={{ background: ribbon }} />
            <span className="absolute inset-x-0 top-1/2 h-[16%] -translate-y-1/2" style={{ background: ribbon }} />
          </span>
        </motion.span>
      </div>
    </div>
  );
}

export default function GiftBoxTemplate() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[radial-gradient(ellipse_at_50%_0%,#fff8f1,#f3dfd5_60%,#ead0c6)] text-[#5a2433]">
      <AnimatePresence>{!opened && <BigBox key="b" />}</AnimatePresence>
      {opened && <Gifts />}
    </div>
  );
}

function BigBox() {
  const { config, open, fx } = useExperience();
  const colors = useThemeColors(['#ffffff']);
  const [lifted, setLifted] = useState(false);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_0%,#fff8f1,#f3dfd5_70%)] px-6 text-center" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }} className={`${script} text-6xl text-[var(--bd-secondary)] sm:text-7xl`}>
        {config.messages.intro.trim() || 'I got you something…'}
      </motion.p>
      <button
        type="button"
        aria-label="Open the gift"
        disabled={lifted}
        onClick={() => {
          setLifted(true);
          fx.confetti({ x: 0.5, y: 0.55, colors, count: 90, spread: 80 });
          window.setTimeout(open, 1300);
        }}
        className="mt-14 transition-transform hover:scale-105"
      >
        <GiftCube open={lifted} spinning={!lifted} size={170} />
      </button>
      <p className="mt-12 font-semibold tracking-[0.25em] text-[var(--bd-secondary)]/70 uppercase">Tap to open</p>
    </motion.div>
  );
}

const WRAPS = [
  'repeating-linear-gradient(45deg, #e7b6c1 0 12px, #f3cfd8 12px 24px)',
  'radial-gradient(circle, #fff 2px, transparent 2.5px) 0 0 / 14px 14px, #d9c2ef',
  'repeating-linear-gradient(90deg, #f3d38a 0 10px, #f8e3b1 10px 20px)',
  'radial-gradient(circle at 30% 30%, #f6b5a0 3px, transparent 3.5px) 0 0 / 18px 18px, #c9e4de',
];

function Wrapped({ wrap, ribbon = '#9a3a52', label, onOpen, children, mode }: { wrap: string; ribbon?: string; label: string; onOpen: () => void; children: ReactNode; mode: 'tear' | 'hinge' | 'drawer' | 'unfold' }) {
  const [opened, setOpened] = useState(false);
  const open = () => {
    if (opened) return;
    setOpened(true);
    onOpen();
  };
  const paper = { background: wrap };
  return (
    <div className="relative">
      <div className={cn('relative overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-20px_rgb(90_36_51/0.45)]', opened ? '' : 'min-h-64')}>
        <motion.div initial={false} animate={{ opacity: opened ? 1 : 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="p-4" aria-hidden={!opened}>
          {children}
        </motion.div>
        <AnimatePresence>
          {!opened && (
            <motion.button type="button" key="cover" onClick={open} aria-label={`Open ${label}`} className="absolute inset-0 overflow-hidden" exit={{ opacity: 0, transition: { delay: 0.8 } }}>
              {mode === 'tear' && (
                <>
                  <motion.span className="absolute inset-y-0 left-0 w-1/2" style={{ ...paper, clipPath: 'polygon(0 0,100% 0,92% 12%,100% 25%,90% 40%,100% 55%,92% 70%,100% 85%,94% 100%,0 100%)' }} exit={{ x: '-110%', rotate: -10 }} transition={{ duration: 0.8 }} />
                  <motion.span className="absolute inset-y-0 right-0 w-1/2" style={{ ...paper, clipPath: 'polygon(8% 0,100% 0,100% 100%,6% 100%,0 85%,8% 70%,0 55%,10% 40%,0 25%,8% 12%)' }} exit={{ x: '110%', rotate: 10 }} transition={{ duration: 0.8 }} />
                </>
              )}
              {mode === 'hinge' && <motion.span className="absolute inset-0 origin-top" style={{ ...paper, transformPerspective: 800 }} exit={{ rotateX: -100, opacity: 0.4 }} transition={{ duration: 0.9 }} />}
              {mode === 'drawer' && <motion.span className="absolute inset-0" style={paper} exit={{ x: '105%' }} transition={{ duration: 0.8, ease: EASE.inOut }} />}
              {mode === 'unfold' && (
                <>
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <motion.span
                      key={side}
                      className="absolute"
                      style={{
                        ...paper,
                        inset: side === 'top' ? '0 0 50% 0' : side === 'bottom' ? '50% 0 0 0' : side === 'left' ? '0 50% 0 0' : '0 0 0 50%',
                        transformOrigin: side === 'top' ? 'top' : side === 'bottom' ? 'bottom' : side,
                        transformPerspective: 600,
                      }}
                      exit={side === 'top' || side === 'bottom' ? { rotateX: side === 'top' ? 100 : -100, opacity: 0 } : { rotateY: side === 'left' ? -100 : 100, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  ))}
                </>
              )}
              <span className="pointer-events-none absolute inset-y-0 left-1/2 w-4 -translate-x-1/2" style={{ background: ribbon }} />
              <span className="pointer-events-none absolute inset-x-0 top-1/2 h-4 -translate-y-1/2" style={{ background: ribbon }} />
              <span className="pointer-events-none absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow">
                <Gift className="size-4" aria-hidden /> {label}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Gifts() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff', '#e7b6c1']);
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const [count, setCount] = useState(0);
  const [big, setBig] = useState(false);
  const bump = () => setCount((c) => c + 1);
  const t = timeline[0];

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 py-16">
      <header className="text-center">
        <p className={`${script} text-6xl text-[var(--bd-primary)] sm:text-7xl`}>
          Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </p>
        <p className="mt-3 font-semibold">There were more gifts inside. Open them one by one.</p>
        <p className="mt-1 text-sm opacity-70" aria-live="polite">
          {count} of 4 opened
        </p>
      </header>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <section aria-label="Gift one: a photo">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] uppercase opacity-60">Gift 01</p>
          <Wrapped wrap={WRAPS[0]} label="Gift 01" mode="tear" onOpen={bump}>
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" className="aspect-[4/5] w-full rounded-xl" />
            <p className={`${script} mt-3 text-center text-4xl`}>my favourite view</p>
          </Wrapped>
        </section>
        <section aria-label="Gift two: a memory">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] uppercase opacity-60">Gift 02</p>
          <Wrapped wrap={WRAPS[1]} label="Gift 02" mode="hinge" onOpen={bump}>
            <PhotoSlot src={t?.image} alt={t?.titleText ?? 'A memory'} label="Add a photo" tone="light" className="aspect-[4/3] w-full rounded-xl" />
            <h3 className="mt-3 text-xl font-bold">{t?.titleText}</h3>
            {(t?.date || t?.place) && <p className="text-xs font-semibold tracking-widest uppercase opacity-60">{[t?.date, t?.place].filter(Boolean).join(' · ')}</p>}
            <p className="mt-1">{t?.captionText}</p>
          </Wrapped>
        </section>
        <section aria-label="Gift three: a love letter">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] uppercase opacity-60">Gift 03</p>
          <Wrapped wrap={WRAPS[2]} label="Gift 03" mode="drawer" onOpen={bump}>
            <div className="rounded-xl bg-[#fffaf3] p-5">
              <p className={`${script} text-4xl text-[var(--bd-primary)]`}>a love letter</p>
              <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-2 space-y-3 leading-relaxed" />
              <p className={`${script} mt-3 text-right text-3xl`}>{config.senderName.trim() || PLACEHOLDER.sender}</p>
            </div>
          </Wrapped>
        </section>
        <section aria-label="Gift four: our photos">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] uppercase opacity-60">Gift 04</p>
          <Wrapped wrap={WRAPS[3]} label="Gift 04" mode="unfold" onOpen={bump}>
            <ul className="grid grid-cols-3 gap-2">
              {memories.slice(0, 6).map((m) => (
                <li key={m.id}>
                  <PhotoSlot src={m.image} alt={m.titleText} label="+" tone="light" className="aspect-square w-full rounded-lg" />
                </li>
              ))}
            </ul>
            <p className={`${script} mt-3 text-center text-4xl`}>all of our favourite days</p>
          </Wrapped>
        </section>
      </div>

      <section aria-labelledby="gb-final" className="mt-20 flex flex-col items-center text-center">
        <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-60">Gift 05 · the biggest one</p>
        {!big ? (
          <button
            type="button"
            onClick={() => {
              setBig(true);
              fx.cannons({ colors, count: 260 });
              window.setTimeout(() => fx.rain({ colors, shapes: ['heart', 'circle'], count: 120, size: 12 }), 700);
            }}
            aria-label="Open the biggest gift"
            className="mt-8 transition-transform hover:scale-105"
          >
            <GiftCube size={220} spinning={false} />
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.6, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 12 }} className="relative mt-8 w-full max-w-2xl rounded-[2.5rem] bg-white p-10 shadow-[0_0_100px_rgb(243_211_138/0.7)]" role="status">
            <span aria-hidden className="gb-glow absolute -inset-6 -z-10 rounded-[3rem]" />
            <Heart className="mx-auto size-10 fill-[var(--bd-primary)] text-[var(--bd-primary)]" aria-hidden />
            <h2 id="gb-final" className="mt-4 text-2xl leading-relaxed font-semibold sm:text-3xl">
              The best thing in my life is having you in it.
            </h2>
            <p className="mt-4 text-lg">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <p className={`${script} mt-6 text-6xl text-[var(--bd-primary)]`}>Happy Birthday</p>
            <button type="button" onClick={restart} className="mt-6 h-11 text-sm font-bold tracking-[0.25em] uppercase opacity-60 hover:opacity-100">
              Wrap it all up again
            </button>
          </motion.div>
        )}
      </section>
    </main>
  );
}
