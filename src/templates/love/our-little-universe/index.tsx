import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Hand, X } from 'lucide-react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { useFocusTrap, useLockBodyScroll } from '@/hooks/useFocusTrap';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './orrery.css';

/**
 * Our Little Universe — a hand-made brass orrery on a desk. Each painted planet
 * rides its own arm around a brass sun engraved with two names.
 */
const round = 'font-t-display';
type WorldId = 'memories' | 'photos' | 'messages' | 'little' | 'dreams' | 'future';
const WORLDS: Array<{ id: WorldId; name: string; r: number; size: number; speed: number; look: string }> = [
  // Painted enamel over brass: oxblood, verdigris, ivory, slate, ochre, navy.
  { id: 'memories', name: 'Memories', r: 0.36, size: 40, speed: 0.32, look: 'radial-gradient(circle at 34% 30%, #d9a093, #8e3b2e 50%, #4a1d16)' },
  { id: 'photos', name: 'Photos', r: 0.47, size: 52, speed: 0.22, look: 'radial-gradient(circle at 34% 30%, #b9d1c4, #5f8f7d 50%, #2c4a3f)' },
  { id: 'messages', name: 'Messages', r: 0.58, size: 36, speed: 0.17, look: 'radial-gradient(circle at 34% 30%, #fbf5e6, #d8cdb2 50%, #8d8167)' },
  { id: 'little', name: 'Little things', r: 0.69, size: 30, speed: 0.13, look: 'radial-gradient(circle at 34% 30%, #b8bfc6, #6c7680 50%, #353c43)' },
  { id: 'dreams', name: 'Dreams', r: 0.8, size: 46, speed: 0.1, look: 'radial-gradient(circle at 34% 30%, #eed6a0, #bf8f3a 50%, #6b4b18)' },
  { id: 'future', name: 'Future plans', r: 0.91, size: 34, speed: 0.08, look: 'radial-gradient(circle at 34% 30%, #9fb0cc, #34496e 50%, #18233a)' },
];

export default function OurLittleUniverse() {
  const { opened } = useExperience();
  return (
    <div className="lu-desk relative min-h-dvh overflow-x-clip text-[#efe4cc]">
      <AnimatePresence>{!opened && <Arrival key="a" />}</AnimatePresence>
      {opened && <Universe />}
    </div>
  );
}

function Arrival() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, scale: 0.6, transition: { duration: 1.1 } }}>
      <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE.out }} className="lu-brass size-24 rounded-full" aria-hidden />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1.6 }} className={`${round} mt-10 max-w-xl text-3xl leading-snug sm:text-4xl`}>
        {config.messages.intro.trim() || 'I made us a little universe.'}
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className={`${round} lu-plate mt-10 h-13 px-9 text-lg tracking-[0.12em] text-[#2a2015]`}>
        Wind the orrery
      </motion.button>
    </motion.div>
  );
}

