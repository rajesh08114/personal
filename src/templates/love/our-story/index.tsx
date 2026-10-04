import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Heart } from 'lucide-react';
import { useBirthdayText, useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill, Paragraphs } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { getMemories, getTimeline } from '@/components/experience/content';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

const display = 'font-t-display';
const FALLBACK_TITLES = ['The Beginning', 'The First Memory', 'The Crazy Moments', 'The Best Days', 'Today'];

interface Chapter {
  id: string;
  title: string;
  text: string;
  date?: string;
  place?: string;
  image?: string;
}

export default function OurStory() {
  const { opened } = useExperience();
  return (
    <div className="film-grain relative min-h-dvh bg-[#0b0a08] text-[#efe6d6]">
      <AnimatePresence>{!opened && <Opening key="o" />}</AnimatePresence>
      {opened && <Story />}
    </div>
  );
}

function Opening() {
  const { config, open } = useExperience();
  const [line, setLine] = useState(0);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0a08] px-6 text-center" exit={{ opacity: 0, transition: { duration: 1.4 } }}>
      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.4em' }}
        animate={{ opacity: 1, letterSpacing: '0.12em' }}
        transition={{ duration: 2.4, ease: EASE.out }}
        onAnimationComplete={() => setLine(1)}
        className={`${display} text-3xl sm:text-5xl`}
      >
        {config.messages.intro.trim() || 'Every love story has a beginning.'}
      </motion.p>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={line ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.6, delay: 0.4 }} className="mt-6 text-xl italic text-[#c8a96a] sm:text-2xl">
        Ours started with <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />.
      </motion.p>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={line ? { opacity: 1 } : {}}
        transition={{ delay: 1.8, duration: 1 }}
        className="group mt-16 flex flex-col items-center gap-3 text-xs tracking-[0.5em] uppercase"
      >
        <span className="block h-16 w-px origin-top bg-[#c8a96a] transition-transform duration-700 group-hover:scale-y-125" />
        Begin our story
      </motion.button>
    </motion.div>
  );
}

function useChapters(): Chapter[] {
  const { config } = useExperience();
  const timeline = getTimeline(config);
  const memories = getMemories(config).filter((m) => m.hasTitle || m.image);
  const pool = [...timeline, ...memories];
  return FALLBACK_TITLES.map((fallback, i) => {
    const item = pool[i];
    return {
      id: item?.id ?? `ch-${i}`,
      title: item?.title.trim() || fallback,
      text: item?.description.trim() || PLACEHOLDER.timelineCaption,
      date: item?.date,
      place: item?.place,
      image: item?.image,
    };
  });
}

