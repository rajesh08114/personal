import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Hand, X } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const round = 'font-t-display';
type WorldId = 'memories' | 'photos' | 'messages' | 'little' | 'dreams' | 'future';
const WORLDS: Array<{ id: WorldId; name: string; r: number; size: number; speed: number; look: string }> = [
  { id: 'memories', name: 'Memories', r: 0.36, size: 44, speed: 0.32, look: 'radial-gradient(circle at 32% 30%, #fff1f7, #ff8fc4 45%, #9d2a6b)' },
  { id: 'photos', name: 'Photos', r: 0.47, size: 56, speed: 0.22, look: 'radial-gradient(circle at 32% 30%, #e0f2fe, #38bdf8 45%, #1e3a8a)' },
  { id: 'messages', name: 'Messages', r: 0.58, size: 40, speed: 0.17, look: 'radial-gradient(circle at 32% 30%, #fef9c3, #fbbf24 45%, #b45309)' },
  { id: 'little', name: 'Little things', r: 0.69, size: 34, speed: 0.13, look: 'radial-gradient(circle at 32% 30%, #dcfce7, #4ade80 45%, #166534)' },
  { id: 'dreams', name: 'Dreams', r: 0.8, size: 50, speed: 0.1, look: 'radial-gradient(circle at 32% 30%, #f3e8ff, #c084fc 45%, #6b21a8)' },
  { id: 'future', name: 'Future plans', r: 0.91, size: 38, speed: 0.08, look: 'radial-gradient(circle at 32% 30%, #ffedd5, #fb923c 45%, #9a3412)' },
];

export default function OurLittleUniverse() {
  const { opened, theme } = useExperience();
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#07041a] text-[#f5ecff]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgb(var(--bd-secondary-rgb)/0.9),transparent_70%)]">
        <Particles variant="stars" density={10} colors={['#ffffff', theme.primary, theme.accent]} />
      </div>
      <AnimatePresence>{!opened && <Arrival key="a" />}</AnimatePresence>
      {opened && <Universe />}
    </div>
  );
}

function Arrival() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, scale: 0.6, transition: { duration: 1.1 } }}>
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE.out }} className="size-24 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,var(--bd-primary)_45%,#7c3aed)] shadow-[0_0_80px_20px_rgb(255_156_208/0.35)]" aria-hidden />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1.6 }} className={`${round} mt-10 max-w-xl text-3xl leading-snug sm:text-4xl`}>
        {config.messages.intro.trim() || 'I made us a little universe.'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className={`${round} mt-10 h-13 rounded-full bg-[var(--bd-primary)] px-9 font-bold text-[#07041a] shadow-[0_0_40px_rgb(255_156_208/0.5)]`}>
        Float inside
      </motion.button>
    </motion.div>
  );
}

