import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, splitParagraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const serif = 'font-t-display';
const label = 'text-[0.65rem] tracking-[0.42em] uppercase';
const PAST = ['The Day We Met', 'The First Memory', 'The First Laugh', 'The Best Day', 'Today'];

interface Milestone {
  id: string;
  title: string;
  text: string;
  date?: string;
  place?: string;
  image?: string;
  future?: boolean;
}

export default function ForeverTimeline() {
  const { opened } = useExperience();
  return (
    <div className="relative min-h-dvh bg-[#f5efe6] text-[#1a1414]">
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && <Timeline />}
    </div>
  );
}

function Opening() {
  const { config, open } = useExperience();
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5efe6] px-6 text-center" exit={{ opacity: 0, transition: { duration: 1 } }}>
      <motion.span className="block h-px bg-[var(--bd-primary)]" initial={{ width: 0 }} animate={{ width: 'min(70vw, 40rem)' }} transition={{ duration: 2.2, ease: EASE.inOut }} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1.4 }} className={`${serif} mt-10 text-4xl italic sm:text-6xl`}>
        {config.messages.intro.trim() || 'From the day we met…'}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className={`${label} mt-6 text-[#1a1414]/60`}>
        <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> & <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
      </motion.p>
      <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className={`${label} mt-14 h-12 border-b border-[#1a1414]/30 px-1 transition-colors hover:border-[var(--bd-primary)] hover:text-[var(--bd-primary)]`}>
        Follow our timeline
      </motion.button>
    </motion.div>
  );
}

function useMilestones(): Milestone[] {
  const { config } = useExperience();
  const pool = [...getTimeline(config), ...getMemories(config).filter((m) => m.hasTitle || m.image)];
  const paras = splitParagraphs(config.messages.main);
  const past = PAST.map((fallback, i) => {
    const item = pool[i];
    return { id: item?.id ?? `p${i}`, title: item?.title.trim() || fallback, text: item?.description.trim() || PLACEHOLDER.timelineCaption, date: item?.date, place: item?.place, image: item?.image };
  });
  return [
    ...past,
    { id: 'tomorrow', title: 'Tomorrow', text: 'Every adventure we haven’t had yet.', future: true },
    { id: 'forever', title: 'Forever', text: paras[0] ?? PLACEHOLDER.message, future: true },
  ];
}

function MilestoneRow({ m, index }: { m: Milestone; index: number }) {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const focus = useTransform(scrollYProgress, [0.2, 0.45, 0.55, 0.8], [0, 1, 1, 0]);
  const scale = useTransform(focus, [0, 1], [0.86, 1]);
  const opacity = useTransform(focus, [0, 1], [0.35, 1]);
  const clip = useTransform(focus, (f) => `inset(${(1 - f) * 18}% ${(1 - f) * 18}% ${(1 - f) * 18}% ${(1 - f) * 18}%)`);
  const dotScale = useTransform(focus, [0, 1], [0.6, 1.6]);
  const left = index % 2 === 0;

  return (
    <li ref={ref} className="relative grid min-h-[80dvh] items-center py-10 md:grid-cols-2 md:gap-20">
      <motion.span
        aria-hidden
        style={reducedMotion ? undefined : { scale: dotScale }}
        className="absolute top-1/2 left-4 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bd-primary)] ring-8 ring-[#f5efe6] md:left-1/2"
      />
      <motion.div style={reducedMotion ? undefined : { scale, opacity }} className={cn('pl-12 md:pl-0', left ? 'md:col-start-1 md:text-right' : 'md:col-start-2')}>
        <p className={`${label} text-[var(--bd-primary)]`}>{m.date ?? (m.future ? 'Yet to come' : '—')}</p>
        <h2 className={`${serif} mt-3 text-5xl leading-none sm:text-7xl`}>{m.title}</h2>
        <p className="mt-5 text-lg leading-relaxed text-[#1a1414]/75">{m.text}</p>
        {m.place && <p className={`${label} mt-4 text-[#1a1414]/50`}>{m.place}</p>}
      </motion.div>
      {!m.future && (
        <motion.div style={reducedMotion ? undefined : { clipPath: clip, opacity }} className={cn('mt-8 pl-12 md:mt-0 md:pl-0', left ? 'md:col-start-2 md:row-start-1' : 'md:col-start-1 md:row-start-1')}>
          <PhotoSlot src={m.image} alt={m.title} label="Add a photo" tone="light" className="aspect-[4/5] w-full bg-[#e8e0d3]" />
        </motion.div>
      )}
    </li>
  );
}

function Timeline() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const milestones = useMilestones();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start center', 'end center'] });
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const [ended, setEnded] = useState(false);

  return (
    <main>
      <section aria-label="Happy birthday" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, clipPath: 'inset(50% 0 50% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0% 0 0% 0)' }} transition={{ duration: 1.8, ease: EASE.inOut }} className="w-[min(70vw,22rem)]">
          <PhotoSlot src={config.heroImage} alt={`Portrait of ${name}`} label="Add your hero photo" tone="light" priority className="aspect-[4/5] w-full bg-[#e8e0d3]" />
        </motion.div>
        <h1 className={`${serif} mt-10 text-5xl leading-tight sm:text-7xl`}>
          Happy Birthday, <em className="text-[var(--bd-primary)]"><Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /></em>
        </h1>
        <p className={`${label} mt-6 text-[#1a1414]/50`}>Our timeline · scroll</p>
      </section>

      <ol ref={listRef} className="relative mx-auto max-w-6xl px-5" aria-label="Our timeline">
        <span aria-hidden className="absolute top-0 bottom-0 left-9 w-px bg-[#1a1414]/15 md:left-1/2" />
        <motion.span aria-hidden style={{ scaleY: grow }} className="absolute top-0 bottom-0 left-9 w-px origin-top bg-[var(--bd-primary)] md:left-1/2" />
        {milestones.map((m, i) => (
          <MilestoneRow key={m.id} m={m} index={i} />
        ))}
      </ol>

      <section aria-labelledby="ft-final" className="relative overflow-hidden px-6 pt-10 pb-28 text-center">
        <div aria-hidden className="relative mx-auto h-56 w-px">
          <span className="absolute inset-0 bg-gradient-to-b from-[var(--bd-primary)] to-transparent" />
          <motion.span className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-[var(--bd-primary)]" animate={{ top: ['0%', '100%'], opacity: [1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeIn' }} />
        </div>
        <motion.h2 id="ft-final" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 1.8 }} className={`${serif} mt-6 text-4xl italic sm:text-6xl`}>
          This story doesn’t end here.
        </motion.h2>
        {!ended ? (
          <button
            type="button"
            onClick={() => {
              setEnded(true);
              fx.rain({ colors, shapes: ['circle'], count: 70, size: 6, duration: 4 });
            }}
            className={`${label} mt-12 h-12 bg-[var(--bd-primary)] px-8 text-[#f5efe6]`}
          >
            Write the next chapter
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }} role="status" className="mx-auto mt-10 max-w-xl">
            <p className="text-xl leading-relaxed">
              <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
            </p>
            <p className={`${serif} mt-6 text-3xl text-[var(--bd-primary)]`}>
              Happy Birthday — <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
            </p>
            <button type="button" onClick={restart} className={`${label} mt-10 h-11 text-[#1a1414]/50 hover:text-[#1a1414]`}>
              Back to the day we met
            </button>
          </motion.div>
        )}
      </section>
    </main>
  );
}
