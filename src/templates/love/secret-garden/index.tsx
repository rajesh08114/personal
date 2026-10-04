import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { KeyRound, Lock } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './garden.css';

const sc = 'font-t-display';
type Gate = 'memories' | 'photographs' | 'letter' | 'secret';
const GATES: Array<{ id: Gate; name: string; hint: string }> = [
  { id: 'memories', name: 'The Path of Memories', hint: 'Flowers that remember' },
  { id: 'photographs', name: 'The Old Photographs', hint: 'Hung in the ivy' },
  { id: 'letter', name: 'The Love Letter', hint: 'By candlelight' },
  { id: 'secret', name: 'The Secret Gate', hint: 'Needs three keys' },
];
const KEYS_NEEDED = 3;

export default function SecretGarden() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#06120c] text-[#efe6d2]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgb(201_163_91/0.22),transparent_55%),linear-gradient(180deg,#040b07,#0d2416_70%,#081a10)]" />
        <div className="sg-fog sg-fog-a" />
        <div className="sg-fog sg-fog-b" />
        <Particles variant="fireflies" density={4} colors={['#ffe9a8', '#f6d27a']} followPointer />
      </div>
      <AnimatePresence>{!opened && <Entrance key="e" />}</AnimatePresence>
      {opened && <Garden />}
    </div>
  );
}

function Entrance() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, scale: 1.2, transition: { duration: 1.4 } }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className={`${sc} text-sm tracking-[0.5em] text-[var(--bd-primary)]`}>
        Somewhere behind the ivy
      </motion.p>
      <motion.h1 initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: 0.8, duration: 2 }} className={`${sc} mt-6 max-w-2xl text-4xl leading-tight sm:text-6xl`}>
        {config.messages.intro.trim() || 'There’s a garden I’ve been keeping for you.'}
      </motion.h1>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} className="group relative mt-14 h-40 w-28" aria-label="Push open the garden gate">
        <span className="absolute inset-0 overflow-hidden rounded-t-full border-2 border-[#4a6b4b] bg-[#030805]">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgb(255_210_130/0.5),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="absolute inset-y-0 left-0 w-1/2 origin-left bg-[repeating-linear-gradient(90deg,#26381f_0_6px,#1b2a17_6px_12px)] transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(-60deg)]" />
          <span className="absolute inset-y-0 right-0 w-1/2 origin-right bg-[repeating-linear-gradient(90deg,#26381f_0_6px,#1b2a17_6px_12px)] transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(60deg)]" />
        </span>
      </motion.button>
      <p className="mt-4 text-sm text-[#efe6d2]/60 italic">Push the gate</p>
    </motion.div>
  );
}

