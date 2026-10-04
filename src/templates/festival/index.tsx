import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Send, Ticket } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './festival.css';

const fun = 'font-t-display';
const BULBS = ['#ff5d8f', '#ffd23f', '#3ef4ff', '#7dff9c', '#c084fc'];
const NOTE_COLORS = ['#ffd23f', '#ff9ebb', '#9be7ff', '#b9f6ca', '#e0c3fc'];
const ZONES = [
  { id: 'fs-stage', label: 'Main Stage' },
  { id: 'fs-booth', label: 'Memory Booth' },
  { id: 'fs-wall', label: 'Message Wall' },
  { id: 'fs-wish', label: 'Wish Zone' },
  { id: 'fs-finale', label: 'Finale' },
];

export default function Festival() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#1a0b2e] text-[#fff4e6]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_100%,#5b2a86_0%,transparent_60%),radial-gradient(ellipse_at_10%_0%,#3b1660,transparent_50%)]" />
      <AnimatePresence>{!opened && <TicketGate key="t" />}</AnimatePresence>
      {opened && (
        <>
          <StringLights />
          <ZoneNav />
          <main className="relative z-10">
            <MainStage />
            <MemoryBooth />
            <MessageWall />
            <WishZone />
            <Finale />
          </main>
        </>
      )}
    </div>
  );
}

function StringLights() {
  const [colors, setColors] = useState(() => Array.from({ length: 16 }, (_, i) => i % BULBS.length));
  return (
    <div className="relative z-20 h-20 overflow-hidden" aria-label="String lights — tap a bulb to change its colour" role="group">
      <svg viewBox="0 0 320 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M0 4 Q80 34 160 10 T320 6" stroke="#4b3a5e" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {colors.map((c, i) => {
        const x = (i + 0.5) / colors.length;
        const y = 10 + (x < 0.5 ? Math.sin(x * 2 * Math.PI) * 30 : Math.sin((x - 0.5) * 2 * Math.PI) * 10) + 20;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Light bulb ${i + 1}`}
            onClick={() => setColors((cs) => cs.map((v, k) => (k === i ? (v + 1) % BULBS.length : v)))}
            className="fs-bulb absolute flex size-8 -translate-x-1/2 items-start justify-center"
            style={{ left: `${x * 100}%`, top: `${Math.max(2, y * 0.75)}%`, animationDelay: `${i * 0.17}s` }}
          >
            <span className="block h-4 w-3 rounded-b-full" style={{ background: BULBS[c], boxShadow: `0 0 14px 3px ${BULBS[c]}` }} />
          </button>
        );
      })}
    </div>
  );
}

function ZoneNav() {
  return (
    <nav aria-label="Festival zones" className="sticky top-2 z-40 mx-auto w-fit max-w-[calc(100vw-1rem)]">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#1a0b2e]/80 p-1">
        {ZONES.map((z) => (
          <li key={z.id}>
            <a href={`#${z.id}`} className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              {z.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TicketGate() {
  const { config, open } = useExperience();
  const [torn, setTorn] = useState(false);
  const tear = () => {
    setTorn(true);
    window.setTimeout(open, 900);
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a0b2e] px-4 text-center" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <p className="text-sm tracking-[0.4em] text-white/60 uppercase">{config.messages.intro.trim() || 'You’re on the list'}</p>
      <button type="button" onClick={tear} disabled={torn} aria-label="Tear the ticket to enter the festival" className="mt-10 flex w-[min(92vw,30rem)] text-left text-[#1a0b2e]">
        <motion.span animate={torn ? { x: -40, rotate: -8, opacity: 0 } : {}} transition={{ duration: 0.8, ease: EASE.out }} className="flex flex-1 flex-col justify-between rounded-l-2xl bg-[var(--bd-accent)] p-5">
          <span className="text-xs font-bold tracking-[0.3em]">ADMIT ONE · VIP</span>
          <span className={`${fun} mt-3 text-3xl leading-tight`}>
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />’s Birthday Festival
          </span>
          <span className="mt-3 text-xs font-bold">ALL DAY · ALL NIGHT · ALL LOVE</span>
        </motion.span>
        <motion.span animate={torn ? { x: 40, rotate: 10, opacity: 0 } : {}} transition={{ duration: 0.8, ease: EASE.out }} className="flex w-24 flex-col items-center justify-center gap-2 rounded-r-2xl border-l-4 border-dashed border-[#1a0b2e]/40 bg-[var(--bd-primary)] text-white">
          <Ticket className="size-8" aria-hidden />
          <span className="text-xs font-bold tracking-widest [writing-mode:vertical-rl]">TEAR HERE</span>
        </motion.span>
      </button>
      <p className="mt-8 text-white/60">Tap the ticket to enter</p>
    </motion.div>
  );
}

function MainStage() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  return (
    <section id="fs-stage" aria-label="Main stage" className="relative flex min-h-[92dvh] scroll-mt-16 flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <motion.div aria-hidden className="fs-curtain absolute inset-y-0 left-0 z-20 w-1/2" initial={{ x: 0 }} animate={{ x: '-92%' }} transition={{ duration: 1.8, ease: EASE.inOut, delay: 0.3 }} />
      <motion.div aria-hidden className="fs-curtain absolute inset-y-0 right-0 z-20 w-1/2" initial={{ x: 0 }} animate={{ x: '92%' }} transition={{ duration: 1.8, ease: EASE.inOut, delay: 0.3 }} />
      <div aria-hidden className="absolute top-0 left-1/2 h-full w-[70vw] max-w-3xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.22),transparent_65%)] [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
      <div className="fs-marquee relative z-10 rounded-2xl px-6 py-5 sm:px-10">
        <p className="text-xs font-bold tracking-[0.4em] text-[var(--bd-accent)]">NOW PLAYING · HEADLINER</p>
        <h1 className={`${fun} mt-2 text-4xl leading-tight sm:text-6xl`}>
          Happy Birthday, <span className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
        </h1>
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 1 }} className="relative z-10 mt-10 w-[min(78vw,22rem)] overflow-hidden rounded-3xl border-4 border-white/80 shadow-[0_0_60px_rgb(255_255_255/0.25)]">
        <PhotoSlot src={config.heroImage} alt={`On stage: ${name}`} label="Add your hero photo" priority className="aspect-[4/5] w-full" />
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2d1452] to-transparent" />
    </section>
  );
}

