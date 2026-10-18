import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import type { ResolvedMemory } from '@/components/experience/content';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import { LOOKS, type Season } from './seasons';

interface RevealProps {
  items: ResolvedMemory[];
  onOpen: (index: number) => void;
  /** Reduced motion: everything starts revealed. */
  revealed: boolean;
}

/** A memory as a small print: photo, title, and the date and place in small caps. */
function Print({
  m,
  onOpen,
  className,
  children,
}: {
  m: ResolvedMemory;
  onOpen: (i: number) => void;
  className?: string;
  children?: ReactNode;
}) {
  const meta = [m.date, m.place].filter(Boolean).join(' · ');
  return (
    <figure
      className={cn(
        'relative bg-[#fffdf8] p-2.5 pb-3 shadow-[0_14px_30px_-14px_rgb(40_30_20/0.5)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(m.index)}
        aria-label={`Open memory: ${m.titleText}`}
        className="block w-full"
      >
        <PhotoSlot
          src={m.image}
          alt={m.titleText}
          label={m.slotLabel}
          tone="light"
          className="aspect-[4/5] w-full"
        />
      </button>
      <figcaption className="mt-2 px-1">
        <span className="block font-t-display text-lg leading-tight">{m.titleText}</span>
        {meta && (
          <span className="mt-0.5 block text-xs tracking-[0.18em] text-black/50 uppercase">{meta}</span>
        )}
      </figcaption>
      {children}
    </figure>
  );
}

function AllButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onClick}
        className="h-11 px-4 text-sm font-semibold tracking-wide underline underline-offset-4"
      >
        {children}
      </button>
    </div>
  );
}

/** Spring: each memory waits inside a bud. Tap it and the petals open around the photo. */
export function Buds({ items, onOpen, revealed }: RevealProps) {
  const [open, setOpen] = useState<string[]>(revealed ? items.map((m) => m.id) : []);
  const petals = LOOKS.spring.foliage;
  return (
    <>
      <ul className="flex flex-wrap justify-center gap-8">
        {items.map((m, i) => {
          const isOpen = open.includes(m.id);
          return (
            <li key={m.id} className="relative flex w-56 flex-col items-center">
              <div className="relative grid size-56 place-items-center">
                {Array.from({ length: 6 }, (_, k) => (
                  <motion.span
                    key={k}
                    aria-hidden
                    className="absolute top-1/2 left-1/2 h-24 w-16 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
                    style={{
                      background: petals[(k + i) % petals.length],
                      originX: '50%',
                      originY: '100%',
                      x: '-50%',
                      y: '-100%',
                    }}
                    initial={false}
                    animate={{ rotate: k * 60, scale: isOpen ? 1 : 0.3, opacity: isOpen ? 0.95 : 1 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 12, delay: isOpen ? k * 0.06 : 0 }}
                  />
                ))}
                {isOpen ? (
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.7, ease: EASE.out }}
                    className="relative size-36 overflow-hidden rounded-full border-4 border-[#fffdf8] shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(m.index)}
                      aria-label={`Open memory: ${m.titleText}`}
                      className="block size-full"
                    >
                      <PhotoSlot
                        src={m.image}
                        alt={m.titleText}
                        label="+"
                        tone="light"
                        className="size-full"
                      />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen((o) => [...o, m.id])}
                    aria-label={`Open the bud for ${m.titleText}`}
                    className="relative z-10 size-24 rounded-full text-sm font-semibold text-[#7a3b52]"
                  >
                    Tap to bloom
                  </button>
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-center font-t-display text-xl transition-opacity duration-700',
                  isOpen ? 'opacity-100' : 'opacity-0',
                )}
              >
                {m.titleText}
              </p>
            </li>
          );
        })}
      </ul>
      {open.length < items.length && (
        <AllButton onClick={() => setOpen(items.map((m) => m.id))}>Let every bud bloom</AllButton>
      )}
    </>
  );
}

