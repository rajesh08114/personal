import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const sc = 'font-t-display';
type ObjectId = 'wine' | 'menu' | 'candle' | 'photo' | 'gift';
const OBJECTS: Array<{ id: ObjectId; label: string }> = [
  { id: 'wine', label: 'The wine glass' },
  { id: 'menu', label: 'The menu' },
  { id: 'candle', label: 'The candle' },
  { id: 'photo', label: 'The photograph' },
  { id: 'gift', label: 'The gift' },
];

function Candle({ lit, delay = 0, height = 80, bright = false }: { lit: boolean; delay?: number; height?: number; bright?: boolean }) {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <div className="relative h-10 w-6">
        <motion.span
          className="absolute bottom-0 left-1/2 block h-9 w-5 origin-bottom -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: lit ? 1 : 0, scale: lit ? (bright ? 1.25 : 1) : 0.2 }}
          transition={{ delay, duration: 0.6 }}
        >
          <span className="flame block h-full w-full rounded-[50%_50%_45%_45%] bg-gradient-to-t from-[#ff7a2a] via-[#ffc35c] to-[#fff7d6]" style={{ animationDelay: `${delay}s` }} />
        </motion.span>
        <motion.span
          className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgb(255_190_100/0.55),transparent_65%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: lit ? (bright ? 1 : 0.7) : 0 }}
          transition={{ delay, duration: 1 }}
        />
      </div>
      <span className="block w-4 rounded-sm bg-gradient-to-b from-[#fbf3e4] to-[#d9ccb4]" style={{ height }} />
      <span className="block h-3 w-12 rounded-full bg-[#b08a4a]" />
    </div>
  );
}

export default function CandlelightDinner() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#0d0306] text-[#f3e6d2]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgb(255_179_92/0.16),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgb(74_14_24/0.8),transparent_70%)]" />
      <AnimatePresence>{!opened && <Lighting key="l" />}</AnimatePresence>
      {opened && <Dinner />}
    </div>
  );
}

function Lighting() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0306] px-6 text-center" exit={{ opacity: 0, transition: { duration: 1.2 } }}>
      <div className="flex items-end gap-8">
        <Candle lit delay={0.6} height={70} />
        <Candle lit delay={1.5} height={100} />
        <Candle lit delay={2.4} height={70} />
      </div>
      <motion.div className="mt-2 h-4 w-[min(80vw,30rem)] rounded-[50%] bg-[#4a0e18]" initial={{ opacity: 0, scaleX: 0.4 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 3, duration: 1.4 }} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.6, duration: 1.6 }} className={`${sc} mt-10 text-4xl sm:text-5xl`}>
        {config.messages.intro.trim() || 'Your seat is waiting.'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.6 }} className={`${sc} mt-10 h-13 border border-[var(--bd-primary)]/60 px-9 tracking-[0.3em] text-[var(--bd-primary)] transition-colors hover:bg-[var(--bd-primary)] hover:text-[#0d0306]`}>
        Take your seat
      </motion.button>
    </motion.div>
  );
}

function TableObject({ id, label, onOpen, done, className, children }: { id: ObjectId; label: string; onOpen: (id: ObjectId) => void; done: boolean; className: string; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(id)}
      aria-label={`${label}${done ? ' (opened)' : ''}`}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn('group absolute flex flex-col items-center', className)}
    >
      <span className="relative drop-shadow-[0_12px_14px_rgb(0_0_0/0.6)] transition-[filter] duration-300 group-hover:drop-shadow-[0_0_24px_rgb(255_179_92/0.6)]">{children}</span>
      <span className={cn('mt-2 rounded-full px-3 py-1 text-xs tracking-widest uppercase transition-colors', done ? 'bg-[var(--bd-primary)] text-[#0d0306]' : 'bg-black/40 text-[#f3e6d2]/80 group-hover:text-[#f3e6d2]')}>{label.replace('The ', '')}</span>
    </motion.button>
  );
}

