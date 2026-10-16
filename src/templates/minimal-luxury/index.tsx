import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { Lightbox } from '@/components/experience/Lightbox';
import { getMemories, getTimeline, toLightboxItems } from '@/components/experience/content';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { PLACEHOLDER } from '@/data/placeholders';
import { formatBirthday } from '@/utils/date';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const serif = 'font-t-display';
const CREAM = '#f4efe6';
const INK = '#0e0d0b';
const label = 'text-[0.65rem] font-medium tracking-[0.42em] uppercase';

export default function MinimalLuxury() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh text-[#0e0d0b]" style={{ background: CREAM }}>
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && (
        <main>
          <Portrait />
          <Letter />
          <Moments />
          <Index />
          <Candle />
        </main>
      )}
    </div>
  );
}

function Opening() {
  const { config, open } = useExperience();
  const { name } = useBirthdayText();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: CREAM }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: EASE.inOut } }}
    >
      <h1 className={`${serif} overflow-hidden text-[clamp(3.5rem,14vw,11rem)] leading-[0.95]`}>
        <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease: EASE.out, delay: 0.3 }}>
          {config.birthdayPerson.trim() ? name : <span className="bd-placeholder text-[0.45em]">{name}</span>}
        </motion.span>
      </h1>
      <motion.span className="mt-8 block h-px w-24 origin-center bg-[#b8975a]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.4, duration: 1.6, ease: EASE.silk }} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.4 }} className={`${label} mt-8`}>
        {config.messages.intro.trim() || 'Today is your day.'}
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1.2 }}
        className={`${label} group mt-16 inline-flex h-12 items-center gap-3 border-b border-[#0e0d0b]/30 transition-colors hover:border-[#0e0d0b]`}
      >
        Enter <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" aria-hidden />
      </motion.button>
    </motion.div>
  );
}

function Portrait() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const inset = useTransform(scrollYProgress, [0.1, 0.45], [22, 0]);
  const clip = useTransform(inset, (v) => `inset(${v}% ${v * 0.8}% ${v}% ${v * 0.8}%)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);
  const date = formatBirthday(config.birthdayDate, { day: 'numeric', month: 'long', year: undefined });

  return (
    <section ref={ref} aria-label="Portrait" className="relative px-5 pt-28 pb-24 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="flex items-end justify-between gap-6">
          <p className={label}>01 — The Portrait</p>
          {date && <p className={label}>{date}</p>}
        </motion.div>
        <h2 className={`${serif} mt-6 text-[clamp(3rem,10vw,9rem)] leading-[0.9] italic`}>
          Happy Birthday,
          <br />
          <span className="not-italic">
            <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
          </span>
        </h2>
        <motion.div style={{ clipPath: clip }} className="mt-16 overflow-hidden">
          <motion.div style={{ scale }}>
            <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" priority className="aspect-[4/5] w-full bg-[#e8e0d2] sm:aspect-[16/9]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Letter() {
  const { config } = useExperience();
  const paras = splitParagraphs(config.messages.main);
  return (
    <section aria-labelledby="ml-letter" className="px-5 py-28 sm:px-10" style={{ background: INK, color: CREAM }}>
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_2fr]">
        <div className="md:sticky md:top-24 md:self-start">
          <p className={`${label} text-[#e8dcc4]/70`}>02 — The Letter</p>
          <p className={`${serif} mt-6 text-[8rem] leading-none text-[#b8975a]`} aria-hidden>
            02
          </p>
          <h2 id="ml-letter" className="sr-only">
            A letter for you
          </h2>
        </div>
        <div className={`${serif} space-y-10 text-2xl leading-[1.6] sm:text-3xl`}>
          {paras.length === 0 ? (
            <p>
              <Fill value="" placeholder={PLACEHOLDER.message} />
            </p>
          ) : (
            paras.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.6, ease: EASE.silk }}
                className={cn(i === 0 && 'first-letter:float-left first-letter:mr-3 first-letter:text-[5.2rem] first-letter:leading-[0.8] first-letter:text-[#b8975a]')}
              >
                {p}
              </motion.p>
            ))
          )}
          <p className={`${label} pt-6 text-[#e8dcc4]/70`}>
            — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
          </p>
        </div>
      </div>
    </section>
  );
}