/** Summer: catch the fireflies drifting over the dusk grass; each one lights a memory in the jar's glow. */
export function Fireflies({ items, onOpen, revealed }: RevealProps) {
  const total = Math.max(items.length, 3);
  const [caught, setCaught] = useState(revealed ? total : 0);
  const lit = Math.min(items.length, caught);
  return (
    <>
      <div className="relative mx-auto h-48 max-w-3xl overflow-hidden rounded-sm bg-linear-to-b from-[#26324a] to-[#3c4f3a] sm:h-56">
        {Array.from({ length: total }, (_, i) =>
          i < caught ? null : (
            <button
              key={i}
              type="button"
              onClick={() => setCaught((c) => c + 1)}
              aria-label="Catch a firefly"
              // Fireflies hover, then dart; one under the pointer or keyboard focus holds still.
              className="fs-firefly absolute grid size-11 place-items-center"
              style={{
                left: `${12 + ((i * 29) % 76)}%`,
                top: `${20 + ((i * 41) % 55)}%`,
                animationDelay: `${-i * 1.7}s`,
              }}
            >
              <span className="size-2.5 rounded-full bg-[#fff3b0] shadow-[0_0_14px_4px_#ffe066]" />
            </button>
          ),
        )}
        <div className="absolute right-6 bottom-3 flex flex-col items-center" aria-hidden>
          <div className="h-3 w-10 rounded-sm bg-[#8a6a48]" />
          <div
            className="h-16 w-14 rounded-b-2xl border-2 border-white/50 transition-[background-color,box-shadow] duration-700"
            style={{
              backgroundColor: `rgb(255 230 120 / ${0.08 + (caught / total) * 0.55})`,
              boxShadow: `0 0 ${caught * 12}px rgb(255 220 100 / ${(caught / total) * 0.7})`,
            }}
          />
        </div>
        <p role="status" className="absolute top-3 left-4 text-sm tracking-wide text-white/80">
          {caught >= total ? 'The jar is full of light.' : `${caught} of ${total} fireflies`}
        </p>
      </div>
      <ul className="mt-8 grid justify-center gap-6 [grid-template-columns:repeat(auto-fit,minmax(13rem,15rem))]">
        {items.map((m, i) => (
          <li
            key={m.id}
            className={cn(
              'transition-[filter,opacity] duration-1000',
              i < lit ? 'opacity-100' : 'opacity-60 brightness-[0.35] saturate-50',
            )}
          >
            <Print m={m} onOpen={onOpen} className={i % 2 ? 'rotate-1' : '-rotate-1'} />
          </li>
        ))}
      </ul>
      {caught < total && <AllButton onClick={() => setCaught(total)}>Light the jar</AllButton>}
    </>
  );
}

const LEAF_SPOTS = Array.from({ length: 16 }, (_, i) => ({
  x: 6 + ((i * 37) % 88),
  y: 4 + ((i * 53) % 84),
  rot: (i * 47) % 360,
  size: 46 + ((i * 17) % 30),
}));

/** Autumn: photos lie in the grass under fallen leaves. Brush across them (or tap) to clear them. */
export function LeafCover({ items, onOpen, revealed }: RevealProps) {
  const [cleared, setCleared] = useState<string[]>(revealed ? items.map((m) => m.id) : []);
  return (
    <>
      <ul className="grid justify-center gap-8 [grid-template-columns:repeat(auto-fit,minmax(13rem,15rem))]">
        {items.map((m, i) => (
          <li key={m.id}>
            <Print m={m} onOpen={onOpen} className={i % 2 ? 'rotate-2' : '-rotate-2'}>
              {!cleared.includes(m.id) && (
                <LeafPile seed={i} onCleared={() => setCleared((c) => [...c, m.id])} />
              )}
            </Print>
          </li>
        ))}
      </ul>
      {cleared.length < items.length && (
        <AllButton onClick={() => setCleared(items.map((m) => m.id))}>Rake all the leaves</AllButton>
      )}
    </>
  );
}