function Universe() {
  const { config, reducedMotion, restart } = useExperience();
  const { name, sender } = useBirthdayText();
  const stageRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const ringRefs = useRef<Array<SVGEllipseElement | null>>([]);
  const armRefs = useRef<Array<SVGLineElement | null>>([]);
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
          const arm = armRefs.current[i];
          if (arm) {
            arm.setAttribute('x1', String(cx));
            arm.setAttribute('y1', String(cy));
            arm.setAttribute('x2', String(cx + x * persp));
            arm.setAttribute('y2', String(cy + y * persp));
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
          Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </h1>
        <p className="mt-2 inline-flex items-center gap-2 text-[#efe4cc]/70 italic">
          <Hand className="size-4" aria-hidden /> Turn the orrery by hand · touch a planet to read it
        </p>
        <p className="mt-1 text-sm text-[#efe4cc]/50" aria-live="polite">
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
              }} fill="none" stroke="#b08d57" strokeOpacity={0.35} strokeWidth={i % 2 ? 1 : 1.5} />
          ))}
          {WORLDS.map((w, i) => (
            <line key={w.id} ref={(el) => {
                armRefs.current[i] = el;
              }} stroke="#c9a467" strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
          ))}
        </svg>
        <div className="lu-brass pointer-events-none absolute top-1/2 left-1/2 z-[1000] flex size-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center text-[#3a2a12] sm:size-32">
          <span className={`${round} max-w-[80%] truncate text-xs font-bold sm:text-sm`}>{name}</span>
          <span className="text-[0.6rem] sm:text-xs" aria-hidden>
            &amp;
          </span>
          <span className={`${round} max-w-[80%] truncate text-xs font-bold sm:text-sm`}>{sender}</span>
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
            <span className="absolute inset-0 rounded-full shadow-[inset_-5px_-7px_10px_rgb(0_0_0/0.4),0_0_0_2px_#b08d57] transition-transform duration-300 group-hover:scale-110" style={{ background: w.look }} />
            {i === 1 && <span aria-hidden className="absolute top-1/2 left-1/2 h-3 w-[170%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%] border-2 border-[#c9a467]" />}
            {visited.includes(w.id) && <span aria-hidden className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#c9a467]" />}
            <span className={`${round} pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 text-[0.7rem] tracking-[0.08em] whitespace-nowrap text-[#efe4cc]/80`}>{w.name}</span>
          </button>
        ))}
      </motion.div>

      <section aria-labelledby="lu-final" className="px-5 pt-6 pb-24 text-center">
        {!zoomOut ? (
          <button
            type="button"
            onClick={() => setZoomOut(true)}
            className={cn(`${round} h-13 px-9 text-lg tracking-[0.1em] transition-colors`, visited.length >= 3 ? 'lu-plate text-[#2a2015]' : 'border border-[#c9a467]/40 text-[#efe4cc]/80 hover:border-[#c9a467]')}
          >
            Step back and read the plaque
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 1.2 }} role="status" className="flex flex-col items-center">
            <div className="lu-plate max-w-xl px-8 py-7 text-[#2a2015] sm:px-12">
              <h2 id="lu-final" className={`${round} text-3xl tracking-[0.08em] sm:text-5xl`}>
                Our Little Universe
              </h2>
              <p className={`${round} mt-2 text-sm tracking-[0.25em] uppercase`}>
                Made for <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> by <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
              </p>
              <p className="mt-5 text-lg leading-relaxed italic">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
            </div>
            <button type="button" onClick={restart} className={`${round} mt-8 h-11 text-sm text-[#efe4cc]/60 underline underline-offset-4 hover:text-[#efe4cc]`}>
              Wind it again
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
            <li key={m.id} className="border-b border-[#2a2015]/15 pb-3">
              <p className="font-semibold">{m.titleText}</p>
              {(m.date || m.place) && <p className="text-xs tracking-widest text-[#2a2015]/55 uppercase">{[m.date, m.place].filter(Boolean).join(' · ')}</p>}
              <p className="mt-1 text-[#2a2015]/80">{m.captionText}</p>
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
              <PhotoSlot src={m.image} alt={m.titleText} label="Photo" tone="light" className="aspect-square w-full" />
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
            <li key={t.id} className="flex gap-4 border-b border-[#2a2015]/15 pb-3">
              <PhotoSlot src={t.image} alt={t.titleText} label="+" tone="light" className="size-20 shrink-0" />
              <div>
                <p className="font-semibold">{t.titleText}</p>
                <p className="text-[#2a2015]/75">{t.captionText}</p>
              </div>
            </li>
          ))}
        </ul>
      );
      break;
    case 'dreams':
      body = (
        <div>
          <PhotoSlot src={config.finalImage ?? config.heroImage} alt="The life we dream of" label="Add a final photo" tone="light" className="aspect-[4/3] w-full" />
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
      <div className="absolute inset-0 bg-[#0e0b08]/70" onClick={onClose} aria-hidden />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={w.name}
        initial={{ y: 40, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE.out }}
        className="lu-card relative max-h-[86dvh] w-full max-w-lg overflow-y-auto p-6 text-[#2a2015] sm:p-8"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="size-10 rounded-full shadow-[inset_-4px_-6px_10px_rgb(0_0_0/0.35),0_0_0_2px_#b08d57]" style={{ background: w.look }} aria-hidden />
          <h3 className={`${round} flex-1 text-2xl font-bold`}>{w.name}</h3>
          <button type="button" onClick={onClose} aria-label="Back to the orrery" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-[#2a2015]/10">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {body}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
