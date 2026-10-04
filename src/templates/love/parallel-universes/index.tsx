import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { Particles } from '@/components/effects/Particles';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';
import './universes.css';

const disp = 'font-t-display';

const WORLDS = [
  { name: 'The Day We Met', bg: 'radial-gradient(ellipse at 30% 20%, #ff9e6b, #6b1d2a 55%, #12050a)', orb: 'from-[#ffd29a] via-[#ff9e6b] to-[#c2410c]', particle: 'embers' as const, colors: ['#ffd29a', '#ff9e6b'] },
  { name: 'Our Funniest Memory', bg: 'radial-gradient(ellipse at 70% 30%, #ff9ad5, #3b1a5c 55%, #0a0618)', orb: 'from-[#ff9ad5] via-[#f472b6] to-[#5ee7df]', particle: 'bubbles' as const, colors: ['#ff9ad5', '#5ee7df'] },
  { name: 'Our Best Day', bg: 'radial-gradient(ellipse at 50% 80%, #38bdf8, #0b2a5c 55%, #020814)', orb: 'from-[#bae6fd] via-[#38bdf8] to-[#1d4ed8]', particle: 'dust' as const, colors: ['#bae6fd', '#ffffff'] },
  { name: 'The Life We Imagine', bg: 'radial-gradient(ellipse at 50% 20%, #a78bfa, #2a1660 55%, #07031a)', orb: 'from-[#ddd6fe] via-[#a78bfa] to-[#6d28d9]', particle: 'stars' as const, colors: ['#ddd6fe', '#5ee7df'] },
];

interface Entry {
  title: string;
  text: string;
  image?: string;
  date?: string;
  place?: string;
}

function useEntries(): Entry[] {
  const { config } = useExperience();
  const t = getTimeline(config);
  const m = getMemories(config);
  const paras = splitParagraphs(config.messages.main);
  const pick = (x?: { titleText: string; captionText: string; image?: string; date?: string; place?: string }): Entry => ({ title: x?.titleText ?? PLACEHOLDER.memoryTitle, text: x?.captionText ?? PLACEHOLDER.memoryCaption, image: x?.image, date: x?.date, place: x?.place });
  return [pick(t[0]), pick(m[1] ?? m[0]), pick(m[3] ?? m[0]), { title: 'The life we imagine', text: paras[paras.length - 1] ?? PLACEHOLDER.message, image: config.finalImage ?? config.heroImage }];
}

export default function ParallelUniverses() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#05030d] text-white">
      <AnimatePresence>{!opened && <Rift key="r" />}</AnimatePresence>
      {opened && <Multiverse />}
    </div>
  );
}

function Rift() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#05030d] px-6 text-center" exit={{ opacity: 0, scale: 1.3, filter: 'blur(12px)', transition: { duration: 1 } }}>
      <div aria-hidden className="pu-rift absolute size-[60vmin] rounded-full" />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className={`${disp} relative text-xs tracking-[0.5em] text-white/60`}>
        A THEORY OF EVERYTHING
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.6 }} className={`${disp} relative mt-6 max-w-3xl text-3xl leading-tight font-light sm:text-5xl`}>
        {config.messages.intro.trim() || 'In every universe, I would still choose you.'}
      </motion.h1>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className={`${disp} relative mt-14 h-13 rounded-full border border-white/30 bg-white/5 px-9 text-xs tracking-[0.4em] backdrop-blur transition-colors hover:bg-white hover:text-[#05030d]`}>
        STEP THROUGH
      </motion.button>
    </motion.div>
  );
}