function MemoryBooth() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const strips: number[][] = [];
  for (let i = 0; i < memories.length; i += 3) strips.push(memories.slice(i, i + 3).map((m) => m.index));
  return (
    <section id="fs-booth" aria-labelledby="fs-booth-title" className="relative scroll-mt-16 px-4 py-20">
      <h2 id="fs-booth-title" className={`${fun} text-center text-4xl sm:text-6xl`}>
        The memory booth
      </h2>
      <p className="mt-2 text-center text-white/70">Some moments worth remembering, three snaps at a time.</p>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={() => setFlash((f) => f + 1)} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-[#1a0b2e] transition-transform active:scale-95">
          <Camera className="size-5" aria-hidden /> Say cheese!
        </button>
      </div>
      <ul className="mt-12 flex flex-wrap justify-center gap-8">
        {strips.map((strip, s) => (
          <motion.li key={s} initial={{ y: 60, opacity: 0, rotate: 0 }} whileInView={{ y: 0, opacity: 1, rotate: s % 2 ? 3 : -3 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 90, damping: 12, delay: s * 0.1 }} className="w-44 bg-white p-2.5 pb-10 shadow-2xl sm:w-52">
            {strip.map((idx) => {
              const m = memories[idx];
              return (
                <button key={m.id} type="button" onClick={() => setIndex(idx)} className="mb-2.5 block w-full" aria-label={`Open memory: ${m.titleText}`}>
                  <PhotoSlot src={m.image} alt={m.titleText} label="Snap" tone="light" className="aspect-[4/3] w-full" />
                </button>
              );
            })}
            <p className={`${fun} -mb-6 text-center text-lg text-[#1a0b2e]`}>{memories[strip[0]].titleText}</p>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>{flash > 0 && <motion.div key={flash} aria-hidden className="pointer-events-none fixed inset-0 z-[90] bg-white" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} />}</AnimatePresence>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={fun} />
    </section>
  );
}

function MessageWall() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const timeline = getTimeline(config);
  const notes = [...timeline.map((t) => ({ id: t.id, title: t.titleText, text: t.captionText })), ...memories.slice(0, 4).map((m) => ({ id: m.id, title: m.titleText, text: m.captionText }))];
  return (
    <section id="fs-wall" aria-labelledby="fs-wall-title" className="relative scroll-mt-16 px-4 py-20">
      <h2 id="fs-wall-title" className={`${fun} text-center text-4xl sm:text-6xl`}>
        The message wall
      </h2>
      <div className="mx-auto mt-12 max-w-6xl rounded-[2rem] bg-[#2b1a1a] bg-[radial-gradient(rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:6px_6px] p-5 shadow-inner sm:p-10">
        <motion.article initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mx-auto max-w-2xl -rotate-1 bg-[#fff4e6] p-8 text-[#1a0b2e] shadow-2xl sm:p-10">
          <p className="text-xs font-bold tracking-[0.4em] text-[var(--bd-primary)]">A MESSAGE JUST FOR YOU</p>
          <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mt-4 space-y-4 text-lg leading-relaxed" />
          <p className={`${fun} mt-6 text-right text-2xl text-[var(--bd-primary)]`}>
            <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </motion.article>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {notes.map((n, i) => (
            <motion.li key={n.id} initial={{ opacity: 0, y: 20, rotate: 0 }} whileInView={{ opacity: 1, y: 0, rotate: (i % 3) - 1.5 }} whileHover={{ rotate: 0, scale: 1.05 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.08 }} className="relative p-4 text-[#1a0b2e] shadow-lg" style={{ background: NOTE_COLORS[i % NOTE_COLORS.length] }}>
              <span aria-hidden className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-[var(--bd-primary)] shadow" />
              <p className="font-bold">{n.title}</p>
              <p className="mt-1 text-sm">{n.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WishZone() {
  const [lanterns, setLanterns] = useState<Array<{ id: number; text: string; x: number }>>([]);
  const [text, setText] = useState('');
  const release = (e: FormEvent) => {
    e.preventDefault();
    const wish = text.trim() || 'Happy birthday!';
    setLanterns((l) => [...l.slice(-12), { id: Date.now(), text: wish, x: 10 + Math.random() * 80 }]);
    setText('');
  };
  return (
    <section id="fs-wish" aria-labelledby="fs-wish-title" className="relative min-h-[80dvh] scroll-mt-16 overflow-hidden px-4 py-20 text-center">
      <h2 id="fs-wish-title" className={`${fun} text-4xl sm:text-6xl`}>
        The wish zone
      </h2>
      <p className="mt-2 text-white/70">Write a wish and release it into the sky.</p>
      <form onSubmit={release} className="mx-auto mt-8 flex max-w-md gap-2">
        <label htmlFor="fs-wish-input" className="sr-only">
          Your wish
        </label>
        <input
          id="fs-wish-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 60))}
          placeholder="I wish…"
          className="h-12 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-white placeholder:text-white/40 focus:border-[var(--bd-accent)] focus:outline-none"
        />
        <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--bd-accent)] px-5 font-bold text-[#1a0b2e]">
          <Send className="size-4" aria-hidden /> Release
        </button>
      </form>
      <div aria-live="polite" className="pointer-events-none absolute inset-0">
        {lanterns.map((l) => (
          <div key={l.id} className="fs-lantern absolute bottom-0 flex flex-col items-center" style={{ left: `${l.x}%` }} onAnimationEnd={() => setLanterns((ls) => ls.filter((x) => x.id !== l.id))}>
            <span className="mb-1 max-w-[9rem] text-xs text-[var(--bd-accent)]">{l.text}</span>
            <span className="block h-14 w-10 rounded-t-[40%] rounded-b-md bg-gradient-to-b from-[#ffb347] to-[#ff7b39] shadow-[0_0_30px_10px_rgb(255_170_70/0.45)]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Finale() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(BULBS);
  const [live, setLive] = useState(false);
  return (
    <section id="fs-finale" aria-labelledby="fs-final-title" className="relative flex min-h-dvh scroll-mt-16 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {!live ? (
        <>
          <p className="text-sm tracking-[0.4em] text-white/60 uppercase">The headline act</p>
          <motion.button
            type="button"
            onClick={() => {
              setLive(true);
              fx.cannons({ colors, count: 260 });
              fx.fireworks({ colors, duration: 5, rockets: 12 });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${fun} mt-8 h-20 rounded-full bg-gradient-to-r from-[var(--bd-primary)] to-[var(--bd-accent)] px-12 text-3xl text-[#1a0b2e] shadow-[0_0_50px_rgb(var(--bd-primary-rgb)/0.6)]`}
          >
            Light up the stage
          </motion.button>
          <h2 id="fs-final-title" className="sr-only">
            Finale
          </h2>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 12 }} role="status" className="relative z-10 flex flex-col items-center">
          <h2 id="fs-final-title" className={`${fun} text-4xl leading-tight sm:text-7xl`}>
            Everyone’s here to
            <br />
            <span className="text-[var(--bd-accent)]">celebrate you!</span>
          </h2>
          <p className={`${fun} mt-4 text-3xl text-[var(--bd-primary)]`}>
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </p>
          <div className="mt-10 grid w-full max-w-3xl gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border-4 border-white/80">
              <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photo of ${name}`} label="Add a final photo" className="aspect-square w-full" />
            </div>
            <div className="flex flex-col justify-center rounded-3xl bg-white/10 p-8 text-left">
              <p className="text-xl leading-relaxed">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <p className="mt-4 text-white/70">{config.messages.final}</p>
            </div>
          </div>
          <button type="button" onClick={restart} className="mt-10 h-11 rounded-full px-6 text-white/60 underline underline-offset-4 hover:text-white">
            Back to the gates
          </button>
        </motion.div>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-40 items-end justify-around px-2">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={i}
            className={cn('fs-glowstick block w-1.5 rounded-full', live ? 'opacity-100' : 'opacity-30')}
            style={{ height: 40 + (i % 5) * 12, background: BULBS[i % BULBS.length], boxShadow: `0 0 12px ${BULBS[i % BULBS.length]}`, animationDelay: `${(i % 7) * 0.15}s` }}
          />
        ))}
      </div>
    </section>
  );
}