function Dinner() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const [open, setOpen] = useState<ObjectId | null>(null);
  const [done, setDone] = useState<ObjectId[]>([]);
  const [finale, setFinale] = useState(false);

  const openObj = (id: ObjectId) => {
    setOpen(id);
    setDone((d) => (d.includes(id) ? d : [...d, id]));
  };

  return (
    <main className="relative z-10">
      <section aria-labelledby="cd-title" className="px-5 pt-16 text-center">
        <p className={`${sc} text-sm tracking-[0.4em] text-[var(--bd-primary)]`}>A table for two</p>
        <h1 id="cd-title" className={`${sc} mt-3 text-4xl sm:text-6xl`}>
          Tonight, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </h1>
        <p className="mt-3 text-xl italic text-[#f3e6d2]/70">Everything on this table is for you. Touch anything.</p>
        <p className="mt-2 text-sm text-[#f3e6d2]/50" aria-live="polite">
          {done.length} of {OBJECTS.length} discovered
        </p>
      </section>

      <div className="relative mx-auto mt-6 aspect-[4/5] w-full max-w-4xl sm:aspect-[16/10]">
        <div aria-hidden className="absolute inset-x-[2%] top-[18%] bottom-[2%] rounded-[50%/40%] bg-[radial-gradient(ellipse_at_50%_30%,#7a1a2c,#4a0e18_55%,#2a060d)] shadow-[0_40px_80px_-20px_black,inset_0_0_80px_rgb(0_0_0/0.5)]" />
        <div aria-hidden className="absolute top-[34%] left-1/2 aspect-square w-[28%] -translate-x-1/2 rounded-full bg-[#f6efe2] shadow-[inset_0_0_0_10px_#e9dfcc,0_10px_20px_rgb(0_0_0/0.4)]">
          <div className="absolute inset-[22%] overflow-hidden rounded-full">
            <PhotoSlot src={config.heroImage} alt={`${name}, guest of honour`} label="Hero photo" tone="light" className="h-full w-full" />
          </div>
        </div>
        <div className="absolute top-[2%] left-1/2 flex -translate-x-1/2 items-end gap-3 sm:gap-5">
          <Candle lit height={50} bright={finale} />
          <Candle lit height={74} bright={finale} />
          <Candle lit height={50} bright={finale} />
        </div>

        <TableObject id="wine" label="The wine glass" onOpen={openObj} done={done.includes('wine')} className="top-[30%] left-[8%] sm:left-[14%]">
          <svg viewBox="0 0 40 80" className="h-24 w-12 sm:h-28" aria-hidden>
            <path d="M8 4 H32 C32 26, 28 36, 20 38 C12 36, 8 26, 8 4 Z" fill="rgb(255 255 255 / 0.12)" stroke="#f3e6d2" strokeOpacity=".5" />
            <path d="M9 16 H31 C30 28, 26 35, 20 36 C14 35, 10 28, 9 16 Z" fill="#8e0f2a" />
            <rect x="19" y="38" width="2" height="30" fill="#f3e6d2" opacity=".6" />
            <ellipse cx="20" cy="70" rx="12" ry="3" fill="#f3e6d2" opacity=".5" />
          </svg>
        </TableObject>

        <TableObject id="menu" label="The menu" onOpen={openObj} done={done.includes('menu')} className="bottom-[10%] left-[6%] sm:left-[16%]">
          <span className="block h-28 w-20 rotate-[-8deg] rounded-sm border border-[#b08a4a] bg-[#f6efe2] p-2 text-center text-[#4a0e18] sm:h-32 sm:w-24">
            <span className={`${sc} block text-[0.6rem] tracking-widest`}>MENU</span>
            <span className="mx-auto mt-2 block h-px w-8 bg-[#b08a4a]" />
            {[0, 1, 2].map((k) => (
              <span key={k} className="mx-auto mt-2 block h-1 w-10 rounded bg-[#4a0e18]/20" />
            ))}
          </span>
        </TableObject>

        <TableObject id="candle" label="The candle" onOpen={openObj} done={done.includes('candle')} className="bottom-[2%] left-[42%] sm:right-[30%] sm:bottom-[10%] sm:left-auto">
          <span className="block scale-75">
            <Candle lit height={40} />
          </span>
        </TableObject>

        <TableObject id="photo" label="The photograph" onOpen={openObj} done={done.includes('photo')} className="top-[30%] right-[6%] sm:right-[14%]">
          <span className="block w-20 rotate-6 border-[6px] border-[#b08a4a] bg-[#b08a4a] sm:w-24">
            <PhotoSlot src={getTimeline(config)[0]?.image ?? config.finalImage} alt="A special memory" label="+" className="aspect-[4/5] w-full" imgClassName="sepia-[0.3]" />
          </span>
        </TableObject>

        <TableObject id="gift" label="The gift" onOpen={openObj} done={done.includes('gift')} className="right-[6%] bottom-[8%] sm:right-[12%]">
          <span className="relative block size-20 sm:size-24">
            <span className="absolute inset-x-0 bottom-0 h-[78%] rounded-md bg-gradient-to-br from-[#f3e6d2] to-[#cdbb9b]" />
            <span className="absolute bottom-0 left-1/2 h-[78%] w-3 -translate-x-1/2 bg-[#8e0f2a]" />
            <span className="absolute inset-x-[-6%] top-[14%] h-[18%] rounded-md bg-[#e9dcc4]" />
            <span className="absolute top-0 left-1/2 h-4 w-10 -translate-x-1/2 rounded-full border-4 border-[#8e0f2a]" />
          </span>
        </TableObject>
      </div>

      <section aria-labelledby="cd-final" className="px-5 pt-10 pb-28 text-center">
        {!finale ? (
          <button type="button" onClick={() => setFinale(true)} className={cn(`${sc} h-13 px-9 tracking-[0.3em] transition-colors`, done.length >= 4 ? 'bg-[var(--bd-primary)] text-[#0d0306]' : 'border border-[#f3e6d2]/30 text-[#f3e6d2]/70 hover:border-[#f3e6d2]')}>
            Raise a toast
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.6 }} role="status">
            <h2 id="cd-final" className={`${sc} text-4xl sm:text-6xl`}>
              Tonight is about you.
            </h2>
            <p className="mt-4 text-3xl italic text-[var(--bd-primary)]">
              Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
            </p>
            <p className="mt-4 text-xl italic text-[#f3e6d2]/70">{config.messages.final}</p>
          </motion.div>
        )}
      </section>
      <AnimatePresence>{open && <ObjectView key={open} id={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </main>
  );
}

