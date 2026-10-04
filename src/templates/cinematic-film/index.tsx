import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { Clapperboard, Film, Play } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const display = 'font-t-display tracking-[0.06em]';
const CHAPTERS = [
  { id: 'cf-ch1', label: 'The Beginning' },
  { id: 'cf-ch2', label: 'The Letter' },
  { id: 'cf-ch3', label: 'Highlights' },
  { id: 'cf-ch4', label: 'Scenes' },
  { id: 'cf-ch5', label: 'The Finale' },
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

export default function CinematicFilm() {
  const { opened } = useExperience();
  return (
    <div className="film-grain relative min-h-dvh bg-[#050505] text-[#ece6da]">
      <AnimatePresence>{!opened && <TitleScreen key="t" />}</AnimatePresence>
      {opened && (
        <>
          <Countdown />
          <main className="relative">
            <ChapterNav />
            <ChapterOne />
            <ChapterLetter />
            <ChapterHighlights />
            <ChapterScenes />
            <Finale />
          </main>
        </>
      )}
    </div>
  );
}

function Letterbox({ visible }: { visible: boolean }) {
  return (
    <>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[55] bg-black" animate={{ height: visible ? '11vh' : 0 }} transition={{ duration: 1.2, ease: EASE.inOut }} />
      <motion.div aria-hidden className="fixed inset-x-0 bottom-0 z-[55] bg-black" animate={{ height: visible ? '11vh' : 0 }} transition={{ duration: 1.2, ease: EASE.inOut }} />
    </>
  );
}

function TitleScreen() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <Letterbox visible />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4 }}
        className="max-w-xl text-xl font-light text-white/80 italic sm:text-2xl"
      >
        {config.messages.intro.trim() || 'Every great story has a beginning.'}
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="group mt-12 inline-flex flex-col items-center gap-3"
        aria-label="Play the film"
      >
        <span className="inline-flex size-20 items-center justify-center rounded-full border border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--bd-primary)] group-hover:bg-[var(--bd-primary)] group-hover:text-black">
          <Play className="size-8 translate-x-0.5 fill-current" aria-hidden />
        </span>
        <span className={`${display} text-lg text-white/70`}>Press play</span>
      </motion.button>
    </motion.div>
  );
}

/** Projector leader countdown + title card, then dissolves into Chapter I. */
function Countdown() {
  const { config, reducedMotion } = useExperience();
  const [step, setStep] = useState(reducedMotion ? 5 : 0);
  useEffect(() => {
    if (step >= 5) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step < 3 ? 850 : 2200);
    return () => window.clearTimeout(t);
  }, [step]);
  if (step >= 5) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" aria-live="polite">
      <Letterbox visible />
      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div key={step} className="relative flex size-64 items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
            <div className="absolute inset-0 rounded-full border-2 border-white/40" />
            <div className="absolute inset-6 rounded-full border border-white/20" />
            <motion.div
              className="absolute top-0 left-1/2 h-1/2 w-0.5 origin-bottom bg-white/70"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, ease: 'linear' }}
            />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
            <span className={`${display} relative text-9xl text-white`}>{3 - step}</span>
          </motion.div>
        ) : step === 3 ? (
          <motion.p key="tag" className={`${display} text-center text-lg text-white/60`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} /> presents
          </motion.p>
        ) : (
          <motion.h1
            key="title"
            className={`${display} px-6 text-center text-6xl text-[var(--bd-accent)] sm:text-8xl`}
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.08em' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: EASE.out }}
          >
            The story of <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChapterNav() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(CHAPTERS.findIndex((c) => c.id === e.target.id))),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="Chapters" className="fixed z-40 max-md:inset-x-0 max-md:bottom-0 max-md:bg-black/80 md:top-1/2 md:right-5 md:-translate-y-1/2">
      <ol className="flex justify-center gap-1 p-2 md:flex-col md:gap-2">
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              aria-current={active === i ? 'true' : undefined}
              className={cn(
                'group flex h-11 items-center gap-3 rounded-full px-3 transition-colors md:flex-row-reverse',
                active === i ? 'text-[var(--bd-primary)]' : 'text-white/40 hover:text-white',
              )}
            >
              <span className={`${display} text-lg`}>{ROMAN[i]}</span>
              <span className="text-xs tracking-[0.2em] uppercase max-md:sr-only md:opacity-0 md:transition-opacity md:group-hover:opacity-100">{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ChapterTitle({ n, title }: { n: number; title: string }) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 1.2 }}
      className="text-center"
    >
      <p className={`${display} text-xl text-[var(--bd-primary)]`}>Chapter {ROMAN[n - 1]}</p>
      <h2 className={`${display} mt-1 text-5xl sm:text-7xl`}>{title}</h2>
    </motion.header>
  );
}

