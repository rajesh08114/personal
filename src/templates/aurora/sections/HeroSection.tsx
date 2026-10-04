import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { CakeSlice, ChevronDown, Heart, Sparkles, Star } from 'lucide-react';
import { useBirthdayText, useExperience } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { PhotoSlot } from '@/components/experience/PhotoSlot';
import { PLACEHOLDER } from '@/data/placeholders';
import { formatBirthday } from '@/utils/date';
import { EASE } from '@/animations/tokens';
import { useFinePointer } from '@/hooks/useMediaQuery';

const DECOR = [
  { Icon: Sparkles, className: '-top-4 left-2 size-7 text-[var(--bd-accent)]', delay: 0 },
  { Icon: Heart, className: 'top-10 -right-6 size-6 text-[var(--bd-primary)] fill-current', delay: 0.8 },
  { Icon: Star, className: '-bottom-2 -left-6 size-5 text-white fill-current', delay: 1.6 },
  { Icon: Sparkles, className: 'bottom-8 -right-3 size-5 text-white', delay: 2.2 },
  { Icon: Heart, className: '-top-8 right-16 size-4 text-[var(--bd-accent)] fill-current', delay: 1.1 },
];

/** ACT 2 — The Birthday. */
export function HeroSection() {
  const { config } = useExperience();
  const { name } = useBirthdayText();
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const date = formatBirthday(config.birthdayDate);

  return (
    <section
      ref={ref}
      aria-label="Happy birthday"
      className="relative flex min-h-dvh items-center overflow-hidden px-5 pt-24 pb-16 sm:px-8"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div style={{ y: textY, opacity: fade }} className="text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: EASE.out }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-bold tracking-[0.28em] text-white/85 uppercase"
          >
            <Sparkles className="size-3.5 text-[var(--bd-accent)]" aria-hidden />
            Today is your special day
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.4, duration: 1.2, ease: EASE.out }}
            className="mt-6 font-display text-5xl leading-[1.02] font-light tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            Happy Birthday,
            <span className="mt-2 block font-normal italic">
              <span className="aurora-gradient-text">
                <Fill value={config.birthdayPerson} placeholder={PLACEHOLDER.name} />
              </span>
              <CakeSlice className="ml-3 inline size-10 -translate-y-2 text-[var(--bd-accent)] sm:size-14" aria-hidden />
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mx-auto mt-8 max-w-md space-y-2 text-lg text-white/75 sm:text-xl lg:mx-0"
          >
            <p>Today isn’t just another day…</p>
            <p className="font-display text-2xl text-white italic sm:text-3xl">It’s the day someone amazing was born.</p>
          </motion.div>
          {date && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6 text-xs font-semibold tracking-[0.3em] text-white/50 uppercase"
            >
              {date}
            </motion.p>
          )}
        </motion.div>

        <motion.div style={{ y: photoY }} className="relative mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1.4, ease: EASE.out }}
            className="relative animate-float"
          >
            <motion.div
              style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
              onPointerMove={(e) => {
                if (!fine) return;
                const r = e.currentTarget.getBoundingClientRect();
                ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
                rx.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
              }}
              onPointerLeave={() => {
                rx.set(0);
                ry.set(0);
              }}
              whileHover={{ scale: 1.03 }}
              className="relative size-[min(78vw,22rem)] sm:size-[24rem]"
            >
              <div
                aria-hidden
                className="absolute -inset-10 rounded-full opacity-60 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgb(var(--bd-primary-rgb) / 0.8), transparent 65%)' }}
              />
              <div aria-hidden className="aurora-ring absolute -inset-[5px] rounded-full" />
              <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-[#120d24] bg-[#120d24]">
                <PhotoSlot
                  src={config.heroImage}
                  alt={`Portrait of ${name}`}
                  label="Add your hero photo"
                  sublabel="Their best smile goes here"
                  priority
                  className="h-full w-full rounded-full"
                />
              </div>
            </motion.div>
            {DECOR.map(({ Icon, className, delay }, i) => (
              <motion.span
                key={i}
                aria-hidden
                className={`absolute ${className}`}
                animate={{ y: [0, -10, 0], rotate: [0, 12, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
              >
                <Icon className="h-full w-full" />
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#aurora-message"
        aria-label="Scroll to your message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 2 }, y: { duration: 2, repeat: Infinity } }}
        className="absolute bottom-6 left-1/2 inline-flex size-11 -translate-x-1/2 items-center justify-center rounded-full text-white/60 hover:text-white"
      >
        <ChevronDown className="size-6" aria-hidden />
      </motion.a>
    </section>
  );
}