function Universe() {
  const { config, reducedMotion, fx, restart } = useExperience();
  const { name, sender } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const stageRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const ringRefs = useRef<Array<SVGEllipseElement | null>>([]);
  const view = useRef({ angle: 0, tilt: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : 0.42, dragging: false, lastX: 0, lastY: 0, vel: 0 });
  const [world, setWorld] = useState<WorldId | null>(null);
  const [visited, setVisited] = useState<WorldId[]>([]);
  const [zoomOut, setZoomOut] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = view.current;
      if (!v.dragging) {
        v.angle += (reducedMotion ? 0 : 0.12) * dt + v.vel;
        v.vel *= 0.94;
      }
      const stage = stageRef.current;
      if (stage) {
        const R = Math.min(stage.clientWidth * 0.46, stage.clientHeight * 0.9);
        const cx = stage.clientWidth / 2;
        const cy = stage.clientHeight / 2;
        const k = Math.max(0.55, Math.min(1, R / 420));
        WORLDS.forEach((w, i) => {
          const a = (reducedMotion ? 0 : now / 1000) * w.speed + i * 1.05 + v.angle;
          const r = w.r * R;
          const x = Math.cos(a) * r;
          const depth = Math.sin(a) * r;
          const y = depth * Math.sin(v.tilt);
          const z = depth * Math.cos(v.tilt);
          const persp = 900 / (900 - z);
          const scale = persp * k;
          const el = planetRefs.current[i];
          if (el) {
            el.style.transform = `translate(${cx + x * persp - w.size / 2}px, ${cy + y * persp - w.size / 2}px) scale(${scale})`;
            el.style.zIndex = String(Math.round(1000 + z));
            el.style.filter = `brightness(${0.75 + (scale / k - 0.8) * 0.9})`;
          }
          const ring = ringRefs.current[i];
          if (ring) {
            ring.setAttribute('rx', String(r));
            ring.setAttribute('ry', String(Math.max(1, r * Math.sin(v.tilt))));
            ring.setAttribute('cx', String(cx));
            ring.setAttribute('cy', String(cy));
          }
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    view.current.dragging = true;
    view.current.lastX = e.clientX;
    view.current.lastY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    const v = view.current;
    if (!v.dragging) return;
    const dx = e.clientX - v.lastX;
    const dy = e.clientY - v.lastY;
    v.lastX = e.clientX;
    v.lastY = e.clientY;
    v.angle += dx * 0.008;
    v.vel = dx * 0.0015;
    v.tilt = Math.min(1.2, Math.max(0.12, v.tilt + dy * 0.004));
  };
  const onUp = () => {
    view.current.dragging = false;
  };

  const explore = (id: WorldId) => {
    setWorld(id);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
  };

  return (
    <main className="relative z-10">
      <section aria-labelledby="lu-title" className="px-5 pt-14 text-center">
        <h1 id="lu-title" className={`${round} text-3xl font-bold sm:text-5xl`}>
          Happy Birthday, <span className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
        </h1>
        <p className="mt-2 inline-flex items-center gap-2 text-[#f5ecff]/65">
          <Hand className="size-4" aria-hidden /> Drag to spin our universe · tap a planet to land
        </p>
        <p className="mt-1 text-sm text-[#f5ecff]/45" aria-live="polite">
          {visited.length} of {WORLDS.length} worlds explored
        </p>
      </section>

      <motion.div
        ref={stageRef}
        className="relative mx-auto h-[68dvh] min-h-[26rem] w-full max-w-5xl cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        animate={{ scale: zoomOut ? 0.42 : 1, opacity: zoomOut ? 0.85 : 1 }}
        transition={{ duration: 2.4, ease: EASE.inOut }}
        role="group"
        aria-label="Our little universe"
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {WORLDS.map((w, i) => (
            <ellipse key={w.id} ref={(el) => {
                ringRefs.current[i] = el;
              }} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeDasharray={i % 2 ? '3 6' : undefined} />
          ))}
        </svg>
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1000] flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,var(--bd-primary)_40%,#7c3aed_80%)] text-center text-[#2a1650] shadow-[0_0_100px_30px_rgb(255_156_208/0.35)] sm:size-40">
          <span className={`${round} max-w-[85%] truncate text-xs font-bold sm:text-base`}>{name}</span>
          <span className="text-lg" aria-hidden>
            ♥
          </span>
          <span className={`${round} max-w-[85%] truncate text-xs font-bold sm:text-base`}>{sender}</span>
        </div>
        {WORLDS.map((w, i) => (
          <button
            key={w.id}
            ref={(el) => {
              planetRefs.current[i] = el;
            }}
            type="button"
            onClick={() => explore(w.id)}
            aria-label={`Land on ${w.name}`}
            className="group absolute top-0 left-0 rounded-full will-change-transform before:absolute before:-inset-6 before:rounded-full before:content-['']"
            style={{ width: w.size, height: w.size }}
          >
            <span className="absolute inset-0 rounded-full shadow-[inset_-6px_-8px_14px_rgb(0_0_0/0.35)] transition-transform duration-300 group-hover:scale-110" style={{ background: w.look }} />
            {i === 1 && <span aria-hidden className="absolute top-1/2 left-1/2 h-3 w-[170%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%] border-2 border-[#bae6fd]/70" />}
            {visited.includes(w.id) && <span aria-hidden className="absolute -top-1 -right-1 size-2.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
            <span className={`${round} pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 text-[0.65rem] font-bold whitespace-nowrap text-white/75`}>{w.name}</span>
          </button>
        ))}
      </motion.div>

      <section aria-labelledby="lu-final" className="px-5 pt-6 pb-24 text-center">
        {!zoomOut ? (
          <button
            type="button"
            onClick={() => {
              setZoomOut(true);
              window.setTimeout(() => fx.rain({ colors, shapes: ['star', 'circle'], count: 120, size: 9, duration: 4 }), 2200);
            }}
            className={cn(`${round} h-13 rounded-full px-9 font-bold transition-colors`, visited.length >= 3 ? 'bg-white text-[#07041a]' : 'border border-white/25 text-white/75 hover:border-white')}
          >
            Zoom out
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 1.4 }} role="status">
            <p className={`${round} text-sm tracking-[0.5em] text-[var(--bd-accent)]`}>
              <Fill value={config.birthdayPerson.toUpperCase()} placeholder={PLACEHOLDER.name} /> & <Fill value={config.senderName.toUpperCase()} placeholder={PLACEHOLDER.sender} />
            </p>
            <h2 id="lu-final" className={`${round} mt-4 text-4xl font-bold sm:text-6xl`}>
              Our Little Universe
            </h2>
            <p className="mt-4 text-2xl">
              Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> ♥
            </p>
            <button type="button" onClick={restart} className={`${round} mt-8 h-11 text-sm text-white/50 hover:text-white`}>
              Float back in
            </button>
          </motion.div>
        )}
      </section>
      <AnimatePresence>{world && <WorldPanel key={world} id={world} onClose={() => setWorld(null)} />}</AnimatePresence>
    </main>
  );
}