const SPANS = [
  'md:col-span-7 md:row-span-2 aspect-[4/5]',
  'md:col-span-5 aspect-[4/3]',
  'md:col-span-5 aspect-square',
  'md:col-span-4 aspect-[3/4]',
  'md:col-span-8 aspect-[16/10]',
  'md:col-span-6 aspect-[4/3]',
];

function Moments() {
  const { config } = useExperience();
  const memories = getMemories(config);
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section aria-labelledby="ml-moments" className="px-5 py-28 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <p className={label}>03 — Moments</p>
        <h2 id="ml-moments" className={`${serif} mt-6 max-w-3xl text-5xl leading-tight italic sm:text-7xl`}>
          Some moments worth remembering.
        </h2>
        <ul className="mt-16 grid gap-6 md:grid-cols-12">
          {memories.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.6, ease: EASE.silk, delay: (i % 2) * 0.15 }}
              className={cn(SPANS[i % SPANS.length].replace(/aspect-\S+/, ''))}
            >
              <button type="button" onClick={() => setIndex(i)} className="group block w-full text-left" aria-label={`View ${m.titleText}`}>
                <div className="overflow-hidden">
                  <PhotoSlot
                    src={m.image}
                    alt={m.titleText}
                    label={m.slotLabel}
                    tone="light"
                    className={cn('w-full bg-[#e8e0d2]', SPANS[i % SPANS.length].match(/aspect-\S+/)?.[0])}
                    imgClassName="grayscale-[0.6] transition-[scale,filter] duration-[1.6s] ease-out group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-4 flex items-baseline gap-4">
                  <span className={`${label} text-[#b8975a]`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="relative">
                    <span className={`${serif} text-xl italic`}>{m.titleText}</span>
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#b8975a] transition-all duration-700 group-hover:w-full" />
                  </span>
                </div>
                <p className="mt-1 pl-10 text-sm text-[#0e0d0b]/60">{m.captionText}</p>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
      <Lightbox items={toLightboxItems(memories)} index={index} onIndexChange={setIndex} captionClassName={`${serif} italic`} />
    </section>
  );
}

function Index() {
  const { config } = useExperience();
  const items = getTimeline(config);
  const fine = useFinePointer();
  const [hover, setHover] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 160, damping: 22 });
  const y = useSpring(useMotionValue(0), { stiffness: 160, damping: 22 });
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  return (
    <section
      aria-labelledby="ml-index"
      className="relative px-5 py-28 sm:px-10"
      onPointerMove={(e) => {
        x.set(e.clientX + 24);
        y.set(e.clientY - 120);
      }}
    >
      <div className="mx-auto max-w-7xl">
        <p className={label}>04 — The Index</p>
        <h2 id="ml-index" className={`${serif} mt-6 text-5xl italic sm:text-7xl`}>
          Our little story.
        </h2>
        <ol className="mt-14 border-t border-[#0e0d0b]/15">
          {items.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1 }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className="group grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-[#0e0d0b]/15 py-8 sm:grid-cols-[5rem_1fr_1fr]"
            >
              <span className={`${serif} text-2xl text-[#b8975a]`}>{roman[i] ?? i + 1}.</span>
              <span className={`${serif} text-3xl transition-transform duration-700 group-hover:translate-x-3 sm:text-5xl`}>{t.titleText}</span>
              <span className="col-start-2 text-[#0e0d0b]/60 sm:col-start-3 sm:text-right">{t.captionText}</span>
              {!fine && t.image && (
                <div className="col-span-2 mt-2 sm:col-span-3">
                  <PhotoSlot src={t.image} alt={t.titleText} tone="light" className="aspect-[16/9] w-full" />
                </div>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
      {fine && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40 w-64 overflow-hidden shadow-2xl"
          style={{ x, y }}
          animate={{ opacity: hover !== null ? 1 : 0, scale: hover !== null ? 1 : 0.9 }}
          transition={{ duration: 0.4 }}
        >
          {hover !== null && <PhotoSlot src={items[hover]?.image} alt="" label="Add a photo" tone="light" className="aspect-[4/5] w-full bg-[#e8e0d2]" />}
        </motion.div>
      )}
    </section>
  );
}

