import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { MagneticButton } from '@/components/effects/Interactive';
import { Particles } from '@/components/effects/Particles';
import { EASE } from '@/animations/tokens';

/** ACT 1 — The Surprise. A dark, glowing curtain that opens into the experience. */
export function OpeningExperience() {
  const { config, open, fx, theme } = useExperience();
  const colors = useThemeColors();
  const [leaving, setLeaving] = useState(false);
  const intro = config.messages.intro.trim() || 'A little surprise for you…';

  const handleOpen = () => {
    setLeaving(true);
    fx.cannons({ colors, count: 180 });
    window.setTimeout(open, 650);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#08060f] px-6 text-center"
      initial={{ opacity: 1 }}
      animate={leaving ? { opacity: 0, scale: 1.08, filter: 'blur(12px)' } : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: EASE.inOut }}
    >
      <Particles variant="dust" density={5} colors={['#ffffff', theme.accent]} />
      <motion.div
        aria-hidden
        className="absolute size-[70vmin] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(var(--bd-primary-rgb) / 0.45), transparent 60%)' }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 flex max-w-xl flex-col items-center gap-5">
        <motion.p
          className="text-sm font-medium tracking-[0.3em] text-white/60 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2, ease: EASE.out }}
        >
          {intro}
        </motion.p>
        <motion.h1
          className="font-display text-4xl leading-tight font-light text-balance text-white sm:text-6xl"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 1.8, duration: 1.4, ease: EASE.out }}
        >
          Someone has something <em className="aurora-gradient-text not-italic">special</em> to say.
        </motion.h1>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3.1, type: 'spring', stiffness: 160, damping: 14 }}
        >
          <div className="relative">
            <span
              aria-hidden
              className="absolute -inset-3 animate-pulse rounded-full opacity-70 blur-xl"
              style={{ background: 'linear-gradient(90deg, var(--bd-primary), var(--bd-accent))' }}
            />
            <MagneticButton
              onClick={handleOpen}
              disabled={leaving}
              className="inline-flex h-16 items-center gap-3 rounded-full bg-white px-9 text-base font-bold tracking-[0.14em] text-[#1a1028] uppercase shadow-2xl sm:h-[4.5rem] sm:px-11"
              rippleColor="rgb(var(--bd-primary-rgb) / 0.35)"
            >
              Open your surprise
              <Sparkles className="size-5 text-[var(--bd-primary)]" aria-hidden />
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