function WorldPanel({ id, onClose }: { id: WorldId; onClose: () => void }) {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useLockBodyScroll(true);
  const w = WORLDS.find((x) => x.id === id)!;
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const paras = splitParagraphs(config.messages.main);

  let body: ReactNode;
  switch (id) {
    case 'memories':
      body = (
        <ul className="space-y-4">
          {memories.map((m) => (
            <li key={m.id} className="rounded-2xl bg-white/5 p-4">
              <p className="font-semibold">{m.titleText}</p>
              {(m.date || m.place) && <p className="text-xs tracking-widest text-white/50 uppercase">{[m.date, m.place].filter(Boolean).join(' · ')}</p>}
              <p className="mt-1 text-white/75">{m.captionText}</p>
            </li>
          ))}
        </ul>
      );
      break;
    case 'photos':
      body = (
        <ul className="grid grid-cols-2 gap-3">
          {[{ id: 'hero', image: config.heroImage, titleText: name }, ...memories].map((m) => (
            <li key={m.id}>
              <PhotoSlot src={m.image} alt={m.titleText} label="Photo" className="aspect-square w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      );
      break;
    case 'messages':
      body = <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="space-y-4 text-xl leading-relaxed" />;
      break;
    case 'little':
      body = (
        <ul className="space-y-4">
          {timeline.map((t) => (
            <li key={t.id} className="flex gap-4 rounded-2xl bg-white/5 p-3">
              <PhotoSlot src={t.image} alt={t.titleText} label="+" className="size-20 shrink-0 rounded-xl" />
              <div>
                <p className="font-semibold">{t.titleText}</p>
                <p className="text-white/70">{t.captionText}</p>
              </div>
            </li>
          ))}
        </ul>
      );
      break;
    case 'dreams':
      body = (
        <div>
          <PhotoSlot src={config.finalImage ?? config.heroImage} alt="The life we dream of" label="Add a final photo" className="aspect-[4/3] w-full rounded-2xl" />
          <p className="mt-4 text-xl leading-relaxed italic">{paras[paras.length - 1] ?? config.messages.final}</p>
        </div>
      );
      break;
    default:
      body = (
        <p className="text-2xl leading-relaxed">
          <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
        </p>
      );
  }

  return createPortal(
    <motion.div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#07041a]/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={w.name}
        initial={{ scale: 0.2, opacity: 0, borderRadius: '50%' }}
        animate={{ scale: 1, opacity: 1, borderRadius: '2rem' }}
        exit={{ scale: 0.3, opacity: 0, borderRadius: '50%' }}
        transition={{ duration: 0.6, ease: EASE.out }}
        className="relative max-h-[86dvh] w-full max-w-lg overflow-y-auto border border-white/15 bg-[#120a2c]/95 p-6 text-[#f5ecff] shadow-[0_0_100px_rgb(255_156_208/0.25)]"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="size-10 rounded-full shadow-[inset_-4px_-6px_10px_rgb(0_0_0/0.35)]" style={{ background: w.look }} aria-hidden />
          <h3 className={`${round} flex-1 text-2xl font-bold`}>{w.name}</h3>
          <button type="button" onClick={onClose} aria-label="Back to our universe" className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {body}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