function ChapterOne() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  return (
    <section id="cf-ch1" ref={ref} aria-label="Chapter one: the beginning" className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale }}>
        <motion.div className="h-full w-full" initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.55 }} transition={{ duration: 6, ease: 'easeOut' }}>
          <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" priority className="h-full w-full" />
        </motion.div>
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050505_85%)]" />
      <div className="relative px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.5 }} className={`${display} text-xl text-white/70`}>
          Starring
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 1.6, ease: EASE.out }}
          className={`${display} text-7xl leading-none text-white sm:text-[9rem]`}
        >
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1.5 }}
          className="mt-6 text-lg font-light text-[var(--bd-accent)] italic sm:text-2xl"
        >
          Happy Birthday. Today, the story continues.
        </motion.p>
      </div>
    </section>
  );
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .filter(Boolean);
}

function ChapterLetter() {
  const { config, reducedMotion } = useExperience();
  const lines = sentences(config.messages.main);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setIdx(Math.min(lines.length - 1, Math.max(0, Math.floor(v * lines.length)))));

  if (lines.length === 0 || reducedMotion) {
    return (
      <section id="cf-ch2" className="px-6 py-28">
        <ChapterTitle n={2} title="The Letter" />
        <p className="mx-auto mt-12 max-w-2xl text-center text-2xl leading-relaxed font-light">
          <Fill value={config.messages.main} placeholder={PLACEHOLDER.message} />
        </p>
      </section>
    );
  }

  return (
    <section id="cf-ch2" aria-label="Chapter two: the letter" className="relative">
      <div ref={ref} style={{ height: `${Math.max(2, lines.length) * 70}vh` }}>
        <div className="sticky top-0 flex h-dvh flex-col items-center justify-between px-6 py-[14vh]">
          <ChapterTitle n={2} title="The Letter" />
          <div className="flex min-h-40 items-end">
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-3xl bg-black/70 px-4 py-2 text-center text-2xl leading-snug font-light text-[#fff8e6] sm:text-3xl"
              >
                {lines[idx]}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="sr-only">{config.messages.main}</p>
          <div className="flex gap-1.5" aria-hidden>
            {lines.map((_, i) => (
              <span key={i} className={cn('h-1 w-6 rounded-full transition-colors', i <= idx ? 'bg-[var(--bd-primary)]' : 'bg-white/15')} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChapterHighlights() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section id="cf-ch3" aria-label="Chapter three: highlights" className="py-28">
      <ChapterTitle n={3} title="Highlights" />
      <div className="mt-14 bg-[#111] py-5">
        <div className="mb-3 flex gap-4 overflow-hidden px-3" aria-hidden>
          {Array.from({ length: 60 }, (_, i) => (
            <span key={i} className="h-4 w-6 shrink-0 rounded-sm bg-[#050505]" />
          ))}
        </div>
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[10vw]">
          {memories.map((m, i) => (
            <li key={m.id} className="w-[78vw] shrink-0 snap-center sm:w-[30rem]">
              <button type="button" onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden text-left" aria-label={`Open highlight: ${m.titleText}`}>
                <PhotoSlot
                  src={m.image}
                  alt={m.titleText}
                  label={m.slotLabel}
                  className="aspect-[16/9] w-full"
                  imgClassName="sepia-[0.35] transition-all duration-700 group-hover:scale-110 group-hover:sepia-0"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                  <p className={`${display} text-2xl`}>
                    {String(i + 1).padStart(2, '0')} — {m.titleText}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-4 overflow-hidden px-3" aria-hidden>
          {Array.from({ length: 60 }, (_, i) => (
            <span key={i} className="h-4 w-6 shrink-0 rounded-sm bg-[#050505]" />
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs tracking-[0.3em] text-white/40 uppercase">Swipe the reel · tap a frame</p>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={display} />
    </section>
  );
}

function ChapterScenes() {
  const { config } = useExperience();
  const items = getTimeline(config);
  return (
    <section id="cf-ch4" aria-label="Chapter four: scenes" className="px-5 py-28">
      <ChapterTitle n={4} title="Scenes" />
      <ol className="mx-auto mt-14 grid max-w-6xl gap-8 sm:grid-cols-2">
        {items.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
            whileInView={{ opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE.inOut }}
            className="overflow-hidden rounded-sm bg-[#0e0e0e] ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between bg-[repeating-linear-gradient(-45deg,#ece6da_0_14px,#111_14px_28px)] px-4 py-2">
              <span className={`${display} rounded-sm bg-black px-2 text-sm text-white`}>Scene {String(i + 1).padStart(2, '0')}</span>
              <span className={`${display} rounded-sm bg-black px-2 text-sm text-white`}>Take 1</span>
            </div>
            <PhotoSlot src={t.image} alt={t.titleText} label="Add a photo" className="aspect-[2.2/1] w-full" />
            <div className="p-5">
              <h3 className={`${display} text-3xl`}>{t.titleText}</h3>
              <p className="mt-1 text-white/60 italic">{t.captionText}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Finale() {
  const { config, fx, restart } = useExperience();
  const { name, sender, age, hasAge } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const [rolling, setRolling] = useState(false);
  const [postCredits, setPostCredits] = useState(false);
  const memories = getMemories(config);

  const roll = () => {
    setRolling(true);
    fx.fireworks({ colors, duration: 5, rockets: 12 });
  };

  return (
    <section id="cf-ch5" aria-label="Chapter five: the finale" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-36 text-center">
      <Letterbox visible={rolling && !postCredits} />
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={`${display} text-xl text-[var(--bd-primary)]`}>
        Chapter {ROMAN[4]}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.8, ease: EASE.out }}
        className={`${display} mt-2 text-6xl leading-none sm:text-9xl`}
      >
        Chapter <span className={cn('text-[var(--bd-accent)]', !hasAge && 'bd-placeholder')}>{age}</span>
        <br /> begins now.
      </motion.h2>
      <p className="mt-6 text-lg text-white/60">{config.messages.wish}</p>

      {!rolling ? (
        <button
          type="button"
          onClick={roll}
          className="mt-12 inline-flex h-14 items-center gap-3 rounded-full bg-[var(--bd-primary)] px-8 font-semibold text-black transition-transform hover:scale-105"
        >
          <Clapperboard className="size-5" aria-hidden /> Roll the finale
        </button>
      ) : (
        <div className="relative mt-12 h-[60vh] w-full max-w-xl overflow-hidden [mask-image:linear-gradient(transparent,black_15%,black_85%,transparent)]">
          <motion.div
            initial={{ y: '60vh' }}
            animate={{ y: '-100%' }}
            transition={{ duration: 24, ease: 'linear' }}
            onAnimationComplete={() => setPostCredits(true)}
            className="space-y-10 pb-10"
          >
            <Credit role="Happy Birthday" names={[name]} big />
            <Credit role="Starring" names={[name]} />
            <Credit role="Written & directed by" names={[sender]} />
            <Credit role="With special appearances by" names={memories.map((m) => m.titleText)} />
            <Credit role="Soundtrack" names={[config.music.name ?? 'The sound of everyone cheering']} />
            <Credit role="Filmed on location in" names={['Every place we laughed']} />
            <p className={`${display} text-3xl text-[var(--bd-accent)]`}>{config.messages.final}</p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {rolling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="mt-6">
            {!postCredits ? (
              <button type="button" onClick={() => setPostCredits(true)} className="h-11 px-4 text-xs tracking-[0.3em] text-white/50 uppercase hover:text-white">
                Skip to post-credits scene
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {postCredits && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="mt-10 max-w-2xl">
            <p className={`${display} inline-flex items-center gap-2 text-lg text-[var(--bd-primary)]`}>
              <Film className="size-4" aria-hidden /> Post-credits scene
            </p>
            <p className="mt-4 text-2xl leading-relaxed font-light italic sm:text-3xl">
              “<Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />”
            </p>
            <button type="button" onClick={restart} className={`${display} mt-12 h-11 text-lg text-white/50 hover:text-white`}>
              Watch again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Credit({ role, names, big }: { role: string; names: string[]; big?: boolean }) {
  return (
    <div>
      <p className="text-xs tracking-[0.35em] text-white/50 uppercase">{role}</p>
      {names.map((n, i) => (
        <p key={i} className={cn(display, big ? 'text-6xl text-[var(--bd-accent)]' : 'text-3xl')}>
          {n}
        </p>
      ))}
    </div>
  );
}