function ObjectView({ id, onClose }: { id: ObjectId; onClose: () => void }) {
  const { config, fx, restart } = useExperience();
  const { name, sender } = useBirthdayText();
  const colors = useThemeColors(['#ffffff', '#8e0f2a']);
  const ref = useRef<HTMLDivElement>(null);
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const paras = splitParagraphs(config.messages.main);
  const [toast, setToast] = useState(0);
  const [unwrapped, setUnwrapped] = useState(false);
  useFocusTrap(ref, true, onClose);
  useLockBodyScroll(true);
  const label = OBJECTS.find((o) => o.id === id)?.label ?? '';

  let body: ReactNode = null;
  if (id === 'wine') {
    const m = memories[toast % memories.length];
    body = (
      <div>
        <p className={`${sc} text-sm tracking-[0.3em] text-[var(--bd-primary)]`}>A toast to…</p>
        <AnimatePresence mode="wait">
          <motion.div key={m.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45 }}>
            <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="mt-4 aspect-[4/3] w-full rounded-xl" />
            <h3 className={`${sc} mt-4 text-2xl`}>{m.titleText}</h3>
            {(m.date || m.place) && <p className="text-xs tracking-widest text-[#f3e6d2]/50 uppercase">{[m.date, m.place].filter(Boolean).join(' · ')}</p>}
            <p className="mt-2 text-xl italic">{m.captionText}</p>
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => setToast((t) => t + 1)} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--bd-primary)]/50 px-5 text-sm tracking-widest uppercase">
          Another toast <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    );
  } else if (id === 'menu') {
    const courses = ['Amuse-bouche', 'Main course', 'Dessert'];
    body = (
      <div className="rounded-sm bg-[#f6efe2] p-7 text-center text-[#4a0e18]">
        <p className={`${sc} text-2xl tracking-[0.2em]`}>Menu</p>
        <p className="text-sm italic">in honour of {name}</p>
        <span className="mx-auto mt-3 block h-px w-16 bg-[#b08a4a]" />
        {(paras.length ? paras : [PLACEHOLDER.message]).slice(0, 3).map((p, i) => (
          <div key={i} className="mt-5">
            <p className={`${sc} text-xs tracking-[0.3em] text-[#b08a4a]`}>{courses[i]}</p>
            <p className="mt-1 text-lg leading-relaxed italic">{p}</p>
          </div>
        ))}
        <p className="mt-6 text-sm">— prepared by {sender}</p>
      </div>
    );
  } else if (id === 'candle') {
    body = (
      <div className="text-center">
        <div className="mx-auto w-fit">
          <Candle lit height={60} bright />
        </div>
        <p className="mt-6 text-2xl leading-relaxed italic">{paras[paras.length - 1] ?? config.messages.final}</p>
        <p className={`${sc} mt-4 text-sm tracking-[0.3em] text-[var(--bd-primary)]`}>A love note</p>
      </div>
    );
  } else if (id === 'photo') {
    const t = timeline[0];
    body = (
      <div>
        <div className="border-[10px] border-[#b08a4a] bg-[#b08a4a]">
          <PhotoSlot src={t?.image ?? config.finalImage} alt={t?.titleText ?? 'A special memory'} label="Add a photo" className="aspect-[4/5] w-full" imgClassName="sepia-[0.2]" />
        </div>
        <h3 className={`${sc} mt-4 text-2xl`}>{t?.titleText}</h3>
        {(t?.date || t?.place) && <p className="text-xs tracking-widest text-[#f3e6d2]/50 uppercase">{[t?.date, t?.place].filter(Boolean).join(' · ')}</p>}
        <p className="mt-2 text-xl italic">{t?.captionText}</p>
      </div>
    );
  } else {
    body = (
      <div className="text-center">
        {!unwrapped ? (
          <motion.button
            type="button"
            onClick={(e) => {
              setUnwrapped(true);
              fx.burst({ x: e.clientX, y: e.clientY, shape: 'heart', colors, count: 30, speed: 360, size: 14 });
              fx.cannons({ colors, count: 140 });
            }}
            whileHover={{ rotate: [0, -4, 4, 0] }}
            className="mx-auto block"
            aria-label="Untie the ribbon"
          >
            <span className="relative mx-auto block size-40">
              <span className="absolute inset-x-0 bottom-0 h-[78%] rounded-lg bg-gradient-to-br from-[#f3e6d2] to-[#cdbb9b]" />
              <span className="absolute bottom-0 left-1/2 h-[78%] w-6 -translate-x-1/2 bg-[#8e0f2a]" />
              <span className="absolute inset-x-[-6%] top-[14%] h-[18%] rounded-lg bg-[#e9dcc4]" />
              <span className="absolute top-0 left-1/2 h-8 w-20 -translate-x-1/2 rounded-full border-[7px] border-[#8e0f2a]" />
            </span>
            <span className="mt-4 block text-sm tracking-[0.3em] uppercase">Untie the ribbon</span>
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
            <p className="text-2xl leading-relaxed italic">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <button type="button" onClick={restart} className="mt-8 h-11 text-xs tracking-[0.3em] text-[#f3e6d2]/50 uppercase hover:text-[#f3e6d2]">
              Light the candles again
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  return createPortal(
    <motion.div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#0d0306]/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ y: 30, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE.out }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--bd-primary)]/25 bg-[#1a070c]/95 p-6 shadow-[0_0_80px_rgb(255_179_92/0.15)]"
      >
        <button type="button" onClick={onClose} aria-label="Back to the table" className="absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="size-4" aria-hidden />
        </button>
        {body}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