function ChapterScene({ chapter, index }: { chapter: Chapter; index: number }) {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const inset = useTransform(scrollYProgress, [0, 0.55], [index % 2 ? 26 : 30, 0]);
  const clip = useTransform(inset, (v) => `inset(${v}% ${v * 1.1}% ${v}% ${v * 1.1}% round ${v > 1 ? 6 : 0}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const textX = useTransform(scrollYProgress, [0.35, 0.7], [index % 2 ? -80 : 80, 0]);
  const textO = useTransform(scrollYProgress, [0.35, 0.65, 0.95, 1], [0, 1, 1, 0.6]);
  const numY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} aria-label={`Chapter ${index + 1}: ${chapter.title}`} className="relative h-[230vh]">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <motion.div style={reducedMotion ? undefined : { clipPath: clip }} className="absolute inset-0">
          <motion.div style={reducedMotion ? undefined : { scale }} className="h-full w-full">
            <PhotoSlot src={chapter.image} alt={chapter.title} label="Add a chapter photo" className="h-full w-full" imgClassName="brightness-[0.62] saturate-[0.85]" />
          </motion.div>
        </motion.div>
        <motion.span aria-hidden style={{ y: numY }} className={cn(display, 'pointer-events-none absolute top-[8%] text-[28vw] leading-none text-[#c8a96a]/20 sm:text-[18vw]', index % 2 ? 'right-[4%]' : 'left-[4%]')}>
          {String(index + 1).padStart(2, '0')}
        </motion.span>
        <motion.div style={reducedMotion ? undefined : { x: textX, opacity: textO }} className={cn('relative z-10 mx-6 max-w-xl sm:mx-16', index % 2 ? 'ml-auto text-right' : '')}>
          <p className="text-xs tracking-[0.5em] text-[#c8a96a] uppercase">Chapter {String(index + 1).padStart(2, '0')}</p>
          <h2 className={`${display} mt-3 text-5xl leading-none sm:text-7xl`}>{chapter.title}</h2>
          <p className="mt-6 text-xl leading-relaxed italic text-[#efe6d6]/90">{chapter.text}</p>
          {(chapter.date || chapter.place) && (
            <p className="mt-6 text-xs tracking-[0.35em] text-[#efe6d6]/60 uppercase">{[chapter.date, chapter.place].filter(Boolean).join('  ·  ')}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Progress({ progress }: { progress: MotionValue<number> }) {
  const scaleY = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div aria-hidden className="fixed top-1/2 left-4 z-40 h-40 w-px -translate-y-1/2 bg-white/15 max-sm:hidden">
      <motion.div style={{ scaleY }} className="h-full w-full origin-top bg-[#c8a96a]" />
    </div>
  );
}

function Story() {
  const { config, fx, restart } = useExperience();
  const { name } = useBirthdayText();
  const colors = useThemeColors(['#ffffff']);
  const chapters = useChapters();
  const { scrollYProgress } = useScroll();
  const finaleRef = useRef<HTMLElement>(null);
  const { scrollYProgress: fp } = useScroll({ target: finaleRef, offset: ['start end', 'end end'] });
  const finalScale = useTransform(fp, [0, 1], [1.3, 1]);
  const [lit, setLit] = useState(false);

  return (
    <main>
      <Progress progress={scrollYProgress} />
      <section aria-label="Title" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="text-xs tracking-[0.6em] text-[#c8a96a] uppercase">
          A story in six chapters
        </motion.p>
        <motion.h1 initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.4, ease: EASE.out }} className={`${display} mt-6 text-6xl leading-none sm:text-9xl`}>
          <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} /> <span className="text-[#c8a96a]">&</span> <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
        </motion.h1>
        <p className="mt-10 text-sm tracking-[0.4em] text-[#efe6d6]/50 uppercase">Scroll</p>
      </section>

      {chapters.map((c, i) => (
        <ChapterScene key={c.id + i} chapter={c} index={i} />
      ))}

      <section aria-labelledby="os-forever" className="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs tracking-[0.5em] text-[#c8a96a] uppercase">Chapter 06</p>
        <motion.h2 id="os-forever" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1.6 }} className={`${display} mt-3 text-7xl sm:text-9xl`}>
          Forever?
        </motion.h2>
        <Paragraphs value={config.messages.main} placeholder={PLACEHOLDER.message} className="mx-auto mt-10 max-w-2xl space-y-6 text-xl leading-relaxed italic text-[#efe6d6]/85 sm:text-2xl" />
      </section>

      <section ref={finaleRef} aria-labelledby="os-final" className="relative flex min-h-dvh items-end overflow-hidden">
        <motion.div style={{ scale: finalScale }} className="absolute inset-0">
          <PhotoSlot src={config.finalImage ?? config.heroImage} alt={`A final photograph of ${name}`} label="Add a final photo" className="h-full w-full" imgClassName="brightness-[0.55]" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0b0a08] via-transparent to-[#0b0a08]/60" />
        <div className="relative z-10 w-full px-6 pb-20 text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 2 }} className="text-2xl italic sm:text-4xl">
            And this is only the beginning.
          </motion.p>
          {!lit ? (
            <button
              type="button"
              onClick={() => {
                setLit(true);
                fx.rain({ colors, shapes: ['circle'], count: 90, size: 5, duration: 4 });
              }}
              className="mt-10 h-12 border-b border-[#c8a96a] px-2 text-xs tracking-[0.5em] text-[#c8a96a] uppercase"
            >
              Roll the final scene
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6 }} role="status">
              <h2 id="os-final" className={`${display} mt-8 text-6xl leading-none sm:text-8xl`}>
                Happy Birthday, <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
                <Heart className="ml-3 inline size-10 fill-[#c8a96a] text-[#c8a96a]" aria-hidden />
              </h2>
              <p className="mx-auto mt-8 max-w-xl text-lg italic text-[#efe6d6]/80">
                <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
              </p>
              <button type="button" onClick={restart} className="mt-10 h-11 text-xs tracking-[0.4em] text-[#efe6d6]/50 uppercase hover:text-[#efe6d6]">
                Watch it again
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