function Firefly({ i, onCatch }: { i: number; onCatch: (x: number, y: number) => void }) {
  const path = { left: [`${10 + i * 25}%`, `${30 + i * 15}%`, `${15 + i * 22}%`, `${40 + i * 10}%`, `${10 + i * 25}%`], top: [`${20 + i * 18}%`, `${40}%`, `${70 - i * 10}%`, `${30 + i * 5}%`, `${20 + i * 18}%`] };
  return (
    <motion.button
      type="button"
      onClick={(e) => onCatch(e.clientX, e.clientY)}
      aria-label="Catch this firefly — it’s carrying a key"
      className="absolute z-20 flex size-12 items-center justify-center"
      animate={path}
      transition={{ duration: 16 + i * 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="size-3 animate-twinkle rounded-full bg-[#fff1b8] shadow-[0_0_18px_6px_rgb(255_233_168/0.8)]" />
    </motion.button>
  );
}

function Garden() {
  const { config, fx } = useExperience();
  const [gate, setGate] = useState<Gate | null>(null);
  const [visited, setVisited] = useState<Gate[]>([]);
  const [keys, setKeys] = useState(0);
  const [clearing, setClearing] = useState(false);
  const notes = getMemories(config).map((m) => m.captionText);

  const choose = (g: Gate) => {
    if (g === 'secret' && keys < KEYS_NEEDED) {
      setGate('secret');
      return;
    }
    setGate(g);
    setVisited((v) => (v.includes(g) ? v : [...v, g]));
  };

  if (clearing) return <Clearing />;

  return (
    <main className="relative z-10">
      <section aria-labelledby="sg-title" className="relative px-4 pt-20 pb-10 text-center">
        <h1 id="sg-title" className={`${sc} text-4xl sm:text-6xl`}>
          Happy Birthday, <span className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[#efe6d2]/65 italic">Four gates. Follow the fireflies — some of them are carrying keys.</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--bd-primary)]/40 px-4 py-1.5 text-sm" aria-live="polite">
          <KeyRound className="size-4 text-[var(--bd-primary)]" aria-hidden /> {keys}/{KEYS_NEEDED} keys found
        </p>
      </section>

      <div className="relative">
        {keys < KEYS_NEEDED &&
          Array.from({ length: KEYS_NEEDED - keys }, (_, k) => (
            <Firefly
              key={`${keys}-${k}`}
              i={k}
              onCatch={(x, y) => {
                setKeys((n) => n + 1);
                fx.burst({ x, y, shape: 'star', colors: ['#fff1b8', '#c9a35b'], count: 14, speed: 200, size: 10 });
              }}
            />
          ))}
        <ul className="relative mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {GATES.map((g) => {
            const locked = g.id === 'secret' && keys < KEYS_NEEDED;
            const active = gate === g.id;
            return (
              <li key={g.id}>
                <button type="button" onClick={() => choose(g.id)} aria-pressed={active} aria-label={`${g.name}${locked ? ' (locked)' : ''}`} className="group flex w-full flex-col items-center gap-3">
                  <span className={cn('relative block aspect-[3/5] w-full max-w-[9rem] overflow-hidden rounded-t-full border-2 bg-[#030805] transition-colors', active ? 'border-[var(--bd-primary)]' : 'border-[#4a6b4b]')}>
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgb(255_210_130/0.55),transparent_65%)]" />
                    <motion.span className="absolute inset-y-0 left-0 w-1/2 origin-left bg-[repeating-linear-gradient(90deg,#2a3d22_0_6px,#1c2b17_6px_12px)]" animate={{ rotateY: active && !locked ? -75 : 0 }} transition={{ duration: 0.9 }} style={{ transformPerspective: 400 }} />
                    <motion.span className="absolute inset-y-0 right-0 w-1/2 origin-right bg-[repeating-linear-gradient(90deg,#2a3d22_0_6px,#1c2b17_6px_12px)]" animate={{ rotateY: active && !locked ? 75 : 0 }} transition={{ duration: 0.9 }} style={{ transformPerspective: 400 }} />
                    {locked && <Lock className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-[var(--bd-primary)]" aria-hidden />}
                    {visited.includes(g.id) && <span className="absolute bottom-2 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[var(--bd-primary)]" aria-hidden />}
                  </span>
                  <span className={`${sc} text-center text-lg leading-tight`}>{g.name}</span>
                  <span className="-mt-2 text-xs text-[#efe6d2]/50 italic">{g.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <section aria-live="polite" className="mx-auto max-w-5xl px-4 py-14">
        <AnimatePresence mode="wait">
          {gate && (
            <motion.div key={gate + keys} initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.9, ease: EASE.out }}>
              {gate === 'memories' && <MemoryHedge />}
              {gate === 'photographs' && <Photographs />}
              {gate === 'letter' && <LoveLetter />}
              {gate === 'secret' && (keys < KEYS_NEEDED ? <LockedGate keys={keys} notes={notes} /> : <Secret />)}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="px-4 pb-28 text-center">
        <button
          type="button"
          onClick={() => {
            setClearing(true);
            window.scrollTo({ top: 0 });
          }}
          className={cn(`${sc} h-13 rounded-full border px-9 text-lg tracking-[0.2em] transition-colors`, visited.length >= 3 ? 'border-[var(--bd-primary)] bg-[var(--bd-primary)] text-[#06120c]' : 'border-[#efe6d2]/30 text-[#efe6d2]/70 hover:border-[#efe6d2]')}
        >
          {visited.length >= 3 ? 'Follow the light to the clearing' : 'Skip ahead to the clearing'}
        </button>
      </div>
    </main>
  );
}

function MemoryHedge() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [found, setFound] = useState<string[]>([]);
  return (
    <div>
      <h2 className={`${sc} text-center text-3xl`}>The Path of Memories</h2>
      <p className="mt-2 text-center text-[#efe6d2]/60 italic">Touch a flower to see what it remembers.</p>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {memories.map((m, i) => {
          const isFound = found.includes(m.id);
          return (
            <li key={m.id} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#4a6b4b] bg-[repeating-radial-gradient(circle_at_30%_30%,#183a22_0_6px,#12301c_6px_12px)]">
              <AnimatePresence>
                {isFound ? (
                  <motion.div key="m" initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(75% at 50% 50%)' }} transition={{ duration: 1.1, ease: EASE.out }} className="absolute inset-0">
                    <PhotoSlot src={m.image} alt={m.titleText} label={m.slotLabel} className="h-full w-full" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10">
                      <p className={`${sc} text-lg`}>{m.titleText}</p>
                      <p className="text-sm text-[#efe6d2]/75">{m.captionText}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button key="f" type="button" exit={{ scale: 1.6, opacity: 0 }} onClick={() => setFound((f) => [...f, m.id])} aria-label={`Touch flower ${i + 1}`} className="absolute inset-0 flex items-center justify-center">
                    <span className="relative size-16 transition-transform duration-500 hover:scale-110">
                      {Array.from({ length: 6 }, (_, k) => (
                        <span key={k} className="absolute top-1/2 left-1/2 h-8 w-5 rounded-full bg-[#8e1f35] shadow-[0_0_12px_rgb(142_31_53/0.6)]" style={{ transform: `translate(-50%,-100%) rotate(${k * 60}deg)`, transformOrigin: '50% 100%' }} />
                      ))}
                      <span className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bd-primary)] shadow-[0_0_14px_var(--bd-primary)]" />
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Photographs() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <div>
      <h2 className={`${sc} text-center text-3xl`}>The Old Photographs</h2>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2">
        {items.map((t, i) => (
          <motion.li key={t.id} initial={{ opacity: 0, rotate: i % 2 ? 4 : -4, y: 20 }} animate={{ opacity: 1, rotate: i % 2 ? 1.5 : -1.5, y: 0 }} transition={{ delay: i * 0.15 }} className="relative border-[10px] border-[#3a2a1a] bg-[#3a2a1a] shadow-[0_20px_40px_-15px_black]">
            <span aria-hidden className="absolute -top-4 -left-4 h-10 w-20 rounded-full bg-[#2c4a2a] blur-[1px]" />
            <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" className="aspect-[4/3] w-full" imgClassName="sepia-[0.55] contrast-[1.05]" />
            <div className="bg-[#efe6d2] p-3 text-[#2a1d12]">
              <p className="text-xs tracking-[0.3em] uppercase opacity-70">{t.date ?? 'Undated'}</p>
              <p className={`${sc} text-xl`}>{t.titleText}</p>
              <p className="text-sm italic">{t.captionText}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function LoveLetter() {
  const { config } = useExperience();
  return (
    <div className="relative mx-auto max-w-2xl">
      <span aria-hidden className="absolute -top-10 left-1/2 h-20 w-3 -translate-x-1/2 rounded-sm bg-[#efe6d2]">
        <span className="flame absolute -top-6 left-1/2 block h-7 w-4 -translate-x-1/2 rounded-[50%_50%_45%_45%] bg-gradient-to-t from-[#ff8a3d] to-[#fff3c4] shadow-[0_0_30px_10px_rgb(255_190_100/0.45)]" />
      </span>
      <article className="paper-grain mt-16 bg-[#efe1c3] p-8 text-[#2a1d12] shadow-[0_0_80px_rgb(255_190_100/0.25)] sm:p-12">
        <h2 className={`${sc} text-3xl`}>By candlelight</h2>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-5 space-y-4 text-lg leading-relaxed italic sm:text-xl" />
        <p className={`${sc} mt-6 text-right text-xl`}>
          — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </p>
      </article>
    </div>
  );
}

function LockedGate({ keys, notes }: { keys: number; notes: string[] }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <Lock className="mx-auto size-10 text-[var(--bd-primary)]" aria-hidden />
      <h2 className={`${sc} mt-4 text-3xl`}>The Secret Gate is locked</h2>
      <p className="mt-2 text-[#efe6d2]/65 italic">
        Catch {KEYS_NEEDED - keys} more firefl{KEYS_NEEDED - keys === 1 ? 'y' : 'ies'} — each one carries a key and a little note.
      </p>
      {keys > 0 && (
        <ul className="mt-6 space-y-2">
          {notes.slice(0, keys).map((n, i) => (
            <li key={i} className="rounded-xl border border-[var(--bd-primary)]/30 bg-[#0d2416]/70 px-4 py-2 text-sm italic">
              “{n}”
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Secret() {
  const { config } = useExperience();
  return (
    <div className="mx-auto max-w-xl text-center">
      <KeyRound className="mx-auto size-10 text-[var(--bd-primary)]" aria-hidden />
      <h2 className={`${sc} mt-4 text-3xl`}>The Secret</h2>
      <p className="mt-6 text-2xl leading-relaxed italic">
        <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
      </p>
    </div>
  );
}

function Clearing() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#fff1b8']);
  const [you, setYou] = useState(false);
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgb(255_226_160/0.45),transparent_60%)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }} />
      <motion.div aria-hidden className="sg-rays pointer-events-none absolute -top-1/4 left-1/2 h-[120vh] w-[120vw] -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 3 }} />
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 2 }} onAnimationComplete={() => window.setTimeout(() => setYou(true), 1400)} className={`${sc} relative text-4xl leading-tight sm:text-6xl`}>
        You found the most important thing.
      </motion.h2>
      <AnimatePresence>
        {you && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: EASE.out }}
            onAnimationComplete={() => fx.rain({ colors, shapes: ['circle'], count: 80, size: 5, duration: 5 })}
            className="relative mt-12 flex flex-col items-center"
            role="status"
          >
            <div className="relative aspect-[3/4] w-[min(64vw,18rem)] overflow-hidden rounded-[50%] border-4 border-[var(--bd-primary)] shadow-[0_0_80px_rgb(255_226_160/0.55)]">
              <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" className="h-full w-full" />
            </div>
            <p className={`${sc} mt-8 text-7xl text-[var(--bd-primary)] sm:text-8xl`}>You.</p>
            <p className="mt-6 max-w-md text-lg italic text-[#efe6d2]/80">
              Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />. {config.messages.final}
            </p>
            <button type="button" onClick={restart} className={`${sc} mt-10 h-11 tracking-[0.3em] text-[#efe6d2]/50 hover:text-[#efe6d2]`}>
              Return to the gate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
