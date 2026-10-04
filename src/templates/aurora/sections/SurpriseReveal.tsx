import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Gift, Heart } from 'lucide-react';
import { useExperience, useThemeColors } from '@/components/experience/ExperienceContext';
import { Fill } from '@/components/experience/Fill';
import { MagneticButton } from '@/components/effects/Interactive';
import { PLACEHOLDER } from '@/data/placeholders';
import { EASE } from '@/animations/tokens';
import { cn } from '@/utils/cn';

type Stage = 'closed' | 'shaking' | 'open';

/** ACT 5 — The Final Surprise: a 3D gift box that bursts open. */
export function SurpriseReveal() {
  const { config, fx } = useExperience();
  const colors = useThemeColors();
  const [stage, setStage] = useState<Stage>('closed');

  const reveal = () => {
    if (stage !== 'closed') return;
    setStage('shaking');
    window.setTimeout(() => {
      setStage('open');
      fx.confetti({ x: 0.5, y: 0.55, count: 220, spread: 120, colors });
      fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2, count: 24, shape: 'heart', colors, speed: 420 });
    }, 650);
  };

  return (
    <section aria-labelledby="aurora-surprise-title" className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
      <motion.div
        animate={stage === 'open' ? { scale: 1 } : { scale: 1 }}
        className="relative mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.h2
          id="aurora-surprise-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE.out }}
          className="font-display text-4xl font-light text-white italic sm:text-6xl"
        >
          Wait… there’s one more thing.
        </motion.h2>

        <div className="gift-scene relative mt-14 flex h-[22rem] w-full items-center justify-center sm:h-[26rem]">
          <AnimatePresence>
            {stage === 'open' && (
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: EASE.out }}
                className="gift-rays absolute size-[44rem] rounded-full"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {stage !== 'open' ? (
              <motion.button
                key="box"
                type="button"
                onClick={reveal}
                aria-label="Open the gift"
                exit={{ scale: 1.3, opacity: 0, filter: 'blur(8px)', transition: { duration: 0.5 } }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn('gift-box relative size-52 sm:size-60', stage === 'shaking' && 'gift-shake')}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[72%] rounded-2xl shadow-[0_30px_60px_-15px_rgb(var(--bd-primary-rgb)/0.7)]"
                  style={{ background: 'linear-gradient(135deg, var(--bd-primary), var(--bd-secondary))' }}
                />
                <span aria-hidden className="absolute bottom-0 left-1/2 h-[72%] w-8 -translate-x-1/2 bg-[var(--bd-accent)]" />
                <motion.span
                  aria-hidden
                  animate={stage === 'shaking' ? { y: -18, rotate: -8 } : { y: 0, rotate: 0 }}
                  className="absolute inset-x-[-6%] top-[18%] h-[16%] rounded-xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--bd-primary), var(--bd-secondary))' }}
                >
                  <span className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-[var(--bd-accent)]" />
                  <span className="absolute -top-10 left-1/2 flex -translate-x-1/2 gap-1">
                    <span className="block h-10 w-12 rounded-[60%_40%_50%_50%] border-[7px] border-[var(--bd-accent)] -rotate-[25deg]" />
                    <span className="block h-10 w-12 rounded-[40%_60%_50%_50%] border-[7px] border-[var(--bd-accent)] rotate-[25deg]" />
                  </span>
                </motion.span>
              </motion.button>
            ) : (
              <motion.article
                key="card"
                initial={{ opacity: 0, y: 80, rotateX: -50, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.15 }}
                className="relative z-10 max-w-xl rounded-[2rem] bg-white/95 p-8 text-[#1b1430] shadow-[0_40px_100px_-20px_rgb(var(--bd-primary-rgb)/0.7)] sm:p-12"
                role="status"
              >
                <Heart className="mx-auto size-8 fill-[var(--bd-primary)] text-[var(--bd-primary)]" aria-hidden />
                <p className="mt-5 font-display text-2xl leading-relaxed italic sm:text-3xl">
                  <Fill value={config.messages.surprise} placeholder={PLACEHOLDER.surprise} />
                </p>
                <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-[#1b1430]/60 uppercase">
                  <Fill value={config.senderName} placeholder={PLACEHOLDER.sender} />
                </p>
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {stage !== 'open' && (
          <MagneticButton
            onClick={reveal}
            disabled={stage !== 'closed'}
            className="mt-4 inline-flex h-14 items-center gap-3 rounded-full px-8 font-bold tracking-[0.16em] text-white uppercase shadow-[0_0_40px_rgb(var(--bd-primary-rgb)/0.6)]"
            style={{ background: 'linear-gradient(90deg, var(--bd-primary), var(--bd-secondary))' }}
          >
            Reveal surprise <Gift className="size-5" aria-hidden />
          </MagneticButton>
        )}
      </motion.div>
    </section>
  );
}
