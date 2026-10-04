import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { BirthdayCake, DEFAULT_CAKE_SKIN } from '@/components/experience/BirthdayCake';
import { TextReveal } from '@/components/experience/Motion';
import { EASE } from '@/animations/tokens';

/** ACT 4 — The Wish. */
export function CakeSection() {
  const { config, fx } = useExperience();
  const colors = useThemeColors();
  const [wished, setWished] = useState(false);
  const [relight, setRelight] = useState(0);

  const onAllOut = useCallback(() => {
    setWished(true);
    window.setTimeout(() => {
      fx.fireworks({ colors, duration: 4 });
      fx.cannons({ colors, count: 200 });
    }, 350);
  }, [fx, colors]);

  return (
    <section aria-labelledby="aurora-cake-title" className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
      <motion.div
        aria-hidden
        animate={{ opacity: wished ? 1 : 0.35, scale: wished ? 1.2 : 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 m-auto size-[80vmin] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--bd-accent-rgb) / 0.35), transparent 65%)' }}
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <TextReveal id="aurora-cake-title" as="h2" text="Make a wish…" className="font-display text-5xl font-light text-white italic sm:text-7xl" />
        <p className="mt-4 max-w-md text-white/70">Close your eyes, make a wish, then tap each candle — or swipe across the flames.</p>

        <BirthdayCake
          className="mt-10 w-full"
          candles={5}
          skin={{ ...DEFAULT_CAKE_SKIN, sponge: '#f3a9c4', spongeDark: '#c9779a' }}
          onAllOut={onAllOut}
          relightKey={relight}
        />

        <AnimatePresence>
          {wished && (
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: EASE.out }}
              className="mt-6"
              role="status"
            >
              <p className="inline-flex items-center gap-3 font-display text-3xl text-white sm:text-4xl">
                Wish sent into the universe <Sparkles className="size-7 text-[var(--bd-accent)]" aria-hidden />
              </p>
              <p className="mt-3 text-lg text-white/75">{config.messages.wish.trim() || 'May this year be your best one yet.'}</p>
              <button
                type="button"
                onClick={() => {
                  setWished(false);
                  setRelight((n) => n + 1);
                }}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="size-4" aria-hidden /> Light the candles again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