function Multiverse() {
  const { config, fx, restart } = useExperience();
  const colors = useThemeColors(['#ffffff']);
  const entries = useEntries();
  const [world, setWorld] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [stage, setStage] = useState<'map' | 'collapsing' | 'out' | 'choose'>('map');

  const enter = (i: number) => {
    setWorld(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const collapse = () => {
    setWorld(null);
    setStage('collapsing');
    window.setTimeout(() => setStage('out'), 2200);
    window.setTimeout(() => {
      setStage('choose');
      fx.fireworks({ colors, duration: 4, rockets: 9 });
    }, 5200);
  };

  const backgrounds = ['radial-gradient(ellipse at 50% 40%, #1b1035, #05030d 70%)', ...WORLDS.map((w) => w.bg)];
  const activeBg = world === null ? 0 : world + 1;

  return (
    <main className="relative z-10 min-h-dvh">
      {backgrounds.map((b, i) => (
        <motion.div key={i} aria-hidden className="fixed inset-0" style={{ background: b }} initial={false} animate={{ opacity: activeBg === i ? 1 : 0 }} transition={{ duration: 1.4 }} />
      ))}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <Particles key={world ?? 'map'} variant={world !== null ? WORLDS[world].particle : 'stars'} density={world !== null ? 5 : 8} colors={world !== null ? WORLDS[world].colors : ['#ffffff', '#c4b5fd']} />
      </div>

      <AnimatePresence mode="wait">
        {world === null && stage === 'map' && (
          <motion.section key="map" aria-labelledby="pu-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.4, filter: 'blur(10px)' }} transition={{ duration: 0.9 }} className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-20 text-center">
            <h1 id="pu-map" className={`${disp} text-3xl font-light sm:text-5xl`}>
              Happy Birthday, <span className="font-bold"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></span>
            </h1>
            <p className="mt-3 text-white/60">Four universes. Four versions of us. Step into each one.</p>
            <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
              {WORLDS.map((w, i) => (
                <li key={w.name}>
                  <motion.button
                    type="button"
                    onClick={() => enter(i)}
                    aria-label={`Enter universe ${i + 1}: ${w.name}`}
                    className="group flex flex-col items-center gap-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className={cn('pu-orb relative block size-28 rounded-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 sm:size-36', w.orb)}>
                      <span className="absolute inset-[18%] overflow-hidden rounded-full opacity-80 mix-blend-luminosity">
                        <PhotoSlot src={entries[i].image} alt="" label=" " className="h-full w-full rounded-full" />
                      </span>
                      {visited.includes(i) && <span className="absolute -top-1 -right-1 size-4 rounded-full bg-white shadow-[0_0_12px_white]" aria-hidden />}
                    </span>
                    <span className={`${disp} text-[0.65rem] tracking-[0.3em] text-white/50`}>UNIVERSE {String(i + 1).padStart(2, '0')}</span>
                    <span className="-mt-3 max-w-[10rem] text-sm">{w.name}</span>
                  </motion.button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={collapse} className={cn(`${disp} mt-16 h-13 rounded-full px-9 text-xs tracking-[0.4em] transition-colors`, visited.length >= 2 ? 'bg-white text-[#05030d]' : 'border border-white/25 text-white/70 hover:border-white')}>
              COLLAPSE THE UNIVERSES
            </button>
          </motion.section>
        )}

        {world !== null && (
          <motion.section key={`w${world}`} aria-label={`Universe ${world + 1}: ${WORLDS[world].name}`} initial={{ opacity: 0, scale: 0.6, filter: 'blur(20px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.3, filter: 'blur(14px)' }} transition={{ duration: 0.9, ease: EASE.out }} className="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-5 py-20">
            <p className={`${disp} text-xs tracking-[0.4em] text-white/60`}>UNIVERSE {String(world + 1).padStart(2, '0')}</p>
            <h2 className={`${disp} mt-3 text-4xl font-bold sm:text-6xl`}>{WORLDS[world].name}</h2>
            <div className="mt-10 grid items-center gap-10 md:grid-cols-[1fr_1fr]">
              <div className="relative mx-auto aspect-square w-[min(80vw,24rem)]">
                <span aria-hidden className={cn('pu-orb absolute inset-0 rounded-full bg-gradient-to-br', WORLDS[world].orb)} />
                <div className="absolute inset-[7%] overflow-hidden rounded-full border border-white/40">
                  <PhotoSlot src={entries[world].image} alt={entries[world].title} label="Add a photo" className="h-full w-full" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-medium">{entries[world].title}</h3>
                {(entries[world].date || entries[world].place) && <p className="mt-2 text-xs tracking-[0.3em] text-white/60 uppercase">{[entries[world].date, entries[world].place].filter(Boolean).join(' · ')}</p>}
                <p className="mt-5 text-2xl leading-relaxed font-light">{entries[world].text}</p>
                <p className="mt-6 text-white/60 italic">…and in this universe too, it was you.</p>
              </div>
            </div>
            <nav aria-label="Travel between universes" className="mt-14 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setWorld(null)} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm">
                <ArrowLeft className="size-4" aria-hidden /> Back to the multiverse
              </button>
              {world < WORLDS.length - 1 ? (
                <button type="button" onClick={() => enter(world + 1)} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#05030d]">
                  Jump to universe {String(world + 2).padStart(2, '0')} <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={collapse} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#05030d]">
                  Collapse all universes <ArrowRight className="size-4" aria-hidden />
                </button>
              )}
            </nav>
          </motion.section>
        )}

        {stage !== 'map' && world === null && (
          <motion.section key="end" aria-labelledby="pu-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
            <div className="relative h-48 w-full max-w-lg" aria-hidden>
              {WORLDS.map((w, i) => (
                <motion.span
                  key={w.name}
                  className={cn('pu-orb absolute top-1/2 left-1/2 size-20 rounded-full bg-gradient-to-br', w.orb)}
                  initial={{ x: `${(i - 1.5) * 160}%`, y: '-50%', opacity: 1, scale: 1 }}
                  animate={{ x: '-50%', y: '-50%', scale: stage === 'collapsing' ? 0.6 : 0, opacity: stage === 'collapsing' ? 1 : 0 }}
                  transition={{ duration: 2, ease: EASE.inOut }}
                />
              ))}
              <motion.span className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_120px_60px_rgb(196_181_253/0.6)]" initial={{ scale: 0, opacity: 0 }} animate={{ scale: stage === 'collapsing' ? 0 : 1, opacity: stage === 'collapsing' ? 0 : 1 }} transition={{ duration: 1.2, delay: stage === 'out' ? 0 : 0 }} />
            </div>
            <AnimatePresence>
              {(stage === 'out' || stage === 'choose') && (
                <motion.p key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }} className={`${disp} mt-10 text-2xl font-light sm:text-4xl`}>
                  Out of every possible universe…
                </motion.p>
              )}
              {stage === 'choose' && (
                <motion.div key="choose" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE.out }} role="status">
                  <h2 id="pu-final" className={`${disp} mt-6 text-4xl font-bold sm:text-6xl`}>
                    I’d still choose you.
                  </h2>
                  <p className="mt-6 text-lg text-white/75">
                    Happy birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />. <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
                  </p>
                  <p className="mt-3 text-sm text-white/50">— {config.senderName.trim() || PLACEHOLDER.sender}, in this universe and every other</p>
                  <button type="button" onClick={restart} className={`${disp} mt-10 h-11 text-xs tracking-[0.4em] text-white/50 hover:text-white`}>
                    OPEN THE RIFT AGAIN
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