function Candle() {
  const { config, restart } = useExperience();
  const { name } = useBirthdayText();
  const [out, setOut] = useState(false);
  const image = config.finalImage ?? config.heroImage;

  return (
    <motion.section
      aria-labelledby="ml-final"
      animate={{ backgroundColor: out ? '#000000' : INK }}
      transition={{ duration: 2.4 }}
      className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-28 text-center"
      style={{ color: CREAM }}
    >
      <p className={`${label} text-[#e8dcc4]/60`}>05 — The Wish</p>
      <AnimatePresence mode="wait">
        {!out ? (
          <motion.div key="candle" exit={{ opacity: 0, transition: { duration: 1.6, delay: 1 } }} className="flex flex-col items-center">
            <p className={`${serif} mt-8 text-4xl italic sm:text-6xl`}>Close your eyes.</p>
            <button type="button" onClick={() => setOut(true)} aria-label="Blow out the candle" className="group relative mt-16 flex flex-col items-center">
              <span className="absolute -top-16 size-24 rounded-full bg-[radial-gradient(circle,rgb(255_210_140/0.45),transparent_65%)] transition-transform duration-500 group-hover:scale-125" aria-hidden />
              <svg viewBox="0 0 40 60" className="flame h-14 w-10" aria-hidden>
                <path d="M20 2 C 32 22, 30 44, 20 56 C 10 44, 8 22, 20 2 Z" fill="url(#ml-flame)" />
                <defs>
                  <linearGradient id="ml-flame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff6dd" />
                    <stop offset="60%" stopColor="#ffcf73" />
                    <stop offset="100%" stopColor="#e58a2e" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="mt-1 block h-56 w-5 bg-gradient-to-b from-[#f4efe6] to-[#d8cdb8]" aria-hidden />
              <span className={`${label} mt-10 text-[#e8dcc4]/70 transition-colors group-hover:text-[#e8dcc4]`}>Touch the flame</span>
            </button>
          </motion.div>
        ) : (
          <motion.div key="after" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4, delay: 2.2 }} className="flex max-w-3xl flex-col items-center">
            <motion.svg viewBox="0 0 40 120" className="h-28 w-10" aria-hidden initial={{ opacity: 0.8 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 3 }}>
              <path d="M20 120 C 8 90, 32 70, 18 40 S 26 10, 20 0" stroke="#bbb" strokeWidth="1.5" fill="none" />
            </motion.svg>
            <h2 id="ml-final" className={`${serif} text-5xl leading-tight sm:text-7xl`}>
              Happy Birthday,
              <br />
              <em className="text-[#b8975a]">
                <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
              </em>
            </h2>
            <span className="my-10 block h-px w-24 bg-[#b8975a]" />
            <p className={`${serif} text-2xl leading-relaxed italic sm:text-3xl`}>
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <p className="mt-6 text-[#e8dcc4]/70">{config.messages.wish}</p>
            <div className="mt-16 w-full max-w-md overflow-hidden">
              <PhotoSlot src={image} alt={`A final portrait of ${name}`} label="Add a final photo" className="aspect-[4/5] w-full" />
            </div>
            <p className={`${label} mt-12 text-[#e8dcc4]/70`}>
              With love — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
            </p>
            <p className={`${serif} mt-3 text-xl italic text-[#e8dcc4]/80`}>{config.messages.final}</p>
            <button type="button" onClick={restart} className={`${label} mt-14 h-11 text-[#e8dcc4]/50 hover:text-[#e8dcc4]`}>
              Begin again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