function LeafPile({ seed, onCleared }: { seed: number; onCleared: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [blown, setBlown] = useState<Record<number, { x: number; y: number; r: number }>>({});
  const colors = LOOKS.autumn.foliage;
  const count = Object.keys(blown).length;

  useEffect(() => {
    if (count >= LEAF_SPOTS.length * 0.7) {
      const t = window.setTimeout(onCleared, 700);
      return () => window.clearTimeout(t);
    }
  }, [count, onCleared]);

  const brush = (e: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * 100;
    const py = ((e.clientY - box.top) / box.height) * 100;
    const next = { ...blown };
    LEAF_SPOTS.forEach((l, i) => {
      if (next[i] || Math.hypot(l.x - px, l.y - py) > 24) return;
      const dx = l.x - px || 1;
      next[i] = {
        x: Math.sign(dx) * (60 + Math.random() * 80),
        y: -40 - Math.random() * 60,
        r: (Math.random() - 0.5) * 360,
      };
    });
    if (Object.keys(next).length !== count) setBlown(next);
  };

  return (
    <div
      ref={ref}
      onPointerMove={brush}
      onPointerDown={brush}
      className="absolute inset-0 touch-pan-y overflow-hidden"
      role="button"
      tabIndex={0}
      aria-label="Brush the leaves away"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onCleared())}
    >
      {LEAF_SPOTS.map((l, i) => {
        const b = blown[i];
        return (
          <motion.svg
            key={i}
            viewBox="0 0 20 30"
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${l.x}%`, top: `${l.y}%`, width: l.size, rotate: l.rot }}
            animate={b ? { x: b.x, y: b.y, rotate: l.rot + b.r, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE.out }}
          >
            <path d="M10 0 Q 19 12 10 30 Q 1 12 10 0 Z" fill={colors[(i + seed) % colors.length]} />
            <path d="M10 3 L10 27" stroke="#6b3a1f" strokeWidth="0.8" opacity="0.5" />
          </motion.svg>
        );
      })}
    </div>
  );
}

/** Winter: the window has frosted over. Wipe a clear patch with a finger or the cursor to see through. */
export function FrostPane({
  children,
  revealed,
  label,
}: {
  children: ReactNode;
  revealed: boolean;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clear, setClear] = useState(revealed);
  const strokes = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);

  const paintFrost = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = 'rgba(236, 242, 248, 0.94)';
    ctx.fillRect(0, 0, width, height);
    // Fern-like ice crystals growing in from the edges.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      let x = Math.random() < 0.5 ? 0 : width;
      let y = Math.random() * height;
      let a = x === 0 ? Math.random() - 0.5 : Math.PI + Math.random() - 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 14; s++) {
        x += Math.cos(a) * 14;
        y += Math.sin(a) * 14;
        a += (Math.random() - 0.5) * 0.6;
        ctx.lineTo(x, y);
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a + 1) * 7, y + Math.sin(a + 1) * 7);
        ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
  }, []);

  useEffect(() => {
    if (!clear) paintFrost();
  }, [clear, paintFrost]);

  const wipe = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const box = canvas.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineWidth = 64;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? x, last.current?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    last.current = { x, y };
    // Every so often, check how much of the glass is clear; past ~45% the rest melts away.
    if (++strokes.current % 12 === 0) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clearPx = 0;
      let sampled = 0;
      for (let i = 3; i < data.length; i += 4 * 40) {
        sampled++;
        if (data[i] < 40) clearPx++;
      }
      if (clearPx / sampled > 0.45) setClear(true);
    }
  };

  return (
    <div>
      <div className="relative">
        {children}
        <AnimatePresence>
          {!clear && (
            <motion.canvas
              key="frost"
              ref={canvasRef}
              // The last of the frost melts away rather than vanishing.
              exit={{ opacity: 0, transition: { duration: 1.2 } }}
              onPointerMove={wipe}
              onPointerDown={wipe}
              onPointerLeave={() => (last.current = null)}
              onPointerUp={() => (last.current = null)}
              aria-label={label}
              role="img"
              className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-sm"
            />
          )}
        </AnimatePresence>
        {!clear && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-t-display text-xl text-[#5f7184] italic">
            Wipe the frost from the glass
          </p>
        )}
      </div>
      {!clear && <AllButton onClick={() => setClear(true)}>Clear the window</AllButton>}
    </div>
  );
}

/** Which reveal belongs to which season. */
export const REVEALS: Record<Exclude<Season, 'winter'>, (p: RevealProps) => ReactNode> = {
  spring: Buds,
  summer: Fireflies,
  autumn: LeafCover,
};

/** Winter photos sit behind the frosted pane together with the season's message. */
export function WinterPrints({ items, onOpen }: Omit<RevealProps, 'revealed'>) {
  return (
    <ul className="grid justify-center gap-6 [grid-template-columns:repeat(auto-fit,minmax(12rem,14rem))]">
      {items.map((m, i) => (
        <li key={m.id}>
          <Print m={m} onOpen={onOpen} className={i % 2 ? 'rotate-1' : '-rotate-1'} />
        </li>
      ))}
    </ul>
  );
}
